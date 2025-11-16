import { UserServices } from "@/services/user.services";
import "@/lib/mongoose/connectDB";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const result = await UserServices.getSingleUserFromDB(email);

    return NextResponse.json(
      {
        success: true,
        message: "User fetch Successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong.",
        data: null,
      },
      { status: 500 }
    );
  }
}
