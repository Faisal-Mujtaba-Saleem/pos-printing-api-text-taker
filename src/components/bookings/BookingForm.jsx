"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FaBed } from "react-icons/fa";
import { toast } from "react-toastify";
import calculateNights from "@/utlis/date-time-utils/calculateNights";
import { formatCurrency } from "@/utlis/formatCurrency";
import { useDialog } from "@/contexts/modal-context/context";

export default function BookingForm({ room, bookingParams = {}, refresher }) {
  const { checkIn, checkOut } = bookingParams || {};
  const { setIsOpen } = useDialog();

  const [guests, setGuests] = useState([
    {
      fullName: "",
      contactNumber: "",
      email: "",
      cnic: "",
      gender: "Male",
      address: "",
      isPrimaryGuest: true,
    },
  ]);

  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset when room changes
    setGuests([
      {
        fullName: "",
        contactNumber: "",
        email: "",
        cnic: "",
        gender: "Male",
        address: "",
        isPrimaryGuest: true,
      },
    ]);
    setPaidAmount(0);
  }, [room?._id]);

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [
    checkIn,
    checkOut,
  ]);

  const totalAmount = useMemo(() => {
    const price = Number(room?.price || 0);
    return nights ? price * nights : price;
  }, [room?.price, nights]);

  if (!room) return <div className="p-4">No room selected.</div>;

  const addGuest = () =>
    setGuests((g) => [
      ...g,
      { fullName: "", contactNumber: "", email: "", cnic: "", gender: "Male", address: "", isPrimaryGuest: false },
    ]);

  const removeGuest = (index) =>
    setGuests((g) => g.filter((_, i) => i !== index));

  const handleGuestChange = (index, field, value) =>
    setGuests((g) => g.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

  const handlePrimarySelect = (index) =>
    setGuests((g) => g.map((it, i) => ({ ...it, isPrimaryGuest: i === index })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates before booking.");
      return;
    }

    // validate guests against Guest model required fields
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.fullName || !g.contactNumber || !g.email || !g.cnic || !g.gender || !g.address) {
        toast.error(`Please fill required fields for Guest ${i + 1} (name, contact, email, CNIC, gender, address)`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        room: room.id || room._id,
        checkIn,
        checkOut,
        nights: nights || 1,
        guests: guests.map((g) => ({
          fullName: g.fullName,
          contactNumber: g.contactNumber,
          email: g.email,
          cnic: g.cnic,
          gender: g.gender,
          address: g.address,
          isPrimaryGuest: !!g.isPrimaryGuest,
        })),
        totalAmount,
        paidAmount: Number(paidAmount) || 0,
      };

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Booking failed");

      toast.success("Booking created successfully");
      if (typeof refresher === "function") refresher();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="flex items-start gap-4">
        <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
          {room.img ? (
            <Image src={room.img} alt={room.name || "Room"} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FaBed className="text-blue-500 text-3xl opacity-80" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold">{room.name || "Room"}</h3>
          <div className="text-sm text-gray-500">{room.type || room.roomType}</div>
          <div className="mt-2 text-blue-600 font-bold text-lg">{formatCurrency(room.price || 0)} <span className="text-xs font-normal text-gray-500">/ night</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Check-in</label>
          <div className="mt-1 text-sm">{checkIn ? new Date(checkIn).toLocaleDateString() : "—"}</div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Check-out</label>
          <div className="mt-1 text-sm">{checkOut ? new Date(checkOut).toLocaleDateString() : "—"}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-sm font-semibold mb-2">Guests</h4>
        <div className="space-y-3">
          {guests.map((g, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="primaryGuest"
                    checked={g.isPrimaryGuest}
                    onChange={() => handlePrimarySelect(i)}
                    className="accent-blue-600"
                  />
                  <div className="text-sm font-medium">Guest {i + 1}</div>
                </div>
                <div>
                  {guests.length > 1 && (
                    <button type="button" onClick={() => removeGuest(i)} className="text-sm text-red-600">Remove</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  placeholder="Full name"
                  value={g.fullName}
                  onChange={(e) => handleGuestChange(i, "fullName", e.target.value)}
                  className="border rounded px-2 py-1"
                />

                <input
                  placeholder="Contact number"
                  value={g.contactNumber}
                  onChange={(e) => handleGuestChange(i, "contactNumber", e.target.value)}
                  className="border rounded px-2 py-1"
                />

                <input
                  placeholder="CNIC"
                  value={g.cnic}
                  onChange={(e) => handleGuestChange(i, "cnic", e.target.value)}
                  className="border rounded px-2 py-1"
                />

                <input
                  placeholder="Email"
                  value={g.email}
                  onChange={(e) => handleGuestChange(i, "email", e.target.value)}
                  className="border rounded px-2 py-1"
                />

                <select
                  value={g.gender}
                  onChange={(e) => handleGuestChange(i, "gender", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input
                  placeholder="Address"
                  value={g.address}
                  onChange={(e) => handleGuestChange(i, "address", e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
          ))}

          <div>
            <button type="button" onClick={addGuest} className="text-sm text-blue-600">+ Add guest</button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Nights</div>
            <div className="font-medium">{nights || 1}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-lg font-bold">{formatCurrency(totalAmount)}</div>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-sm text-gray-600">Amount paid (optional)</label>
          <input
            type="number"
            min={0}
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-2"
            placeholder="Enter paid amount"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Booking..." : "Confirm booking"}</button>
      </div>
    </form>
  );
}
