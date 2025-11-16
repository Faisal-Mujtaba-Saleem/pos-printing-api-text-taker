"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import UserAvatar from "@/assets/avatar.png";

export default function SignedInNavMenu() {
  const { user } = useUser();
  const profilePic = user?.hasImage ? user?.imageUrl : UserAvatar;

  return (
    <SignedIn>
      <Menu as="div" className="relative inline-block text-left">
        <div className="flex items-center justify-center gap-2">
          <Menu.Button className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-50 hover:text-gray-700">
            <Image
              src={profilePic}
              className="rounded-full w-5 md:mr-4 border-2 border-white shadow-sm avatar online ring-offset-blue-500 ring-offset-2"
              alt="profile_picture"
            />
            <span className="hidden md:block font-medium">
              {user?.fullName}
            </span>
            <ChevronDownIcon className="h-4 w-4" />
          </Menu.Button>
          <UserButton />
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5">
            <div className="py-1">
              {typeof window !== "undefined" &&
                !window.location.pathname.includes("dashboard") && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/dashboard"
                        className={`block px-4 py-2 text-sm ${active ? "bg-blue-100 text-blue-700" : "text-gray-700"
                          }`}
                      >
                        <div className="py-2 flex items-center gap-2">
                          <SquaresPlusIcon className="h-4 w-4" />
                          <span className="hidden md:block font-medium text-gray-700">
                            Dashboard
                          </span>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                )}
              <Menu.Item>
                <div className="p-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-blue-100 hover:text-blue-700">
                  <ArrowLeftCircleIcon className="h-4 w-4" />
                  <span className="hidden md:block font-medium">
                    <SignOutButton />
                  </span>
                </div>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </SignedIn>
  );
}
