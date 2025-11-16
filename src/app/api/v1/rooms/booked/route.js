import "@/lib/mongoose/connectDB";
import { NextResponse } from "next/server";
import { RoomServices } from "@/services/room.service";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "@/models/user.model";

export async function GET() {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw new Error("Authenticated user not found in database");

    // 🧩 Step 1: Find all booked room numbers from bookings (scoped to user)
    const roomServices = new RoomServices(user._id);
    const bookedRooms = await roomServices.getBookedRoomsFromDB();

    return NextResponse.json(bookedRooms, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
