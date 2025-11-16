import "@/lib/mongoose/connectDB";
import { User } from "@/models/user.model";
import { RoomServices } from "@/services/room.service";
import { currentUser } from "@clerk/nextjs/server";
import { ServerError } from "@/utlis/ServerError";
import { NextResponse } from "next/server";

/** 🏠 POST → Add new room */
export async function POST(req) {
  try {
    const data = await req.json();

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user)
      throw ServerError("Authenticated user not found in database", 404);

    const roomServices = new RoomServices(user._id);
    const room = await roomServices.addRoomToDB(data);

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

/** 📖 GET → Get all rooms (with optional filters) */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get("status") || undefined,
      roomType: searchParams.get("roomType") || undefined,
    };

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const roomServices = new RoomServices(user._id);
    const rooms = await roomServices.getAllRoomsFromDB(filters);

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
