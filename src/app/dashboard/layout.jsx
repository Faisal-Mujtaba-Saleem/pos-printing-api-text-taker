import React from "react";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export const metadata = {
  title: "Dashboard - Hotel Management",
};

export default function DashboardLayout({ children }) {
  return (
    <div>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </div>
  );
}