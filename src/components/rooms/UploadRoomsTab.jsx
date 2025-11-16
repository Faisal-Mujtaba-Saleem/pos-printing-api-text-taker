"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { IoCloudUpload } from "react-icons/io5";
import { TbFileSpreadsheet } from "react-icons/tb";
import { FaRegCheckCircle } from "react-icons/fa";
import { useDialog } from "@/contexts/modal-context/context";
import { useRooms } from "@/contexts/rooms-context/context";
import { useActionState } from "react";
import { uploadRoomsAction } from "@/app/actions/rooms.actions/uploadRoomsAction";

export default function UploadRoomsTab() {
  const { setIsOpen } = useDialog();
  const { addRoom } = useRooms();
  const [csvFile, setCsvFile] = useState(null);

  const [state, formAction, pending] = useActionState(
    async (prevState, formData) => {
      try {
        const result = await uploadRoomsAction(formData);
        if (result.success) {
          if (Array.isArray(result.rooms)) result.rooms.forEach(addRoom);
          toast.success("Rooms uploaded successfully!");
          return { success: true, error: null };
        } else {
          toast.error(result.error || "Upload failed");
          return { success: false, error: result.error };
        }
      } catch (err) {
        toast.error("Unexpected error: " + err.message);
        return { success: false, error: err.message };
      }
    },
    { success: false, error: null }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-md"
    >
      <form
        action={formAction}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div
          onDrop={(e) => {
            e.preventDefault();
            setCsvFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          className={`w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
            csvFile
              ? "border-teal-500 bg-teal-50"
              : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
          }`}
        >
          <IoCloudUpload
            className={`mx-auto mb-3 ${
              csvFile ? "text-teal-500" : "text-gray-400"
            }`}
            size={42}
          />
          {csvFile ? (
            <div className="flex flex-col items-center">
              <TbFileSpreadsheet className="text-teal-600 mb-1" />
              <p className="text-sm font-medium text-teal-700">
                {csvFile.name}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              Drag & drop your <strong>CSV file</strong> here <br /> or click
              below to browse
            </p>
          )}
        </div>

        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700 border rounded-md py-2 px-3"
          required
        />

        {state.success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-green-600"
          >
            <FaRegCheckCircle size={20} />
            <span>Upload successful!</span>
          </motion.div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 rounded-lg border bg-white text-gray-700 hover:bg-gray-100"
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
            disabled={pending || !csvFile}
          >
            {pending ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
