"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FaEdit } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { useElementsHeights } from "@/contexts/elements-heights-context/context";
import { useDialog } from "@/contexts/modal-context/context";
import { useRooms } from "@/contexts/rooms-context/context";
import RoomView from "./RoomView";
import EditRoomForm from "./EditRoomForm";

export default function RoomsTable() {
  const { rooms, loading, error, fetchRooms, deleteRoom } = useRooms();
  const { topbarHeight, headerHeight } = useElementsHeights();
  const { populateModal } = useDialog();

  // Pagination state / config

  // Pagination state / config
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const tr_Ref = useRef(null);

  useEffect(() => {
    const handleResize = () => getPageSize();
    window.addEventListener("resize", handleResize);
    getPageSize(); // initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch rooms from API
  useEffect(() => {
    let cleanup;
    fetchRooms().then((result) => {
      cleanup = result;
    }).catch((err) => {
      console.error(err.message);
    });;
    return cleanup;
  }, []);

  const totalPages = Math.max(1, Math.ceil(rooms.length / pageSize));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visibleRooms = rooms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function getPageSize() {
    if (typeof window === "undefined") return 5;
    const windowHeight = window.innerHeight || 800;
    const rowHeight = tr_Ref.current ? tr_Ref.current.offsetHeight : 60; // default row height
    const availableHeight = windowHeight - topbarHeight - headerHeight - 200; // 200 - reserve for paddings
    setPageSize(() => {
      return Math.max(1, Math.floor(availableHeight / rowHeight));
    });
  }

  function goToPage(page) {
    // Logic to prevent going out of bounds i.e. < 1 or > totalPages
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  }

  // Handle edit room
  const handleEdit = (e, selectedRoom) => {
    e.stopPropagation();
    populateModal("Edit Room", <EditRoomForm room={selectedRoom} />);
  };

  // Handle delete room
  const handleDelete = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await deleteRoom(roomId);
    } catch (err) {
      // Error is already handled in context with toast
      console.error(err);
    }
  };

  const handleViewDetails = (room) => {
    const modalTitle = `Room — ${room.name || room.room_no || "#"}`;
    populateModal(modalTitle, <RoomView room={room} />);
  };

  return (
    <div className="overflow-x-auto bg-white pb-5 mx-6 rounded shadow-sm">
      <table className="table w-full mx-auto">
        <thead className="bg-[#0284c7] text-white text-sm">
          <tr>
            <th className="p-3 text-start">Image</th>
            <th className="p-3 text-start">Room No</th>
            <th className="p-3 text-start">Name</th>
            <th className="p-3 text-start">Type</th>
            <th className="p-3 text-start">Price</th>
            <th className="p-3 text-start">Capacity</th>
            <th className="p-3 text-start">Features</th>
            <th className="p-3 text-start">Status</th>
            <th className="text-center py-3 w-[80px]">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="p-4 text-center text-sm text-gray-500">
                Loading rooms...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9} className="p-4 text-center text-sm text-red-600">Error: {error}</td>
            </tr>
          ) : visibleRooms.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-4 text-center text-sm text-gray-500">No rooms found</td>
            </tr>
          ) : (
            visibleRooms.map((room, index) => {
              const imgSrc = room.img || room.image || "/placeholder.jpg";
              const roomNo = room.room_no || "—";
              const name = room.name || "—";
              const roomType = room.roomType || "—";
              const price = room.price ?? "—";
              const capacity = room.capacity ?? "—";
              const features = Array.isArray(room.features) ? room.features.join(", ") : (room.features || "—");
              const status = room.status || "—";

              return (
                <tr ref={tr_Ref} key={room._id || index} className="hover border-b border-gray-300">
                  <td className="p-2">
                    <Image className="w-20 h-[45px] rounded object-cover" src={imgSrc} alt={`Room ${roomNo}`} width={80} height={45} />
                  </td>
                  <td className="p-3">{roomNo}</td>
                  <td className="p-3">{name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${roomType === "Suite" ? "bg-purple-100 text-purple-700" :
                      roomType === "Deluxe" ? "bg-blue-100 text-blue-700" :
                        roomType === "Standard" ? "bg-green-100 text-green-700" :
                          roomType === "Family" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-700"
                      }`}>
                      {roomType}
                    </span>
                  </td>
                  <td className="p-3">{typeof price === "number" ? `$${price}` : price}</td>
                  <td className="p-3">{capacity} {capacity !== "—" ? "guests" : ""}</td>
                  <td className="p-3 max-w-[200px] truncate" title={features}>{features}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${status === "available" ? "bg-green-100 text-green-700" :
                      status === "maintenance" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                      {status}
                    </span>
                  </td>
                  <td className="flex gap-1 justify-center items-center py-3">
                    <button title="View details" onClick={() => handleViewDetails(room)} className="text-blue-500 hover:text-blue-100 hover:bg-blue-500 p-1 rounded transition flex items-center justify-center">
                      <IoEyeOutline size={18} />
                    </button>

                    <button title="Edit room" onClick={(e) => handleEdit(e, room)} className="hover:bg-green-500 flex justify-center p-1 rounded mx-auto">
                      <FaEdit className="w-5 h-5 text-green-500 hover:text-gray-100" />
                    </button>

                    <button title="Delete room" onClick={(e) => handleDelete(e, room._id)} className="hover:text-red-100 hover:bg-red-500 flex justify-center p-1 rounded mx-auto">
                      <TrashIcon className="w-5 h-5 text-red-600 hover:text-white" />
                    </button>

                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* No need for Edit Modal here anymore as we're using global modal context */}

      {/* Pagination */}
      <div className="flex justify-end pr-6 pt-5 border-t border-gray-100">
        <ul className="flex items-center gap-1 text-sm">
          <li>
            <button
              className={`px-3 py-[5px] border border-gray-100 rounded bg-[#0284c7] text-white ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {pages.map((page) => (
            <li key={page}>
              <button
                onClick={() => goToPage(page)}
                className={`px-3 py-[5px] border border-gray-100 rounded ${page === currentPage
                  ? "bg-[#0284c7] text-white"
                  : "hover:bg-gray-100 transition"
                  }`}
              >
                {page}
              </button>
            </li>
          ))}

          <li>
            <button
              className={`px-3 py-[5px] border border-gray-100 rounded bg-[#0284c7] text-white ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
