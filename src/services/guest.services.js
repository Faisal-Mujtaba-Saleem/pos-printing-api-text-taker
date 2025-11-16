import { Guest } from "@/models/guest.model";
import { ServerError } from "@/utlis/ServerError";

export class GuestServices {
  constructor(userId) {
    this.user = userId;
  }

  async storeGuestToDB(guestData) {
    const {
      fullName,
      contactNumber,
      cnic,
      email,
      gender,
      address,
      isPrimaryGuest,
    } = guestData;

    // ✅ Duplicate check (scoped to user)
    const existing = await Guest.isGuestExists(this.user, { email, contactNumber, cnic });
    if (existing) throw new ServerError("Guest already exists", 409);

    // ✅ Create guest
    const result = await Guest.create({
      fullName,
      contactNumber,
      cnic,
      email,
      gender,
      address,
      isPrimaryGuest,
      user: this.user,
    });

    if (!result) throw new ServerError("Guest creation failed", 400);
    return result;
  }

  async getSingleGuestFromDB(_id) {
    const result = await Guest.findOne({ _id, user: this.user });
    if (!result) throw new ServerError("Guest not found", 404);
    return result;
  }

  async getAllGuestsFromDB() {
    const result = await Guest.find({ user: this.user }).sort({ createdAt: -1 });
    if (!result?.length) throw new ServerError("No guests found", 404);
    return result;
  }

  async updateGuestInDB(_id, updates) {
    const result = await Guest.findOneAndUpdate({ _id, user: this.user }, updates, { new: true });
    if (!result) throw new ServerError("Guest not found", 404);
    return result;
  }

  async deleteGuestFromDB(_id) {
    const result = await Guest.findOneAndDelete({ _id, user: this.user });
    if (!result) throw new ServerError("Guest not found", 404);
    return result;
  }

  // legacy / utility - not scoped to a particular user
  static async checkAdminFromDB(email) {
    const guest = await Guest.findOne({ email, role: "admin" });
    return !!guest;
  }
}

export const guestServices = new GuestServices();