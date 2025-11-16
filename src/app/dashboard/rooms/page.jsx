"use client";

import React from "react";
import DashboardSharedHeader from "@/components/shared/DashboardSharedHeader";
import RoomsTable from "@/components/rooms/RoomsTable";
import { SiHomebridge } from "react-icons/si";
import { IoAdd } from "react-icons/io5";
import { useDialog } from "@/contexts/modal-context/context";
import AddRoomForm from "@/components/rooms/AddRoomForm";

const AddBtn = () => {
  const { populateModal } = useDialog();

  const handleAddRoom = () => {
    // Open the Add Room modal (populate modal with form JSX)
    populateModal("Add Room", <AddRoomForm />);
  };

  return (
    <button
      className="bg-teal-600 px-4 py-2 gap-2 text-white font-medium rounded text-sm 
      w-auto text-center flex items-center justify-center"
      onClick={handleAddRoom}
    >
      <IoAdd />
      Add Room
    </button>
  );
};

export default function page() {
  return (
    <div className="bg-[#F1F5F9] bg-gradient-to-r from-stone-100 to-blue-50 calc-height">
      <DashboardSharedHeader
        Icon={SiHomebridge}
        heading={"Rooms"}
        AddBtn={<AddBtn />}
      />
      <RoomsTable />
    </div>
  );
}
