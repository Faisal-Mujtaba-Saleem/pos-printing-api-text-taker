"use client";

import React, { useEffect, useState } from "react";
import { useDialog } from "@/contexts/modal-context/context";
import { toast } from "react-toastify";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function EditBookingForm({ booking, onUpdate }) {
  const { setIsOpen } = useDialog();

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    totalAmount: 0,
    paidAmount: 0,
    paymentStatus: "Pending",
    status: "Pending",
    guests: [],
  });

  const [newGuest, setNewGuest] = useState({
    fullName: "",
    contactNumber: "",
    cnic: "",
    email: "",
    gender: "Male",
    address: "",
    isPrimaryGuest: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        checkIn: booking.checkIn ? new Date(booking.checkIn).toISOString().split("T")[0] : "",
        checkOut: booking.checkOut ? new Date(booking.checkOut).toISOString().split("T")[0] : "",
        totalAmount: booking.totalAmount || 0,
        paidAmount: booking.paidAmount || 0,
        paymentStatus: booking.paymentStatus || "Pending",
        status: booking.status || "Pending",
        guests: (booking.guests && Array.isArray(booking.guests))
          ? booking.guests.map(g => ({
            _id: g._id || g.id,
            fullName: g.fullName || "",
            contactNumber: g.contactNumber || "",
            cnic: g.cnic || "",
            email: g.email || "",
            gender: g.gender || "Male",
            address: g.address || "",
            isPrimaryGuest: g.isPrimaryGuest || false,
          }))
          : [],
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: /Amount/i.test(name) ? Number(value) : value,
    }));
  };

  const handleGuestInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGuest((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add guest handler
  const handleAddGuest = () => {
    // Validation
    if (!newGuest.fullName.trim()) {
      toast.error("Guest full name is required");
      return;
    }
    if (!newGuest.contactNumber.trim()) {
      toast.error("Contact number is required");
      return;
    }
    if (!newGuest.cnic.trim()) {
      toast.error("CNIC is required");
      return;
    }
    if (!newGuest.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!newGuest.address.trim()) {
      toast.error("Address is required");
      return;
    }

    const guestToAdd = {
      id: `temp_${Date.now()}`,
      fullName: newGuest.fullName.trim(),
      contactNumber: newGuest.contactNumber.trim(),
      cnic: newGuest.cnic.trim(),
      email: newGuest.email.trim(),
      gender: newGuest.gender,
      address: newGuest.address.trim(),
      isPrimaryGuest: newGuest.isPrimaryGuest,
    };

    setFormData((prev) => ({
      ...prev,
      guests: [...prev.guests, guestToAdd],
    }));

    // Reset form
    setNewGuest({
      fullName: "",
      contactNumber: "",
      cnic: "",
      email: "",
      gender: "Male",
      address: "",
      isPrimaryGuest: false,
    });
    toast.success("Guest added!");
  };

  // Remove guest handler
  const handleRemoveGuest = (guestId) => {
    setFormData((prev) => ({
      ...prev,
      guests: prev.guests.filter(g => g._id !== guestId && g.id !== guestId),
    }));
    toast.success("Guest removed!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking?._id) return;
    setLoading(true);

    try {
      // Only send existing guest IDs (those with MongoDB _id)
      const payload = {
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        totalAmount: formData.totalAmount,
        paidAmount: formData.paidAmount,
        paymentStatus: formData.paymentStatus,
        status: formData.status,
        guests: formData.guests,
      };

      const res = await fetch(`/api/v1/bookings/${booking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to update booking (${res.status})`);
      }

      const updatedBooking = await res.json();
      const payload_data = updatedBooking.booking || updatedBooking || null;
      if (typeof onUpdate === "function") onUpdate(payload_data);
      toast.success("Booking updated successfully!");
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="mt-4 space-y-6">

        {/* Booking Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                min="0"
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                min="0"
                max={formData.totalAmount}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Booking Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Checked-Out">Checked-Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guests Management */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Guests ({formData.guests.length})</h3>

          {/* Add Guest Section */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Add New Guest</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={newGuest.fullName}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="+92-300-1234567"
                  value={newGuest.contactNumber}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* CNIC */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">CNIC *</label>
                <input
                  type="text"
                  name="cnic"
                  placeholder="42101-1234567-1"
                  value={newGuest.cnic}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={newGuest.email}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Gender *</label>
                <select
                  name="gender"
                  value={newGuest.gender}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-700 block mb-1">Address *</label>
                <textarea
                  name="address"
                  placeholder="Street address, city, country"
                  value={newGuest.address}
                  onChange={handleGuestInputChange}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Primary Guest Checkbox */}
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPrimaryGuest"
                  checked={newGuest.isPrimaryGuest}
                  onChange={handleGuestInputChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">Mark as Primary Guest</label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddGuest}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="w-4 h-4" />
              Add Guest
            </button>
          </div>

          {/* Guests List */}
          {formData.guests.length > 0 ? (
            <div className="space-y-3">
              {formData.guests.map((guest) => (
                <div
                  key={guest._id || guest.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{guest.fullName}</p>
                        {guest.isPrimaryGuest && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">Primary</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{guest.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGuest(guest._id || guest.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                      title="Remove guest"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">Phone:</span> {guest.contactNumber}</div>
                    <div><span className="font-medium">CNIC:</span> {guest.cnic}</div>
                    <div><span className="font-medium">Gender:</span> {guest.gender}</div>
                    <div className="sm:col-span-2"><span className="font-medium">Address:</span> {guest.address}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No guests added yet</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
          >
            {loading ? "Updating..." : "Update Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
