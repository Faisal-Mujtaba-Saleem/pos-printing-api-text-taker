// app/api/v1/reports/route.js
import { NextResponse } from "next/server";
import { ReportServices } from "@/services/report.services";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "@/models/user.model";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });
    if (!user)
      throw new Error("Authenticated user not found in database");

    const reportServices = new ReportServices(user._id);

    if (type === "roomRevenue") {
      const data = await reportServices.getRevenueByRoomType();
      return NextResponse.json(data);
    }

    if (type === "bookingTrend") {
      const data = await reportServices.getBookingTrend();
      return NextResponse.json(data);
    }

    const summary = await reportServices.getReportSummary();
    const weekly = await reportServices.getWeeklyReport();

    return NextResponse.json({ summary, weekly });
  } catch (err) {
    console.error("Report Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
