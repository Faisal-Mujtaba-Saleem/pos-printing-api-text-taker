"use client";

import React from 'react'
import DashboardSharedHeader from '@/components/shared/DashboardSharedHeader'
import GuestsTable from '@/components/guests/GuestsTable';
import { FaUserShield } from 'react-icons/fa6';

export default function page() {
    return (
        <div className='bg-[#F1F5F9] bg-gradient-to-r from-stone-100 to-blue-50 calc-height'>
            <DashboardSharedHeader Icon={FaUserShield} heading={"Rooms"} />
            <GuestsTable />
        </div>
    )
}