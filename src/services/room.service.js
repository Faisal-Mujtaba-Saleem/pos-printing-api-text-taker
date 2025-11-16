import { Booking } from "@/models/booking.model";
import { Room } from "@/models/room.model";
import { ServerError } from "@/utlis/ServerError";

export class RoomServices {
  constructor(userId = null) {
    // Rooms are per-user now; store user id for scoping DB operations
    this.user = userId;
  }

  /** 🏠 Add new room */
  async addRoomToDB(roomData) {
    try {
      if (!roomData?.name || !roomData?.price) {
        throw new ServerError("Room name and price are required", 400);
      }

      const existing = await Room.findOne({ room_no: roomData.room_no, user: this.user });
      if (existing) throw new ServerError("Room number already exists", 409);

      const newRoom = await Room.create({ ...roomData, user: this.user });
      return newRoom;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to add room", 500);
    }
  }

  /** 🔍 Get all rooms (with optional filters) */
  async getAllRoomsFromDB(filters = {}) {
    try {
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.roomType) query.roomType = filters.roomType;

      // scope to user's rooms
      const finalQuery = { ...query, user: this.user };
      const rooms = await Room.find(finalQuery).sort({ room_no: 1 });
      
      if (!rooms?.length) throw new ServerError("No rooms found", 404);
      return rooms;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch rooms", 500);
    }
  }

  /** 📖 Get single room by ID */
  async getSingleRoomFromDB(id) {
    try {
      const room = await Room.findOne({ _id: id, user: this.user }).populate("bookings");
      if (!room) throw new ServerError("Room not found", 404);
      return room;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch room", 500);
    }
  }

  /** ✏️ Update room by ID */
  async updateRoomFromDB(id, updatedData) {
    try {
      const updated = await Room.findOneAndUpdate({ _id: id, user: this.user }, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!updated) throw new ServerError("Room not found", 404);
      return updated;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to update room", 500);
    }
  }

  /** ❌ Delete room by ID */
  async deleteRoomFromDB(id) {
    try {
      const deleted = await Room.findOneAndDelete({ _id: id, user: this.user });
      if (!deleted) throw new ServerError("Room not found", 404);
      return deleted;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to delete room", 500);
    }
  }

  /** 🔎 Search available rooms between dates */
  async searchAvailableRoomsFromDB(startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new ServerError("Start and end dates are required", 400);
      }

      const overlappingBookedRoomIds = await Booking.distinct("room", {
        checkIn: { $lte: endDate },
        checkOut: { $gte: startDate },
        status: { $ne: "Cancelled" },
      });

      const availableRooms = await Room.find({
        _id: { $nin: overlappingBookedRoomIds },
        status: "available",
        user: this.user,
      });

      if (!availableRooms.length)
        throw new ServerError("No available rooms found for the selected dates", 404);

      return availableRooms;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Room search failed", 500);
    }
  }

  async getBookedRoomsFromDB() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // remove time part for accurate date comparison

      // 🔍 Find all bookings that are current or future
      const bookedRoomIds = await Booking.distinct("room", {
        checkOut: { $gte: today },
        status: { $ne: "Cancelled" },
      });

      // 🏨 Fetch room details of those bookings
      const bookedRooms = await Room.find({ _id: { $in: bookedRoomIds }, user: this.user }).sort({
        room_no: 1,
      });

      if (!bookedRooms.length)
        throw new ServerError("No booked rooms found (current or future)", 404);

      return bookedRooms;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch booked rooms", 500);
    }
  }
}

// Compatibility: default instance for existing imports that expect an object
export const roomServices = new RoomServices();
