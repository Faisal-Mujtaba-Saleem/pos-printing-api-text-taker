"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useDialog } from "@/contexts/modal-context/context";
import RoomCard from "@/components/rooms/RoomCard";
import BookingForm from "@/components/bookings/BookingForm";
import RoomView from "@/components/rooms/RoomView";

/* ---------- Main Page ---------- */
export default function Page() {
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  // selected/showModal removed — booking now opens in AppModal via populateModal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guestRange, setGuestRange] = useState({ min: "", max: "" });
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const searchParams = useSearchParams();
  const { populateModal } = useDialog();

  const types = useMemo(
    () => ["All", ...new Set(rooms.map((r) => r.type))],
    [rooms]
  );

  // Read query params and apply as initial filters
  useEffect(() => {
    if (!searchParams) return;

    const checkInDate = searchParams.get("checkIn");
    if (checkInDate) setCheckIn(checkInDate);

    const checkOutDate = searchParams.get("checkOut");
    if (checkOutDate) setCheckOut(checkOutDate);
  }, [searchParams]);

  // Fetch available rooms from API when search params change
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (checkIn) params.append("checkIn", checkIn);
        if (checkOut) params.append("checkOut", checkOut);

        const res = await fetch(`/api/v1/rooms/available?${params.toString()}`);
        if (!res.ok && res.status !== 404)
          throw new Error(`Server returned ${res.status}`);

        const data = await res.json();
        const fetchedRooms = (Array.isArray(data) ? data : []).map((r) => ({
          id: r._id || r.room_id || r.id,
          room_no: r.room_no || r.roomNo || r.roomNumber || r.room_id || r._id,
          name: r.name,
          type: r.roomType || r.type || "Standard",
          price: r.price,
          capacity: r.capacity,
          available: r.status !== "maintenance",
          features: r.features || [],
          img: r.img || r.image || r.img_url || r.image_url || "",
          status: r.status,
          bookings: r.bookings || [],
        }));
        setRooms(fetchedRooms);
      } catch (err) {
        setError(err.message || "Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };

    if (checkIn && checkOut) {
      fetchRooms();
    }
  }, [checkIn, checkOut, refreshKey]);

  const handleBook = (room) => {
    const title = `Book – ${room.name || room.room_no || "Room"}`;
    const jsx = (
      <BookingForm
        room={room}
        bookingParams={{ checkIn, checkOut }}
        refresher={() => setRefreshKey((prev) => prev + 1)}
      />
    );
    populateModal(title, jsx);
  };

  function handleViewDetails(selectedRoom) {
    const modalTitle = `Room Details - ${selectedRoom.name || "Unnamed room"}`;
    populateModal(
      modalTitle,
      <RoomView room={selectedRoom} checkIn={checkIn} checkOut={checkOut} />
    );
  }

  const filtered = useMemo(() => {
    let list = [...rooms];
    if (typeFilter !== "All") list = list.filter((r) => r.type === typeFilter);
    // Apply guest range filter
    if (guestRange.min !== "") {
      list = list.filter((r) => r.capacity >= Number(guestRange.min));
    }
    if (guestRange.max !== "") {
      list = list.filter((r) => r.capacity <= Number(guestRange.max));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        `${r.name} ${r.type} ${r.features.join(" ")} ${r.room_no || ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "capacity-asc") list.sort((a, b) => a.capacity - b.capacity);
    if (sortBy === "capacity-desc")
      list.sort((a, b) => b.capacity - a.capacity);
    return list;
  }, [rooms, typeFilter, query, sortBy, guestRange]);

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <header className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Available Rooms</h1>
          <p className="text-gray-500">
            Discover and book beautiful rooms — quick filters and instant
            booking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          <div className="flex bg-gray-100 rounded-lg">
            <button
              className={`p-2 rounded-md ${view === "grid"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
                }`}
              onClick={() => setView("grid")}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-md ${view === "list"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
                }`}
              onClick={() => setView("list")}
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Loading / error / active filters */}
      <div className="mb-4">
        {loading && <div className="text-sm text-gray-600">Loading rooms…</div>}
        {error && <div className="text-sm text-red-600">Error: {error}</div>}
        {(checkIn || checkOut) && (
          <div className="flex items-center gap-2 mt-2">
            {checkIn && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                Check-in: {new Date(checkIn).toLocaleDateString()}
              </span>
            )}
            {checkOut && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                Check-out: {new Date(checkOut).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      <section className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent outline-none text-sm"
          >
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm shadow-sm"
        >
          <option value="recommended">Recommended</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="capacity-asc">Capacity: Low → High</option>
          <option value="capacity-desc">Capacity: High → Low</option>
        </select>

        {/* Guest Range Filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <span className="text-sm text-gray-500">Guests:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="Min"
              value={guestRange.min}
              onChange={(e) =>
                setGuestRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-16 bg-transparent outline-none text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min="1"
              placeholder="Max"
              value={guestRange.max}
              onChange={(e) =>
                setGuestRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-16 bg-transparent outline-none text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            className="px-2 py-1 bg-blue-50 text-blue-700 rounded"
            onClick={() => setRefreshKey((prev) => prev + 1)}
          >
            Refresh
          </button>
        </div>

        <div className="ml-auto text-sm text-gray-500">
          {filtered.length} rooms
        </div>
      </section>

      <section
        className={`grid gap-4 ${view === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
          }`}
      >
        {filtered.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-1">
              No rooms match your filters
            </h3>
            <p className="text-sm text-gray-500 mb-3">Try clearing filters.</p>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              onClick={() => {
                setTypeFilter("All");
                setSortBy("recommended");
                setGuestRange({ min: "", max: "" });
                setQuery("");
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              view={view}
              onBook={handleBook}
              onDetails={handleViewDetails}
            />
          ))
        )}
      </section>

      {/* Booking now opens inside AppModal via populateModal (BookingForm) */}
    </main>
  );
}
