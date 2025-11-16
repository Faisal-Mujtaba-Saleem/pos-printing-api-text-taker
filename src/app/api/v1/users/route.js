import '@/lib/mongoose/connectDB';
import { currentUser } from "@clerk/nextjs/server";
import { User } from '@/models/user.model';
import { ServerError } from '@/utlis/ServerError';
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new ServerError("Unauthorized", 401);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkUserId: user.id });
    console.log(existingUser);

    if (!existingUser) {
      const newUser = await User.create({
        clerkUserId: user.id,
        fullName: user.fullName,
        email: user.emailAddresses[0]?.emailAddress || "",
        role: params?.role || "admin",
      });
      return NextResponse.json({ user: newUser });
    }

    return NextResponse.json({ user: existingUser });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}
