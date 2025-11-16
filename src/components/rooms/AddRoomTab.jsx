"use client";
import React, { useState } from "react";
import { useDialog } from "@/contexts/modal-context/context";
import { useRooms } from "@/contexts/rooms-context/context";
import { toast } from "react-toastify";

export default function AddRoomTab() {
  const { setIsOpen } = useDialog();
  const { addRoom } = useRooms();
  const [form, setForm] = useState({
    room_no: "",
    name: "",
    roomType: "Standard",
    price: "",
    capacity: "1",
    features: "",
    img: "",
    status: "available",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price) {
      setError("Room name and price are required");
      return;
    }

    const payload = {
      room_no: form.room_no ? Number(form.room_no) : undefined,
      name: form.name,
      roomType: form.roomType,
      price: Number(form.price),
      capacity: Number(form.capacity),
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      img: form.img,
      status: form.status,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/v1/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add room");

      addRoom(data);
      toast.success("Room added successfully");
      setIsOpen(false);
    } catch (err) {
      const message = (err && err.message) || String(err) || "Unknown error";
      console.error(err);
      setError(message);
      toast.error(message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn py-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Room #
        </label>
        <input
          name="room_no"
          value={form.room_no}
          onChange={handleChange}
          type="number"
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Optional - leave empty to auto-assign"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option>Suite</option>
            <option>Deluxe</option>
            <option>Standard</option>
            <option>Family</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            type="number"
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            type="number"
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="available">available</option>
            <option value="maintenance">maintenance</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Features (comma separated)
        </label>
        <input
          name="features"
          value={form.features}
          onChange={handleChange}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="e.g. AC,Free Wifi,Sea View"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          name="img"
          value={form.img}
          onChange={handleChange}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 rounded-md border bg-white"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-teal-600 text-white"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Room"}
        </button>
      </div>
    </form>
  );
}
