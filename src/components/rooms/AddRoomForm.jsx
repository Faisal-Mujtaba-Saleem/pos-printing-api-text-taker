"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import AddRoomTab from "./AddRoomTab";
import UploadRoomsTab from "./UploadRoomsTab";

export default function AddRoomForm() {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-3">
        {["form", "csv"].map((tab) => (
          <motion.button
            key={tab}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg font-medium shadow-sm border transition-all ${
              activeTab === tab
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab === "form" ? "Add Room" : "Upload CSV"}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "form" ? <AddRoomTab /> : <UploadRoomsTab />}
    </div>
  );
}
