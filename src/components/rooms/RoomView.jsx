"use client";

import React from "react";
import Image from "next/image";
import { FaBed } from "react-icons/fa";
import { formatCurrency } from "@/utlis/formatCurrency";
import calculateNights from "@/utlis/date-time-utils/calculateNights";

/**
 * Merged component: Shows room details with optional pricing (if checkIn/checkOut provided)
 * Used in both RoomsTable (without dates) and available-rooms (with dates)
 */
export default function RoomView({ room, checkIn, checkOut }) {
  const imgSrc = room.img || room.image || "/placeholder.jpg";
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : null;

  return (
    <div className="space-y-6 p-4 bg-linear-to-b from-white to-gray-50 rounded-2xl shadow-inner">
      {/* Room Header Section */}
      <div className="flex items-start gap-5 border-b border-gray-100 pb-4">
        <div className="relative w-36 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
          {room.img ? (
            <Image
              src={room.img}
              alt={room.name || "Room image"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FaBed className="text-blue-500 text-4xl opacity-80" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-semibold text-gray-900 tracking-tight">
            {room.name || "Unnamed Room"}{" "}
            <span className="font-medium text-gray-700">
              - {room.room_no ?? "—"}
            </span>
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            {room.type || room.roomType || "Standard"} • Max{" "}
            <span className="font-medium text-gray-700">
              {room.capacity ?? "—"}
            </span>{" "}
            guests
          </p>

          <p className="mt-3 text-lg font-semibold text-blue-600">
            {formatCurrency(room.price ?? 0)}
            <span className="text-sm font-normal text-gray-500">
              {" "}
              / night
            </span>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section>
        <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2">
          Room Features
        </h5>
        <div className="flex flex-wrap gap-2">
          {(room.features || []).length > 0 ? (
            room.features.map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
              >
                {f}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">
              No features listed
            </span>
          )}
        </div>
      </section>

      {/* Additional Details Grid */}
      <section>
        <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2">
          Details
        </h5>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="font-medium text-gray-700">Status:</p>
          <p>{room.status ?? "—"}</p>

          {room.createdAt && (
            <>
              <p className="font-medium text-gray-700">Created At:</p>
              <p>{new Date(room.createdAt).toLocaleString()}</p>
            </>
          )}
        </div>
      </section>

      {/* Total / Pricing Summary - Only show if dates are provided */}
      {nights && (
        <div className="pt-4 border-t border-gray-100 flex flex-col items-end">
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">
              Total for {nights} night{nights > 1 ? "s" : ""}:
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency((room.price ?? 0) * nights)}
            </div>
            <div className="text-xs text-gray-400">
              ({formatCurrency(room.price ?? 0)} × {nights})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
