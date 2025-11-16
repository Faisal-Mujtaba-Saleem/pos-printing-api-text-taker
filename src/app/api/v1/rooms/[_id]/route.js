import "@/lib/mongoose/connectDB";
import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { RoomServices } from "@/services/room.service";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";

/** 📖 GET → Get single room by ID */
export async function GET(_, { params }) {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const roomServices = new RoomServices(user._id);
    const result = await roomServices.getSingleRoomFromDB(params._id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

/** ✏️ PATCH → Update room by ID */
export async function PATCH(req, { params }) {
  try {
    const data = await req.json();

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const roomServices = new RoomServices(user._id);
    const result = await roomServices.updateRoomFromDB(params._id, data);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

/** ❌ DELETE → Delete room by ID */
export async function DELETE(_, { params }) {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const roomServices = new RoomServices(user._id);
    const result = await roomServices.deleteRoomFromDB(params._id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}
