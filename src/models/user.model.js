import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        clerkUserId: { type: String, required: true, unique: true },
        fullName: String,
        email: String,
        role: { type: String, default: "user" },
    },
    { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
