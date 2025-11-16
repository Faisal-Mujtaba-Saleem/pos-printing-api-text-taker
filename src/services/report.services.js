import { Booking } from "@/models/booking.model";
import { ServerError } from "@/utlis/ServerError";

export class ReportServices {
  constructor(userId) {
    this.user = userId;
  }

  async getReportSummary() {
    try {
      const allBookings = await Booking.find({ user: this.user });

      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
      const pendingPayments = allBookings.reduce(
        (sum, b) => sum + Math.max(0, (b.totalAmount || 0) - (b.paidAmount || 0)),
        0
      );

      const currentMonth = new Date().getMonth();
      const monthRevenue = allBookings
        .filter((b) => new Date(b.createdAt).getMonth() === currentMonth)
        .reduce((sum, b) => sum + (b.paidAmount || 0), 0);

      console.log({ allBookings, totalRevenue, pendingPayments, monthRevenue });

      return { totalRevenue, pendingPayments, monthRevenue };
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch report summary", 500);
    }
  }

  async getWeeklyReport() {
    try {
      const result = await Booking.aggregate([
        {
          $match: { user: this.user },
        },
        {
          $group: {
            _id: { $week: "$createdAt" },
            totalRevenue: { $sum: "$paidAmount" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { "_id": 1 } },
      ]);

      console.log({ result });

      return result;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch weekly report", 500);
    }
  }

  async getRevenueByRoomType() {
    try {
      const result = await Booking.aggregate([
        {
          $match: { user: this.user },
        },
        {
          $lookup: {
            from: "rooms",
            localField: "room",
            foreignField: "_id",
            as: "roomDetails",
          },
        },
        { $unwind: "$roomDetails" },
        {
          $group: {
            _id: "$roomDetails.roomType",
            revenue: { $sum: "$paidAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            roomType: "$_id",
            revenue: 1,
          },
        },
      ]);

      console.log({ result });

      return result;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch revenue by room type", 500);
    }
  }

  async getBookingTrend(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await Booking.aggregate([
        {
          $match: {
            user: this.user,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            bookings: 1,
            _id: 0,
          },
        },
      ]);

      console.log({ result });

      return result;
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(error.message || "Failed to fetch booking trend", 500);
    }
  }
}

// Compatibility: default instance for existing imports that expect an object
export const reportServices = new ReportServices();
