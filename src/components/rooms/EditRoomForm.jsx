"use client";

import React, { useEffect, useState } from "react";
import { useDialog } from "@/contexts/modal-context/context";
import { useRooms } from "@/contexts/rooms-context/context";
import { toast } from "react-toastify";

export default function EditRoomForm({ room }) {
  const { setIsOpen } = useDialog();
  const { updateRoom } = useRooms();
  const [formData, setFormData] = useState({
    name: "",
    room_no: "",
    roomType: "Standard",
    price: 0,
    capacity: 1,
    features: "",
    img: "",
    status: "available",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room) return;
    setFormData({
      name: room.name || "",
      room_no: room.room_no ?? "",
      roomType: room.roomType || "Standard",
      price: room.price ?? 0,
      capacity: room.capacity ?? 1,
      features: Array.isArray(room.features) ? room.features.join(", ") : (room.features || ""),
      img: room.img || "",
      status: room.status || "available",
    });
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room?._id) return;
    setLoading(true);

    // prepare payload: convert features string to array
    const payload = {
      ...formData,
      features: (formData.features || "")
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(`/api/v1/rooms/${room._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to update room (${res.status})`);

      const json = await res.json();
      // expect json.room or full updated room; be resilient
      const updated = json.room || json || null;
      if (!updated) throw new Error("No updated room returned from server");

      updateRoom(updated);
      toast.success("Room updated successfully");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-2">
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Room No</label>
              <input
                name="room_no"
                value={formData.room_no}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                required
              >
                <option>Suite</option>
                <option>Deluxe</option>
                <option>Standard</option>
                <option>Family</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
              >
                <option value="available">available</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                min={0}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                min={1}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Features (comma separated)</label>
              <input
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                placeholder="e.g. WiFi, AC, Sea view"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Image URL</label>
              <input
                name="img"
                value={formData.img}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
