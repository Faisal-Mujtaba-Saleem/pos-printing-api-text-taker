import { GuestServices } from "@/services/guest.services";
import "@/lib/mongoose/connectDB";
import { User } from "@/models/user.model";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Get Single Guest by ID
export async function GET(req, { params }) {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const guestServices = new GuestServices(user._id);
    const result = await guestServices.getSingleGuestFromDB(params._id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}

// ✅ Update Guest
export async function PATCH(req, { params }) {
  try {
    const updates = await req.json();

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const guestServices = new GuestServices(user._id);
    const result = await guestServices.updateGuestInDB(params._id, updates);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}

// ✅ Delete Guest
export async function DELETE(req, { params }) {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const guestServices = new GuestServices(user._id);
    const result = await guestServices.deleteGuestFromDB(params._id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}
