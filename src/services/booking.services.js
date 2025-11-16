import sendMail from "@/utlis/sendMail";
import config from "@/config/env";
import { Booking } from "@/models/booking.model";
import { Guest } from "@/models/guest.model";
import { ServerError } from "@/utlis/ServerError";

export class BookingServices {
    constructor(userId) {
        this.user = userId;
    }

    async postBookingToDB(bookingData) {
        try {
            const { room, checkIn, checkOut, totalAmount, paidAmount, guests } = bookingData;

            if (!guests || !guests.length) {
                throw new ServerError("At least one guest is required", 400);
            }

            const allGuestDocs = [];

            // 🔹 Step 1: Validate or create guests
            for (const g of guests) {
                const existingFilter = { email: g.email, contactNumber: g.contactNumber, cnic: g.cnic };
                const existing = await Guest.isGuestExists(this.user, existingFilter);

                if (existing) {
                    if (
                        existing.email !== g.email ||
                        existing.contactNumber !== g.contactNumber ||
                        existing.cnic !== g.cnic
                    ) {
                        throw new ServerError(
                            `Guest data conflict for ${g.fullName}. Please verify credentials.`,
                            409
                        );
                    }

                    const bookingDates = { checkIn, checkOut };
                    const alreadyBooked = await Guest.isGuestBooked(this.user, bookingDates, existingFilter);

                    if (alreadyBooked) {
                        throw new ServerError(
                            `Guest ${g.fullName} already has an active booking overlapping this date range.`,
                            409
                        );
                    }

                    allGuestDocs.push(existing);
                } else {
                    const newGuest = await Guest.create({ ...g, user: this.user });
                    allGuestDocs.push(newGuest);
                }
            }

            // 🔹 Step 4: Create booking
            const result = await Booking.create({
                user: this.user,
                room,
                checkIn,
                checkOut,
                totalAmount,
                paidAmount,
                guests: allGuestDocs.map((g) => g._id),
            });

            if (!result) throw new ServerError("Could not create booking", 400);

            // 🔹 Step 5: Confirmation email
            const primaryGuest = allGuestDocs.find((g) => !!g.isPrimaryGuest);
            if (primaryGuest?.email) {
                try {
                    const info = await sendMail({
                        from: `"Hotel Redisons" <${config.email_user}>`,
                        to: primaryGuest.email,
                        subject: "Booking Confirmed",
                        text: `Dear ${primaryGuest.fullName}, your booking from ${new Date(
                            checkIn
                        ).toDateString()} to ${new Date(checkOut).toDateString()} has been confirmed.`,
                        html: `<p>Dear <strong>${primaryGuest.fullName}</strong>,</p>
                   <p>Your booking from <b>${new Date(checkIn).toDateString()}</b> 
                   to <b>${new Date(checkOut).toDateString()}</b> has been confirmed.</p>
                   <p>Thank you for choosing <b>Hotel Redisons</b>.</p>`,
                    });

                    if (info?.messageId) console.log("📧 Confirmation email sent:", info.messageId);
                } catch (mailErr) {
                    console.warn("⚠️ Email sending failed:", mailErr.message);
                }
            }

            return result;
        } catch (err) {
            console.error("Booking Error:", err);
            if (err instanceof ServerError) throw err;
            throw new ServerError(err.message || "Booking failed", 500);
        }
    }

    // concerned function
    async getAllBookingsFromDB(filters = {}) {
        try {
            const query = { user: this.user };

            // Apply filters if provided
            if (filters.status) query.status = filters.status;
            if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

            const result = await Booking.find(query)
                .populate("room")
                .populate("guests")
                .sort({ createdAt: -1 });

            if (!result?.length) throw new ServerError("No bookings found", 404);
            return result;
        } catch (error) {
            if (error instanceof ServerError) throw error;
            throw new ServerError(error.message || "Failed to fetch bookings", 500);
        }
    }

    async getSingleBookingFromDB(_id) {
        const result = await Booking.findOne({ _id, user: this.user }).populate("room").populate("guests");
        if (!result) throw new ServerError("Booking not found", 404);
        return result;
    }

    async updateBookingInDB(_id, updates) {
        // Ensure we have the current booking to use its dates when needed
        const existingBooking = await Booking.findOne({ _id, user: this.user });
        if (!existingBooking) throw new ServerError("Booking not found", 404);

        const updatePayload = { ...updates };

        // If guests provided, allow objects (new guest data) or ids.
        if (Array.isArray(updates.guests)) {
            const processedGuestIds = []; // to collect final guest IDs

            // Determine effective checkIn/checkOut for overlap checks
            const effectiveCheckIn = updates.checkIn ? new Date(updates.checkIn) : existingBooking.checkIn;
            const effectiveCheckOut = updates.checkOut ? new Date(updates.checkOut) : existingBooking.checkOut;

            for (const g of updates.guests) {
                // If it's already an id/string, accept as-is (will be validated by Mongo)
                if (typeof g === 'string' || g instanceof Object && (g._id || g.id) && !(g.fullName || g.email || g.contactNumber || g.cnic)) {
                    const id = typeof g === 'string' ? g : (g._id || g.id);
                    processedGuestIds.push(id);
                    continue;
                }

                // Otherwise expect a guest object with required fields
                const guestObj = g;
                const existingFilter = { email: guestObj.email, contactNumber: guestObj.contactNumber, cnic: guestObj.cnic };
                const existing = await Guest.isGuestExists(this.user, existingFilter);

                if (existing) {
                    // Check overlapping bookings for this existing guest excluding the current booking
                    const overlap = await Booking.findOne({
                        _id: { $ne: existingBooking._id },
                        guests: { $in: [existing._id] },
                        $or: [
                            { checkIn: { $lt: effectiveCheckOut }, checkOut: { $gt: effectiveCheckIn } },
                        ],
                        status: { $ne: 'Cancelled' },
                    });

                    if (overlap) {
                        throw new ServerError(
                            `Guest ${guestObj.fullName || existing.fullName} already has an active booking overlapping this date range.`,
                            409
                        );
                    }

                    processedGuestIds.push(existing._id);
                } else {
                    // If one primary guest is being added, ensure no other primary guest exists
                    if (guestObj.isPrimaryGuest) {
                        // If existing booking already has a primary guest, prevent adding another
                        const primaryExistsAlready = await Guest.findOne({
                            _id: { $in: existingBooking.guests },
                            isPrimaryGuest: true,
                        });
                        if (primaryExistsAlready) {
                            throw new ServerError("Only one primary guest is allowed per user.", 400);
                        }
                    }
                    // Create new guest document
                    const newGuest = await Guest.create({ ...guestObj, user: this.user });
                    processedGuestIds.push(newGuest._id);
                }
            }

            updatePayload.guests = processedGuestIds;
        }

        const result = await Booking.findOneAndUpdate({ _id, user: this.user }, updatePayload, { new: true, runValidators: true }).populate('room').populate('guests');
        if (!result) throw new ServerError("Booking not found", 404);

        return result;
    }

    async deleteBookingFromDB(_id) {
        const result = await Booking.findOneAndDelete({ _id, user: this.user });
        if (!result) throw new ServerError("Booking not found", 404);
        return result;
    }
};

export const bookingServices = new BookingServices();