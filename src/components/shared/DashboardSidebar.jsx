"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import { HomeIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { SiHomebridge } from "react-icons/si";
import { FaRegCalendarCheck, FaUserShield } from "react-icons/fa6";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export const DashboardSideBar = forwardRef((props, ref) => {
  const [mounted, setMounted] = useState(false);

  const { user, isLoaded } = useUser();

  useEffect(() => setMounted(true), []);

  const pathname = usePathname();

  // 2️⃣ If not mounted or Clerk not ready, render a static placeholder
  if (!mounted || !isLoaded) {
    return (
      <div
        ref={ref}
        className="bg-[#0F172A] fixed w-56 h-full shadow-lg z-10"
      ></div>
    );
  }

  return (
    <div ref={ref} className="bg-[#0F172A] fixed w-56 h-full shadow-lg z-10">
      {/* Sidebar Logo */}
      <div className="flex justify-center mt-6 mb-14">
        {user && user.hasImage ? (
          <img
            src={profilePic}
            className="w-20 h-auto rounded-full ring-4 ring-offset-4"
            alt="company logo"
          />
        ) : (
          <UserCircleIcon className="w-20 h-auto rounded-full ring-4 ring-offset-4 text-white" />
        )}
      </div>
      <p className="text-white -mt-10 font-bold text-xl text-center mb-4 rounded-full w-48  mx-auto">
        {user && user.fullName}
      </p>
      {/* Sidebar Menu */}
      <div className="flex flex-col py-2">
        <Link href="/dashboard">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${typeof window !== "undefined" &&
                pathname === "/dashboard"
                ? "bg-[#ea3d5a] text-white rounded-r-full"
                : "text-white hover:bg-[#ea3d5a] hover:text-white rounded-r-full"
              }`}
          >
            <div className="mr-2">
              <HomeIcon className="w-5 h-5" />
            </div>
            <p>Home</p>
          </div>
        </Link>
        <Link href="/dashboard/bookings">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${typeof window !== "undefined" &&
                pathname === "/dashboard/bookings"
                ? "bg-[#ea3d5a] text-white rounded-r-full"
                : "text-white hover:bg-[#ea3d5a] hover:text-white rounded-r-full"
              }`}
          >
            <div className="mr-2">
              {/* <TbHomeBolt className='w-5 h-5' /> */}
              <FaRegCalendarCheck className="w-5 h-5" />
            </div>
            <p> Bookings</p>
          </div>
        </Link>

        <Link href="/dashboard/rooms">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${typeof window !== "undefined" &&
                pathname === "/dashboard/rooms"
                ? "bg-[#ea3d5a] text-white rounded-r-full"
                : "text-white hover:bg-[#ea3d5a] hover:text-white rounded-r-full"
              }`}
          >
            <div className="mr-2">
              <SiHomebridge className="w-5 h-5" />
            </div>
            <p>Rooms</p>
          </div>
        </Link>
        <Link href="/dashboard/guests">
          <div
            className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${typeof window !== "undefined" &&
                pathname === "/dashboard/guests"
                ? "bg-[#ea3d5a] text-white rounded-r-full"
                : "text-white hover:bg-[#ea3d5a] hover:text-white rounded-r-full"
              }`}
          >
            <div className="mr-2">
              <FaUserShield className="w-5 h-5" />
            </div>
            <p>Guests</p>
          </div>
        </Link>
      </div>
    </div>
  );
});
