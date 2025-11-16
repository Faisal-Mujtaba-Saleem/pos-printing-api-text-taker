"use client";

import React, { useEffect, useState } from "react";

export default function RecentBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function fetchBookings() {
      const res = await fetch("/api/v1/bookings", { cache: "no-store" });
      const data = await res.json();
      data?.length && setBookings(data?.slice(0, 5));
    }
    fetchBookings();
  }, []);
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 my-6 rounded-2xl shadow-lg transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
        <span className="text-xs text-gray-500">Last 5 entries</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
              <th className="py-3 px-4 font-medium">Guest</th>
              <th className="py-3 px-4 font-medium">Room</th>
              <th className="py-3 px-4 font-medium">Check-In</th>
              <th className="py-3 px-4 font-medium">Amount</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, i) => (
              <tr
                key={b._id}
                className={`transition-all ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50/60`}
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {b.guests?.[0]?.fullName}
                </td>
                <td className="px-4 text-gray-700">{b.room?.name}</td>
                <td className="px-4 text-gray-600">
                  {new Date(b.checkIn).toLocaleDateString()}
                </td>
                <td className="px-4 text-blue-600 font-semibold">
                  Rs. {b.paidAmount.toLocaleString()}
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-400 italic bg-gray-50"
                >
                  No recent bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
