import "@/lib/mongoose/connectDB";
import { User } from "@/models/user.model";
import { GuestServices } from "@/services/guest.services";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Create Guest
export async function POST(req) {
  try {
    const data = await req.json();

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const guestServices = new GuestServices(user._id);
    const result = await guestServices.storeGuestToDB(data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}

// ✅ Get All Guests
export async function GET() {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const guestServices = new GuestServices(user._id);
    const result = await guestServices.getAllGuestsFromDB();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}