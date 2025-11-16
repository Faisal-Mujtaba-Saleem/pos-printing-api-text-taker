"use client";

import React from "react";
import DashboardSharedHeader from "@/components/shared/DashboardSharedHeader";
import BookingsTable from "@/components/bookings/BookingsTable";
import { FaRegCalendarCheck } from "react-icons/fa6";
import { TbCalendarUser } from "react-icons/tb";
import { CheckBookingAvailability } from "@/components/bookings/CheckBookingAvailability";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

export default function page() {
  return (
    <div className="bg-[#F1F5F9] bg-gradient-to-r from-stone-100 to-blue-50 calc-height">
      <DashboardSharedHeader Icon={FaRegCalendarCheck} heading={"Bookings"} />

      {/* Collapsible: Checking Availability Form */}
      <section className="mx-6 mt-6 mb-8">
        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton className="w-full flex items-center justify-between bg-white rounded-md shadow-sm p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <TbCalendarUser className="text-2xl text-teal-600" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">Check Booking Availability</h3>
                  </div>
                </div>
                <ChevronUpIcon className={`w-5 h-5 text-gray-500 transform ${open ? "rotate-180" : "rotate-0"}`} />
              </DisclosureButton>

              <DisclosurePanel className="mt-3">
                <div className="bg-transparent">
                  <CheckBookingAvailability />
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </section>

      <section>
        <BookingsTable />
      </section>
    </div>
  );
}
