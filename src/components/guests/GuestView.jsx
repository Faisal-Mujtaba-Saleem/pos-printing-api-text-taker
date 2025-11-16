"use client";

import React from "react";

export default function GuestView({ guest }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-center mb-2">
        <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
          {guest.fullName
            ? guest.fullName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "?"}
        </div>
        <h3 className="mt-2 text-base font-semibold text-gray-800">
          {guest.fullName || "—"}
        </h3>
        <p className="text-sm text-gray-500">{guest.email || "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
        <p className="font-medium text-gray-700">Contact Number:</p>
        <p>{guest.contactNumber ?? "—"}</p>

        <p className="font-medium text-gray-700">CNIC:</p>
        <p>{guest.cnic ?? "—"}</p>

        <p className="font-medium text-gray-700">Gender:</p>
        <p>{guest.gender ?? "—"}</p>

        <p className="font-medium text-gray-700">Address:</p>
        <p>{guest.address ?? "—"}</p>

        <p className="font-medium text-gray-700">Primary Guest:</p>
        <p>{guest.isPrimaryGuest ? "Yes" : "No"}</p>

        <p className="font-medium text-gray-700">Created At:</p>
        <p>
          {guest.createdAt
            ? new Date(guest.createdAt).toLocaleString()
            : "—"}
        </p>
      </div>
    </div>
  );
}
