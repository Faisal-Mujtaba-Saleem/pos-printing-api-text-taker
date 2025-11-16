import { NextResponse } from "next/server";
import "@/lib/mongoose/connectDB";
import { User } from "@/models/user.model";
import { ReportServices } from "@/services/report.services";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";
import convertHTML2PDF from "@/utlis/convertHTML2PDF";

// Helper to format week ranges
import { getWeekDateRange } from "@/utlis/date-time-utils/getWeekDateRange";

export async function GET() {
    try {
        // 🔐 Authenticate user
        const clerkUserId = (await currentUser()).id;
        const user = await User.findOne({ clerkUserId });

        if (!user) throw ServerError("Authenticated user not found in database", 404);

        // 1️⃣ Get report data (scoped to user)
        const reportService = new ReportServices(user._id);
        const summary = await reportService.getReportSummary();
        const weekly = await reportService.getWeeklyReport();
        const roomRevenue = await reportService.getRevenueByRoomType();
        const bookingTrend = await reportService.getBookingTrend();

        // 2️⃣ Generate HTML for PDF
        const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Hotel Accounting Report</title>
            <style>
              body { font-family: Arial,sans-serif; padding: 20px; color: #111; }
              h1,h2 { color: #2563eb; margin-bottom: 10px; }
              .summary { display: flex; gap: 20px; margin: 20px 0; }
              .card { flex: 1; padding: 12px; background: #f0f9ff; border-radius: 8px; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
              th { background: #f3f4f6; }
              .chart { width: 100%; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>🏨 Hotel Accounting Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>

            <h2>Summary</h2>
            <div class="summary">
              <div class="card">Total Revenue<br><strong>Rs. ${summary.totalRevenue.toLocaleString()}</strong></div>
              <div class="card">Pending Payments<br><strong>Rs. ${summary.pendingPayments.toLocaleString()}</strong></div>
              <div class="card">This Month Revenue<br><strong>Rs. ${summary.monthRevenue.toLocaleString()}</strong></div>
            </div>

            <h2>Weekly Revenue & Bookings</h2>
            <table>
              <thead>
                <tr><th>Week</th><th>Revenue (Rs.)</th><th>Bookings</th></tr>
              </thead>
              <tbody>
                ${weekly.map(w => `<tr>
                  <td>${getWeekDateRange(w._id)}</td>
                  <td>${w.totalRevenue.toLocaleString()}</td>
                  <td>${w.bookings}</td>
                </tr>`).join("")}
              </tbody>
            </table>

            <h2>Revenue by Room Type</h2>
            <table>
              <thead>
                <tr><th>Room Type</th><th>Revenue (Rs.)</th></tr>
              </thead>
              <tbody>
                ${roomRevenue.map(r => `<tr>
                  <td>${r.roomType}</td>
                  <td>${r.revenue.toLocaleString()}</td>
                </tr>`).join("")}
              </tbody>
            </table>

            <h2>Booking Trend (Last 30 Days)</h2>
            <table>
              <thead>
                <tr><th>Date</th><th>Bookings</th></tr>
              </thead>
              <tbody>
                ${bookingTrend.map(d => `<tr>
                  <td>${d.date}</td>
                  <td>${d.bookings}</td>
                </tr>`).join("")}
              </tbody>
            </table>
          </body>
        </html>
    `;

        // 3️⃣ Convert HTML to PDF
        const pdfBuffer = await convertHTML2PDF(html, { generateHtmlBoilerPlate: false });

        // 4️⃣ Return PDF
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=Hotel_Accounting_Report.pdf",
            },
        });
    } catch (err) {
        console.error("PDF Generation Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
