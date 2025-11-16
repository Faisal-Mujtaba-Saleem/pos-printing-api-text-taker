"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const CheckBookingAvailability = () => {
  // Use Date objects for react-datepicker
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());

  const router = useRouter();
  
  function handleCheckAvailability() {
    if (!checkInDate || !checkOutDate) {
      // simple guard; adapt as needed
      toast.error("Please select both check-in and check-out dates.");
      return;
    }

    const queryParams = new URLSearchParams({
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
    }).toString();

    router.push(`/dashboard/available-rooms?${queryParams}`);
  }

  // DateInput uses react-datepicker and preserves the calendar icon
  const DateInput = ({ placeholder, selected, onChange, minDate }) => (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholder}
        dateFormat="yyyy/MM/dd"
        minDate={minDate ?? new Date()}
        className="w-full bg-gray-50 text-gray-900 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-300"
      />
      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );

  return (
    <>
      <div className="container mx-auto px-4 my-8 relative z-10">
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-4xl mx-auto relative z-[9999]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Check In Date */}
            <div className="space-y-2 relative z-50">
              <label className="block text-sm font-medium text-gray-700">
                Check In
              </label>
              <DateInput
                placeholder="Select date"
                selected={checkInDate}
                onChange={(date) => {
                  setCheckInDate(date);
                  // If checkout is before new checkin, reset it
                  if (checkOutDate && date && checkOutDate <= date) {
                    setCheckOutDate(null);
                  }
                }}
              />
            </div>

            {/* Check Out Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Check Out
              </label>
              <DateInput
                placeholder="Select date"
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                minDate={checkInDate}
              />
            </div>

            {/* Check Availability Button */}
            <div className="space-y-2 self-end">
              <button
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium py-2 px-2 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 text-base"
                onClick={handleCheckAvailability}
              >
                <div className="flex items-center justify-center">
                  <FaSearch className="mr-2" />
                  Check Availability
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
