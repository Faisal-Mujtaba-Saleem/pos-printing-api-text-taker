"use client";

import React from "react";
import { IoAdd } from "react-icons/io5";
import { useElementsHeights } from "@/contexts/elements-heights-context/context";

export default function DashboardSharedHeader({
  Icon,
  heading,
  AddBtn = <></>,
}) {
  const { headerRef } = useElementsHeights();

  return (
    <header
      ref={headerRef}
      className={`border border-gray-200 text-xl text-black mb-8 py-2 px-5 font-bold bg-[#F8FAFC] ${
        !!AddBtn && `flex items-center justify-between`
      }`}
    >
      <p className="h-14 p-5 flex items-center gap-3">
        <Icon />
        {heading}
      </p>
      {!!AddBtn && <div className="flex items-center gap-2">{AddBtn}</div>}
    </header>
  );
}
