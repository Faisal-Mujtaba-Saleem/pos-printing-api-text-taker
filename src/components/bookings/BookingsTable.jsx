"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FaEdit } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { formatCurrency } from "@/utlis/formatCurrency";
import { useElementsHeights } from "@/contexts/elements-heights-context/context";
import { useDialog } from "@/contexts/modal-context/context";
import { toast } from "react-toastify";
import BookingView from "./BookingView";
import EditBookingForm from "./EditBookingForm";

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // edit modal handled via global AppModal using populateModal

  // Pagination state / config
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const tr_Ref = useRef(null);

  const { topbarHeight, headerHeight } = useElementsHeights();
  const { populateModal } = useDialog();

  useEffect(() => {
    const handleResize = () => getPageSize();
    window.addEventListener("resize", handleResize);
    getPageSize(); // initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch bookings from API
  useEffect(() => {
    const ac = new AbortController();
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/bookings", { signal: ac.signal });
        if (!res.ok && res.status !== 404)
          throw new Error(`Failed to fetch bookings (${res.status})`);
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        if (err.name !== "AbortError")
          setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    return () => ac.abort();
  }, []);

  useEffect(() => {
    console.log(bookings);
  }, [bookings]);

  const totalPages = Math.max(1, Math.ceil(bookings.length / pageSize));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visibleBookings = bookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function getPageSize() {
    if (typeof window === "undefined") return 5;
    const windowHeight = window.innerHeight || 800;
    const rowHeight = tr_Ref.current ? tr_Ref.current.offsetHeight : 60; // default row height
    const availableHeight = windowHeight - topbarHeight - headerHeight - 200; // reserve for paddings
    setPageSize(() => {
      return Math.max(1, Math.floor(availableHeight / rowHeight));
    });
  }

  function goToPage(page) {
    // Logic to prevent going out of bounds i.e. < 1 or > totalPages
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  }

  // Handle edit booking — open centralized AppModal with form
  const handleEdit = (e, booking) => {
    e.stopPropagation();
    populateModal(
      "Edit Booking",
      <EditBookingForm booking={booking} onUpdate={handleBookingUpdate} />
    );
  };

  // Handle booking update
  const handleBookingUpdate = (updatedBooking) => {
    setBookings((prevBookings) =>
      prevBookings.map((b) =>
        b._id === updatedBooking._id ? updatedBooking : b
      )
    );
  };

  // Handle delete booking
  const handleDelete = async (e, bookingId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Failed to delete booking (${res.status})`);

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      toast.success("Booking deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete booking");
    }
  };

  function handleViewDetails(e, selectedBooking) {
    e.stopPropagation();

    const modalTitle = `Booking Details — ${selectedBooking._id}`;
    
    populateModal(
      modalTitle,
      <BookingView viewBooking={selectedBooking} />
    );
  }

  return (
    <div className="overflow-x-auto bg-white pb-5 mx-6 rounded shadow-sm">
      <table className="table w-full mx-auto">
        <thead className="bg-[#0284c7] text-white text-sm">
          <tr>
            <th className="p-3 mx-1 text-start">Image</th>
            <th className="p-3 mx-1 text-start">Room</th>
            <th className="p-3 mx-1 text-start">Booking ID</th>
            <th className="p-3 mx-1 text-start">Guest</th>
            <th className="p-3 mx-1 text-start">Check-In</th>
            <th className="p-3 mx-1 text-start">Check-Out</th>
            <th className="p-3 mx-1 text-start">Total</th>
            <th className="p-3 mx-1 text-start">Paid</th>
            <th className="p-3 mx-1 text-start">Payment</th>
            <th className="p-3 mx-1 text-start">Status</th>
            <th className="text-center py-3 w-[80px]">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={11}
                className="p-4 text-center text-sm text-gray-500"
              >
                Loading bookings...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={11} className="p-4 text-center text-sm text-red-600">
                Error: {error}
              </td>
            </tr>
          ) : visibleBookings.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="p-4 text-center text-sm text-gray-500"
              >
                No bookings found
              </td>
            </tr>
          ) : (
            visibleBookings.map((booking, index) => {
              const imgSrc =
                booking.room?.img ||
                booking.room?.image ||
                booking.room?.img_url ||
                "/placeholder.jpg";
              const roomNo = booking.room?.room_no || "—";
              const bookingId =
                booking._id || booking.bookingId || `BK${index}`;
              const email =
                booking.guests?.[0]?.email ||
                booking.guests?.[0]?.contactNumber ||
                "—";
              const startDate = booking.checkIn
                ? new Date(booking.checkIn).toLocaleDateString()
                : "—";
              const endDate = booking.checkOut
                ? new Date(booking.checkOut).toLocaleDateString()
                : "—";
              const total = formatCurrency(booking.totalAmount ?? 0);
              const paid = formatCurrency(booking.paidAmount ?? 0);
              const paymentStatus = booking.paymentStatus || "Pending";
              const bookingStatus = booking.status || "Pending";

              return (
                <tr
                  ref={tr_Ref}
                  key={bookingId}
                  className="hover border-b border-gray-300"
                >
                  <td className="p-2">
                    <Image
                      className="w-20 h-[45px] rounded object-cover"
                      src={imgSrc}
                      alt={`Room ${roomNo}`}
                      width={80}
                      height={45}
                    />
                  </td>
                  <td className="p-3">{roomNo}</td>
                  <td className="p-3">{bookingId}</td>
                  <td className="p-3">{email}</td>
                  <td className="p-3">{startDate}</td>
                  <td className="p-3">{endDate}</td>
                  <td className="p-3">{total}</td>
                  <td className="p-3">{paid}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : paymentStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bookingStatus === "Checked-Out"
                          ? "bg-green-100 text-green-800"
                          : bookingStatus === "Checked-In"
                          ? "bg-blue-100 text-blue-800"
                          : bookingStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {bookingStatus}
                    </span>
                  </td>
                  <td className="flex gap-1 justify-center items-center py-3">
                    <button
                      className="text-blue-500 hover:text-blue-100 hover:bg-blue-500 p-1 rounded transition flex items-center justify-center"
                      title="View Details"
                      onClick={(e) => handleViewDetails(e, booking)}
                    >
                      <IoEyeOutline size={18} />
                    </button>
                    <button
                      className="hover:bg-green-500 flex justify-center p-1 rounded mx-auto"
                      onClick={(e) => handleEdit(e, booking)}
                      title="Edit Booking"
                    >
                      <FaEdit className="w-5 h-5 text-green-500 hover:text-gray-100" />
                    </button>
                    <button
                      className="hover:text-red-100 hover:bg-red-500 flex justify-center p-1 rounded mx-auto"
                      onClick={(e) => handleDelete(e, booking._id)}
                      title="Delete Booking"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600 hover:text-white" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Edit Booking now opens inside AppModal via populateModal */}

      {/* Pagination */}
      <div className="flex justify-end pr-6 pt-5 border-t border-gray-100">
        <ul className="flex items-center gap-1 text-sm">
          <li>
            <button
              className={`px-3 py-[5px] border border-gray-100 rounded bg-[#0284c7] text-white ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {pages.map((page) => (
            <li key={page}>
              <button
                onClick={() => goToPage(page)}
                className={`px-3 py-[5px] border border-gray-100 rounded ${
                  page === currentPage
                    ? "bg-[#0284c7] text-white"
                    : "hover:bg-gray-100 transition"
                }`}
              >
                {page}
              </button>
            </li>
          ))}

          <li>
            <button
              className={`px-3 py-[5px] border border-gray-100 rounded bg-[#0284c7] text-white ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}


