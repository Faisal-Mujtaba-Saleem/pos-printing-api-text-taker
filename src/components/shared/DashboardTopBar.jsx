"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bars3CenterLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import {
  SignedIn,
  useUser,
} from "@clerk/nextjs";
import SignedInNavMenu from "./SignedInNavMenu";
import { useElementsHeights } from "@/contexts/elements-heights-context/context";
import { usePathname } from "next/navigation";

export default function DashboardTopBar({ showNav, setShowNav }) {
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  const { isLoaded } = useUser();
  const { topbarRef } = useElementsHeights();

  useEffect(() => setMounted(true), []);

  // 2️⃣ Always render *some stable structure* during SSR
  if (!mounted || !isLoaded) {
    return (
      <div
        ref={topbarRef}
        className="w-full h-16 bg-white shadow-sm"
      ></div>
    );
  }
  return (
    <nav
      ref={topbarRef}
      className={`fixed z-10 w-full h-16 flex justify-between items-center transition-all duration-400ms ${showNav ? "ps-56" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="ps-4 md:ps-16">
          <Bars3CenterLeftIcon
            className="h-5 text-gray-700 cursor-pointer"
            onClick={() => setShowNav(!showNav)}
          />
        </div>
        {
          (pathname.startsWith("/dashboard") && pathname !== "/dashboard")
          &&
          (
            <Link
              href="/"
              className="flex items-center justify-between w-[30%] border border-gray-300 rounded-md text-sm py-1.5 px-2.5 bg-transparent text-gray-700 hover:text-white hover:bg-blue-500"
            >
              <HomeIcon width={"15%"} />
              Back To Home
            </Link>
          )
        }
      </div>

      <div className="flex items-center justify-self-end pr-4 md:pr-16">
        <SignedIn>
          <SignedInNavMenu />
        </SignedIn>
      </div>
    </nav>
  );
}
