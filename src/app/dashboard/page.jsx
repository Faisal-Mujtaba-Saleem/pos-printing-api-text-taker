"use client";
import React from "react";
import DashboardSharedHeader from "@/components/shared/DashboardSharedHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import RecentBookings from "@/components/dashboard/RecentBookings";
import ExportReportButton from "@/components/dashboard/ExportReportButton";
import { AiOutlineDashboard } from "react-icons/ai";

export default function Page() {
  return (
    <div className="bg-[#F1F5F9] bg-gradient-to-r from-stone-100 to-blue-50 min-h-[calc(100vh_-_70px)]">
      <DashboardSharedHeader
        Icon={AiOutlineDashboard}
        heading={"Administrator Dashboard"}
      />
      <div className="px-5 space-y-8">
        {/* Export PDF Button */}
        <div className="flex justify-end mb-4">
          <ExportReportButton />
        </div>

        {/* Dashboard components */}
        <DashboardStats />
        <div className="charts-overview-container p-6">
          <h2 className="text-lg font-semibold mb-4">Charts Overview</h2>
          <div className="chart-container">
            <DashboardCharts />
          </div>
        </div>
        <RecentBookings />
      </div>
    </div>
  );
}
