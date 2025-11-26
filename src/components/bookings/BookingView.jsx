"use client";

import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Image from "next/image";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utlis/formatCurrency";
import getFormattedDateTime from "@/utlis/date-time-utils/getFormattedDateTime";
import siteLogo from '@/assets/logo.png';

export default function BookingView({ viewBooking }) {
  const [bookingReceipt, setBookingReceipt] = useState("");

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
      <div className="receipt-root">
        <style>{`
        @page { size: A4; margin: 10mm; }
        .a4-sheet { width: 210mm; min-height: 297mm; margin: 0 auto; box-shadow: none; }
        @media print {
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        .no-print { display: none !important; }
        .a4-sheet { box-shadow: none !important; border-radius: 0 !important; margin: 0; }
        }
        /* small visual tweaks for screen */
        .screen-card { max-width: 820px; margin: 18px auto; box-shadow: 0 6px 18px rgba(15,23,42,0.08); border-radius: 12px; overflow: hidden; }
        .muted { color: #6b7280; } /* tailwind gray-500 fallback */
      `}</style>

        <div className="a4-sheet print:bg-white">
          <div className="screen-card bg-white print:bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-4">
                <img
                  src={siteLogo.src || "/placeholder-room.jpg"}
                  alt="hotel logo"
                  className="w-14 h-14 rounded-md object-cover border border-white/20"
                />
                <div>
                  <h1 className="text-lg font-semibold leading-tight">Elegant Stay Hotel</h1>
                  <p className="text-xs opacity-90">Comfort • Convenience • Care</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="font-semibold">Receipt</div>
                <div className="muted">Issued: {bookingReceiptData.issuedAt}</div>
                <div className="mt-1 px-2 inline-block bg-white/10 rounded text-[11px]">
                  ID: {bookingReceiptData.bookingId}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 print:px-8 print:py-6">
              {/* Top section: room + booking summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 md:col-span-1">
                  <img
                    src={bookingReceiptData.room?.imageUrl || "/placeholder-room.jpg"}
                    alt={bookingReceiptData.room?.name}
                    className="w-28 h-20 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{bookingReceiptData.room?.name || "—"}</div>
                    <div className="text-xs muted">Room No: {bookingReceiptData.room?.roomNo || "—"}</div>
                    <div className="text-xs muted">Type: {bookingReceiptData.room?.type || "—"}</div>
                    <div className="text-xs muted">Capacity: {bookingReceiptData.room?.capacity || "—"} Guests</div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs muted">Check-In</div>
                      <div className="font-medium">{bookingReceiptData.bookingDetails?.checkIn || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs muted">Check-Out</div>
                      <div className="font-medium">{bookingReceiptData.bookingDetails?.checkOut || "—"}</div>
                    </div>

                    <div>
                      <div className="text-xs muted">Booking Status</div>
                      <div className="font-medium">{bookingReceiptData.bookingDetails?.status || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs muted">Payment Status</div>
                      <div className="font-medium">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${bookingReceiptData.payment?.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : bookingReceiptData.payment?.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {bookingReceiptData.payment?.status || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 border-t pt-3 print:mt-2">
                    <div className="text-xs muted">Primary Guest</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm">
                        <div className="font-medium">{bookingReceiptData.primaryGuest?.fullName || "—"}</div>
                        <div className="text-xs muted">{bookingReceiptData.primaryGuest?.email || "—"} • {bookingReceiptData.primaryGuest?.contactNumber || "—"}</div>
                      </div>
                      <div className="text-right text-xs muted">
                        CNIC: {bookingReceiptData.primaryGuest?.cnic || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other guests (if any) */}
              {bookingReceiptData.otherGuests?.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs muted uppercase tracking-wide">Other Guests</div>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {bookingReceiptData.otherGuests.map((g, i) => (
                      <li key={i} className="print:text-gray-800">
                        <span className="font-medium">{g.fullName || "—"}</span>
                        <span className="muted"> — {g.gender || "—"} • CNIC: {g.cnic || "—"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2">
                  <div className="text-xs muted uppercase tracking-wide">Notes</div>
                  <div className="mt-2 text-sm muted">
                    Please bring a valid ID during check-in. For cancellations or amendments, contact reception.
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-md p-4 md:col-span-1">
                  <div className="text-xs muted uppercase">Payment Summary</div>

                  <div className="mt-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <div className="muted">Total</div>
                      <div className="font-semibold">
                        {formatCurrency(bookingReceiptData.payment?.total || 0)}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div className="muted">Paid</div>
                      <div className="font-medium text-green-700">
                        {formatCurrency(bookingReceiptData.payment?.paid || 0)}
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                      <div className="muted">Remaining</div>
                      <div className="font-semibold text-red-600">
                        {formatCurrency(bookingReceiptData.payment?.remaining || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-xs muted">Thank you for staying with us</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between text-xs muted border-t">
              <div>
                <div className="font-semibold">Elegant Stay Hotel</div>
                <div className="muted">123 Seaside Ave, City • +92 300 0000000 • info@elegantstay.example</div>
              </div>

              <div className="text-right">
                <div className="text-xs muted">Receipt generated</div>
                <div className="font-mono text-sm mt-1">{bookingReceiptData.bookingId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    setBookingReceipt(renderToStaticMarkup(bookingReceiptJSX));
  }, []);

  const printReceipt = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("PRINT CLICKED");

    if (typeof window === 'undefined') return; // safety: only run in browser

    const { default: printJS } = await import('print-js');
    printJS({
      printable: bookingReceipt,
      type: 'raw-html',
      css: 'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css',
    });
  }

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
                  className={`h-5 w-5 transform transition-transform duration-300 ${open ? "rotate-180" : ""
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
                  className={`h-5 w-5 transform transition-transform duration-300 ${open ? "rotate-180" : ""
                    }`}
                />
              </DisclosureButton>
              <DisclosurePanel className="px-4 py-3 text-sm text-gray-700 bg-white rounded-b-lg">
                {viewBooking.guests?.length ? (
                  <div className="space-y-2">
                    {viewBooking.guests.map((g, i) => (
                      <div
                        key={g._id || i}
                        className={`${viewBooking.guests.length !== 1 &&
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
        <button
          type="button" onClick={printReceipt}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}
