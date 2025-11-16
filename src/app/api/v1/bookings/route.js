import "@/lib/mongoose/connectDB";
import { User } from "@/models/user.model";
import { BookingServices } from "@/services/booking.services";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user)
      throw ServerError("Authenticated user not found in database", 404);

    const bookingServices = new BookingServices(user._id);
    const booking = await bookingServices.postBookingToDB(data);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      status: searchParams.get("status") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
    };

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user)
      throw ServerError("Authenticated user not found in database", 404);

    const bookingServices = new BookingServices(user._id);
    const bookings = await bookingServices.getAllBookingsFromDB(filters);

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}