"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const RoomsContext = createContext();

export default function RoomsContextProvider({ children }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log({ rooms });
  }, [rooms])


  // Fetch rooms from API
  const fetchRooms = async () => {
    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/rooms", { signal });
      if (!res.ok && res.status !== 404)
        throw new Error(`Failed to fetch rooms (${res.status})`);

      const data = await res.json();
      console.log(data);
      
      setRooms(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }

    return () => controller.abort(); // optional cleanup
  };

  // Add new room
  const addRoom = (newRoom) => {
    setRooms((prev) => [...prev, newRoom]);
  };

  // Update room
  const updateRoom = (updatedRoom) => {
    setRooms((prev) =>
      prev.map((room) => (room._id === updatedRoom._id ? updatedRoom : room))
    );
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    try {
      const res = await fetch(`/api/v1/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete room (${res.status})`);
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
      toast.success("Room deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete room");
      throw err; // Re-throw to handle in component if needed
    }
  };

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        setRooms,
        loading,
        error,
        fetchRooms,
        addRoom,
        updateRoom,
        deleteRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}

export const useRooms = () => {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error("useRooms must be used within a RoomsContextProvider");
  }
  return context;
};
