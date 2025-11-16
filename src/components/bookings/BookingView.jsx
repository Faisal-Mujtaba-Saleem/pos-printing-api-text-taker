"use client";

import React, { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utlis/formatCurrency";
import getFormattedDateTime from "@/utlis/date-time-utils/getFormattedDateTime";
import { renderToStaticMarkup } from "react-dom/server";
import { printBookingReceipt } from "@/app/actions/bookings.actions/printBookingReceiptAction";
import { toast } from "react-toastify";

export default function BookingView({ viewBooking }) {
  const [bookingReceipt, setBookingReceipt] = useState("");

  const [state, printBookingReceiptAction] = useActionState(
    printBookingReceipt,
    {
      success: false,
      message: null
    }
  );

  useEffect(() => {
    const bookingReceiptData = {
      bookingId: viewBooking._id,
      issuedAt: getFormattedDateTime(new Date()),
      room: {
        roomNo: viewBooking.room?.room_no,
        name: viewBooking.room?.name,
        type: viewBooking.room?.roomType,
        capacity: viewBooking.room?.capacity,
        imageUrl: viewBooking.room?.img,
      },
      primaryGuest: viewBooking.guests?.find((g) => g.isPrimaryGuest) || {},
      otherGuests: viewBooking.guests?.filter((g) => !g.isPrimaryGuest) || [],
      bookingDetails: {
        checkIn: getFormattedDateTime(viewBooking.checkIn),
        checkOut: getFormattedDateTime(viewBooking.checkOut),
        status: viewBooking.status,
      },
      payment: {
        total: viewBooking.totalAmount,
        paid: viewBooking.paidAmount,
        remaining: viewBooking.totalAmount - viewBooking.paidAmount,
        status: viewBooking.paymentStatus,
      },
    };

    const bookingReceiptJSX = (
      <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[700px] text-sm">
          {/* Header */}
          <div className="text-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Hotel Booking Receipt
            </h2>
            <p className="text-xs text-gray-500">
              Booking ID: {bookingReceiptData.bookingId} | Issued:{" "}
              {bookingReceiptData.issuedAt}
            </p>
          </div>

          {/* Room Info */}
          <div className="flex gap-4 mb-4 border-b pb-3">
            <img
              src={bookingReceiptData.room?.imageUrl}
              alt={bookingReceiptData.room?.name}
              className="w-[120px] h-[90px] object-cover rounded-md border"
            />
            <div>
              <p className="font-semibold text-gray-800">
                Room No: {bookingReceiptData.room?.roomNo}
              </p>
              <p>Room Name: {bookingReceiptData.room?.name}</p>
              <p>Type: {bookingReceiptData.room?.type}</p>
              <p>Capacity: {bookingReceiptData.room?.capacity} Guests</p>
            </div>
          </div>

          {/* Primary Guest */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 border-b mb-2 pb-1 uppercase text-xs tracking-wide">
              Primary Guest
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="font-medium text-gray-700">Full Name:</p>
              <p>{bookingReceiptData.primaryGuest?.fullName}</p>

              <p className="font-medium text-gray-700">CNIC:</p>
              <p>{bookingReceiptData.primaryGuest?.cnic}</p>

              <p className="font-medium text-gray-700">Contact:</p>
              <p>{bookingReceiptData.primaryGuest?.contactNumber}</p>

              <p className="font-medium text-gray-700">Email:</p>
              <p>{bookingReceiptData.primaryGuest?.email}</p>

              <p className="font-medium text-gray-700">Gender:</p>
              <p>{bookingReceiptData.primaryGuest?.gender}</p>

              <p className="font-medium text-gray-700">Address:</p>
              <p>{bookingReceiptData.primaryGuest?.address}</p>
            </div>
          </div>

          {/* Other Guests */}
          {bookingReceiptData.otherGuests?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 border-b mb-2 pb-1 uppercase text-xs tracking-wide">
                Other Guests
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-1">
                {bookingReceiptData.otherGuests.map((guest, idx) => (
                  <li key={idx}>
                    {guest.fullName} – {guest.gender} – CNIC: {guest.cnic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Booking Details */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 border-b mb-2 pb-1 uppercase text-xs tracking-wide">
              Booking Details
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="font-medium text-gray-700">Check-In:</p>
              <p>{bookingReceiptData.bookingDetails?.checkIn}</p>

              <p className="font-medium text-gray-700">Check-Out:</p>
              <p>{bookingReceiptData.bookingDetails?.checkOut}</p>

              <p className="font-medium text-gray-700">Status:</p>
              <p>{bookingReceiptData.bookingDetails?.status}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 border-b mb-2 pb-1 uppercase text-xs tracking-wide">
              Payment Summary
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="font-medium text-gray-700">Total Amount:</p>
              <p>PKR {bookingReceiptData.payment?.total}</p>

              <p className="font-medium text-gray-700">Paid Amount:</p>
              <p>PKR {bookingReceiptData.payment?.paid}</p>

              <p className="font-medium text-gray-700">Remaining Balance:</p>
              <p className="text-red-600">
                PKR {bookingReceiptData.payment?.remaining}
              </p>

              <p className="font-medium text-gray-700">Payment Status:</p>
              <p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    bookingReceiptData.payment?.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : bookingReceiptData.payment?.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {bookingReceiptData.payment?.status}
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-3">
            <p>Thank you for choosing our hotel!</p>
            <p className="mt-1">We hope you enjoy your stay.</p>
          </div>
        </div>
      </div>
    );

    setBookingReceipt(renderToStaticMarkup(bookingReceiptJSX));
  }, []);

  useEffect(() => {
    if(!!state.success){
      toast.success(state.message)
    } else{
      toast.error(state.message)
    }
  }, [state])

  return (
    <div className="flex flex-col gap-3">
      {/* Booking overview image */}
      <div className="flex justify-center">
        <Image
          src={viewBooking.room?.img || "/placeholder-room.jpg"}
          alt="Room Image"
          width={300}
          height={180}
          className="rounded-lg object-cover"
        />
      </div>

      {/* Booking summary */}
      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
        <p className="font-medium text-gray-700">Room No:</p>
        <p>{viewBooking.room?.room_no || "—"}</p>

        <p className="font-medium text-gray-700">Room Name:</p>
        <p>{viewBooking.room?.name || "—"}</p>

        <p className="font-medium text-gray-700">Booking ID:</p>
        <p>{viewBooking._id || "—"}</p>

        <p className="font-medium text-gray-700">Guest Contact:</p>
        <p>{viewBooking.guests?.[0]?.email || "—"}</p>

        <p className="font-medium text-gray-700">Check-In:</p>
        <p>{getFormattedDateTime(viewBooking.checkIn)}</p>

        <p className="font-medium text-gray-700">Check-Out:</p>
        <p>{getFormattedDateTime(viewBooking.checkOut)}</p>

        <p className="font-medium text-gray-700">Total Amount:</p>
        <p>{formatCurrency(viewBooking.totalAmount)}</p>

        <p className="font-medium text-gray-700">Paid Amount:</p>
        <p>{formatCurrency(viewBooking.paidAmount)}</p>

        <p className="font-medium text-gray-700">Payment Status:</p>
        <p>{viewBooking.paymentStatus || "—"}</p>

        <p className="font-medium text-gray-700">Booking Status:</p>
        <p>{viewBooking.status || "—"}</p>
      </div>

      {/* -------- Collapsible Sections -------- */}
      <div className="mt-4 space-y-2">
        {/* ROOM DETAILS */}
        <Disclosure>
          {({ open }) => (
            <div className="border rounded-lg">
              <DisclosureButton className="flex justify-between w-full px-4 py-2 text-sm font-semibold text-left bg-gray-100 rounded-t-lg hover:bg-gray-200">
                <span>Room Details</span>
                <ChevronUpIcon
                  className={`h-5 w-5 transform transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </DisclosureButton>
              <DisclosurePanel className="px-4 py-3 text-sm text-gray-700 bg-white rounded-b-lg">
                {viewBooking.room ? (
                  <ul className="space-y-1">
                    <li>
                      <strong>Room No:</strong> {viewBooking.room.room_no}
                    </li>
                    <li>
                      <strong>Name:</strong> {viewBooking.room.name}
                    </li>
                    <li>
                      <strong>Type:</strong> {viewBooking.room.roomType}
                    </li>
                    <li>
                      <strong>Price:</strong>{" "}
                      {formatCurrency(viewBooking.room.price)}
                    </li>
                    <li>
                      <strong>Capacity:</strong> {viewBooking.room.capacity}
                    </li>
                    <li>
                      <strong>Status:</strong> {viewBooking.room.status || "—"}
                    </li>
                    <li>
                      <strong>Features:</strong>{" "}
                      {viewBooking.room.features?.length
                        ? viewBooking.room.features.join(", ")
                        : "—"}
                    </li>
                    <li>
                      <strong>Created At:</strong>{" "}
                      {getFormattedDateTime(viewBooking.room.createdAt)}
                    </li>
                    <li>
                      <strong>Updated At:</strong>{" "}
                      {getFormattedDateTime(viewBooking.room.updatedAt)}
                    </li>
                  </ul>
                ) : (
                  <p>No room details available.</p>
                )}
              </DisclosurePanel>
            </div>
          )}
        </Disclosure>

        {/* GUESTS DETAILS */}
        <Disclosure>
          {({ open }) => (
            <div className="border rounded-lg">
              <DisclosureButton className="flex justify-between w-full px-4 py-2 text-sm font-semibold text-left bg-gray-100 rounded-t-lg hover:bg-gray-200">
                <span>Guest(s) Details</span>
                <ChevronUpIcon
                  className={`h-5 w-5 transform transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </DisclosureButton>
              <DisclosurePanel className="px-4 py-3 text-sm text-gray-700 bg-white rounded-b-lg">
                {viewBooking.guests?.length ? (
                  <div className="space-y-2">
                    {viewBooking.guests.map((g, i) => (
                      <div
                        key={g._id || i}
                        className={`${
                          viewBooking.guests.length !== 1 &&
                          i < viewBooking.guests.length - 1
                            ? "border-b"
                            : ""
                        } pb-2`}
                      >
                        <p>
                          <strong>Name:</strong> {g.fullName || "—"}
                        </p>
                        <p>
                          <strong>Email:</strong> {g.email || "—"}
                        </p>
                        <p>
                          <strong>Contact:</strong> {g.contactNumber || "—"}
                        </p>
                        <p>
                          <strong>CNIC:</strong> {g.cnic || "—"}
                        </p>
                        <p>
                          <strong>Primary Guest:</strong>{" "}
                          {g.isPrimaryGuest ? "Yes" : "No"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No guests found.</p>
                )}
              </DisclosurePanel>
            </div>
          )}
        </Disclosure>
      </div>

      {/* Print button (untouched) */}
      <div className="flex justify-end mt-4">
        <form action={printBookingReceiptAction}>
          <input
            type="text"
            name="booking_receipt"
            id="booking_receipt"
            value={bookingReceipt}
            readOnly
            hidden
          />
          <button
            type="submit"
            // onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Print Reciept
          </button>
        </form>
      </div>
    </div>
  );
}
