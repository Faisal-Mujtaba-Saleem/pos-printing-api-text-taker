"use client";

import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaRegCalendarCheck,
  FaHotel,
  FaDollarSign,
  FaClock,
  FaTools,
} from "react-icons/fa";
import { IoBedOutline, IoLockClosed } from "react-icons/io5";
import { TbCalendarEvent, TbCash } from "react-icons/tb";
import { motion } from "framer-motion";

// Reusable StatCard
function StatCard({ item, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br ${item.color} rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-2xl hover:-translate-y-1 transition-all`}
    >
      <div className="text-4xl">{item.icon}</div>
      <div className="flex flex-col">
        <span className="text-gray-600 text-sm font-medium">{item.title}</span>
        <span className="text-2xl font-bold text-gray-800">
          {loading ? "..." : item.value}
        </span>
      </div>
    </motion.div>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setError(null);
        setLoading(true);

        const [
          summaryRes,
          guestsRes,
          bookingsRes,
          roomsRes,
          availableRes,
          maintenanceRes,
          bookedRes,
        ] = await Promise.all([
          fetch("/api/v1/reports", { cache: "no-store" }),
          fetch("/api/v1/guests", { cache: "no-store" }),
          fetch("/api/v1/bookings", { cache: "no-store" }),
          fetch("/api/v1/rooms", { cache: "no-store" }),
          fetch("/api/v1/rooms?status=available", { cache: "no-store" }),
          fetch("/api/v1/rooms?status=maintenance", { cache: "no-store" }),
          fetch("/api/v1/rooms/booked", { cache: "no-store" }),
        ]);

        const summaryData = summaryRes.ok ? await summaryRes.json() : {};
        const summary = summaryData?.summary || {};

        const guestsCount = guestsRes.ok ? (await guestsRes.json()).length : 0;
        const bookingsList = bookingsRes.ok ? await bookingsRes.json() : [];
        const totalRooms = roomsRes.ok ? (await roomsRes.json()).length : 0;
        const availableRooms = availableRes.ok
          ? (await availableRes.json()).length
          : 0;
        const maintenanceRooms = maintenanceRes.ok
          ? (await maintenanceRes.json()).length
          : 0;
        const bookedRooms = bookedRes.ok ? (await bookedRes.json()).length : 0;

        // 🔹 Booking & Payment Status Counts
        const possibleBookingStatuses = [
          "Pending",
          "Checked-In",
          "Checked-Out",
          "Cancelled",
        ];
        const possiblePaymentStatuses = ["Pending", "Paid", "Cancelled"];

        const bookingStatusCounts = possibleBookingStatuses.reduce(
          (acc, status) => {
            acc[status] =
              bookingsList.filter((b) => b.status === status).length || 0;
            return acc;
          },
          {}
        );

        const paymentStatusCounts = possiblePaymentStatuses.reduce(
          (acc, status) => {
            acc[status] =
              bookingsList.filter((b) => b.paymentStatus === status).length ||
              0;
            return acc;
          },
          {}
        );

        // 🔹 Financial Enhancements
        const totalRevenue = summary?.totalRevenue || 0;
        const pendingPayments = summary?.pendingPayments || 0;
        const monthRevenue = summary?.monthRevenue || 0;
        const paidRevenue = totalRevenue - pendingPayments;
        const avgBookingValue = bookingsList.length
          ? Math.round(totalRevenue / bookingsList.length)
          : 0;

        // 🔹 Merge all stats
        const mergedStats = [
          // Business Overview
          {
            title: "Total Guests",
            value: guestsCount,
            icon: <FaUsers className="text-blue-600" />,
            color: "from-blue-50 to-blue-100",
            category: "business",
          },
          {
            title: "Total Bookings",
            value: bookingsList.length,
            icon: <FaRegCalendarCheck className="text-green-600" />,
            color: "from-green-50 to-green-100",
            category: "business",
          },
          {
            title: "Total Rooms",
            value: totalRooms,
            icon: <FaHotel className="text-purple-600" />,
            color: "from-purple-50 to-purple-100",
            category: "business",
          },

          // Room Status
          {
            title: "Available Rooms",
            value: availableRooms,
            icon: <IoBedOutline className="text-blue-500" />,
            color: "from-cyan-50 to-cyan-100",
            category: "room",
          },
          {
            title: "Booked Rooms",
            value: bookedRooms,
            icon: <IoLockClosed className="text-red-500" />,
            color: "from-red-50 to-red-100",
            category: "room",
          },
          {
            title: "Maintenance Rooms",
            value: maintenanceRooms,
            icon: <FaTools className="text-orange-500" />,
            color: "from-orange-50 to-orange-100",
            category: "room",
          },

          // Booking Status
          ...Object.entries(bookingStatusCounts).map(([status, count]) => ({
            title: `${status} Bookings`,
            value: count,
            icon: <TbCalendarEvent className="text-indigo-600" />,
            color: "from-indigo-50 to-indigo-100",
            category: "booking",
          })),

          // Payment Status
          ...Object.entries(paymentStatusCounts).map(([status, count]) => ({
            title: `${status} Payments`,
            value: count,
            icon: <TbCash className="text-teal-600" />,
            color: "from-teal-50 to-teal-100",
            category: "payment",
          })),

          // Financial Analytics
          {
            title: "Total Revenue",
            value: `Rs. ${totalRevenue.toLocaleString()}`,
            icon: <FaDollarSign className="text-green-600" />,
            color: "from-emerald-50 to-emerald-100",
            category: "finance",
          },
          {
            title: "Pending Payments",
            value: `Rs. ${pendingPayments.toLocaleString()}`,
            icon: <FaClock className="text-yellow-600" />,
            color: "from-yellow-50 to-yellow-100",
            category: "finance",
          },
          {
            title: "This Month Revenue",
            value: `Rs. ${monthRevenue.toLocaleString()}`,
            icon: <FaDollarSign className="text-blue-600" />,
            color: "from-sky-50 to-sky-100",
            category: "finance",
          },
          {
            title: "Paid Revenue",
            value: `Rs. ${paidRevenue.toLocaleString()}`,
            icon: <FaDollarSign className="text-green-700" />,
            color: "from-lime-50 to-lime-100",
            category: "finance",
          },
          {
            title: "Avg. Booking Value",
            value: `Rs. ${avgBookingValue.toLocaleString()}`,
            icon: <FaRegCalendarCheck className="text-blue-700" />,
            color: "from-indigo-50 to-indigo-100",
            category: "finance",
          },
        ];

        setStats(mergedStats);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  // 🔹 Render Stats by Category
  const renderCategory = (categoryName, title) => {
    const filteredStats = stats.filter((s) => s.category === categoryName);
    if (!filteredStats.length) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStats.map((item, idx) => (
            <StatCard key={idx} item={item} loading={loading} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {renderCategory("business", "Business Overview")}
      {renderCategory("room", "Room Status")}
      {renderCategory("booking", "Booking Status")}
      {renderCategory("payment", "Payment Status")}
      {renderCategory("finance", "Financial Analytics")}

      {error && (
        <div className="text-red-600 text-center text-sm mt-4">⚠️ {error}</div>
      )}
    </div>
  );
}
