import { NextResponse } from "next/server";
import "@/lib/mongoose/connectDB";
import { RoomServices } from "@/services/room.service";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "@/models/user.model";

/** 🔎 GET → Search available rooms between dates */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("checkIn");
    const endDate = searchParams.get("checkOut");

    if (!startDate || !endDate)
      throw new ServerError("Both start and end dates are required", 400);

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });
    if (!user) throw new ServerError("Authenticated user not found in database", 404);

    const roomServices = new RoomServices(user._id);
    const availableRooms = await roomServices.searchAvailableRoomsFromDB(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json(availableRooms, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
