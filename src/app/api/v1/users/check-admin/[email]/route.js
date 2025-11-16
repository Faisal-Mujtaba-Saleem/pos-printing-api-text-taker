import { UserServices } from "@/services/user.services";
import "@/lib/mongoose/connectDB";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const isAdmin = await UserServices.checkAdminFromDB(email);
    return NextResponse.json(
      {
        success: true,
        message: "Admin status fetched successfully",
        data: { admin: isAdmin },
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
