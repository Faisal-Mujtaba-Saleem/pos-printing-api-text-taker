import "@/lib/mongoose/connectDB";
import { User } from "@/models/user.model";
import { BookingServices } from "@/services/booking.services";
import { ServerError } from "@/utlis/ServerError";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const bookingServices = new BookingServices(user._id);
    const result = await bookingServices.getSingleBookingFromDB(params._id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    params = await params;

    const updates = await req.json();

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const bookingServices = new BookingServices(user._id);
    const result = await bookingServices.updateBookingInDB(params._id, updates);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    if (!user) throw ServerError("Authenticated user not found in database", 404);

    const bookingServices = new BookingServices(user._id);
    const deletedBooking = await bookingServices.deleteBookingFromDB(params._id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }
}