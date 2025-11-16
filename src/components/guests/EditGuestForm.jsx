"use client";

import React, { useEffect, useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useDialog } from "@/contexts/modal-context/context";
import { toast } from "react-toastify";

export default function EditGuestForm({ guest, onUpdate }) {
  const { setIsOpen } = useDialog();

  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    cnic: "",
    email: "",
    gender: "",
    address: "",
    isPrimaryGuest: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!guest) return;
    setFormData({
      fullName: guest.fullName || "",
      contactNumber: guest.contactNumber || "",
      cnic: guest.cnic || "",
      email: guest.email || "",
      gender: guest.gender || "",
      address: guest.address || "",
      isPrimaryGuest: Boolean(guest.isPrimaryGuest),
    });
  }, [guest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guest?._id) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/guests/${guest._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Failed to update guest (${res.status})`);

      const json = await res.json();
      const updatedGuest = json.guest || json || null;
      if (!updatedGuest) throw new Error("No updated guest returned from server");

      if (typeof onUpdate === "function") onUpdate(updatedGuest);
      toast.success("Guest updated successfully");
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 max-w-lg">
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Contact Number</label>
          <input name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">CNIC</label>
          <input name="cnic" type="text" value={formData.cnic} onChange={handleChange} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows={3} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>

        <div className="flex items-center">
          <input type="checkbox" name="isPrimaryGuest" checked={formData.isPrimaryGuest} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
          <label className="ml-2 text-sm text-gray-700">Primary Guest</label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">{loading ? "Updating..." : "Update Guest"}</button>
        </div>
      </form>
    </div>
  );
}
