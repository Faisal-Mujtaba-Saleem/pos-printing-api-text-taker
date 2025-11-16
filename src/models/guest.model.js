import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      unique: true, required: true
    },
    cnic: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true
    },
    address: {
      type: String,
      required: true
    },

    isPrimaryGuest: {
      type: Boolean,
      default: false,
      required: true
    },
  },
  { timestamps: true }
);

// static methods

// Check if a guest exists based on email, contact number, or CNIC
guestSchema.statics.isGuestExists = async function (user, { email, contactNumber, cnic }) {
  const existingGuest = await this.findOne({
    user,
    $or: [
      { email },
      { contactNumber },
      { cnic },
    ],
  });

  return existingGuest;
};

// Check if a guest is already booked in overlapping bookings
guestSchema.statics.isGuestBooked = async function (
  user,
  { checkIn, checkOut },
  { cnic, email, contactNumber }
) {
  // 1️⃣ Step: Find if guest already exists (based on CNIC/email/contactNumber)
  const existingGuest = await this.isGuestExists(user, { email, contactNumber, cnic });

  if (!existingGuest) return false; // No such guest yet → not booked before

  // 2️⃣ Step: Check if this guest is already linked to any overlapping booking
  const overlappingBookings = await mongoose.model("Booking").find({
    guests: existingGuest._id, // match same guest
    $or: [
      {
        // overlap condition:
        checkIn: { $lt: checkOut }, // starts before new checkout
        checkOut: { $gt: checkIn }, // ends after new checkin
      },
    ],
    status: { $ne: "Cancelled" }, // ignore cancelled bookings
  });

  // 3️⃣ Return true if any overlapping booking found
  return overlappingBookings.length > 0;
};

export const Guest = mongoose.models.Guest || mongoose.model("Guest", guestSchema);
