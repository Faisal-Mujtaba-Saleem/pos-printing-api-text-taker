"use server";

import "@/lib/mongoose/connectDB";
import Papa from "papaparse";
import { User } from "@/models/user.model";
import { Room } from "@/models/room.model";
import { currentUser } from "@clerk/nextjs/server";

async function fileToText(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("utf-8");
}

export async function uploadRoomsAction(formData) {
  try {
    const file = formData.get("file");
    if (!file) throw new Error("No file uploaded");

    const csvText = await fileToText(file);

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => (v === "" ? undefined : v.trim()),
    });

    if (parsed.errors?.length) {
      console.error(parsed.errors);
      throw new Error("Invalid CSV format");
    }

    // Map CSV rows to room objects
    let rooms = parsed.data
      .map((r) => {
        const roomType = ["Suite", "Deluxe", "Standard", "Family"].includes(r.roomType)
          ? r.roomType
          : "Standard";

        const status = ["available", "maintenance"].includes(r.status)
          ? r.status
          : "available";

        return {
          user: r.user,
          name: r.name,
          roomType,
          price: r.price ? Number(r.price) : undefined,
          capacity: r.capacity ? Number(r.capacity) : 1,
          features: r.features
            ? String(r.features)
              .split(",")
              .map(f => f.trim())
              .filter(Boolean)
            : [],
          img: r.img,
          status,
        };
      })
      .filter(r => r.name && r.price && r.img); // required fields only

    if (!rooms.length) throw new Error("No valid room data found in CSV");

    const clerkUserId = (await currentUser()).id;
    const user = await User.findOne({ clerkUserId });

    // Save rooms one by one using .save()
    const createdRooms = [];
    const saveErrors = [];
    for (const r of rooms) {
      try {
        const roomDoc = new Room({ ...r, user: user._id });
        const saved = await roomDoc.save();
        createdRooms.push(
          JSON.parse(JSON.stringify(saved))
        );
      } catch (e) {
        console.error("Failed to save room:", r, e);
        saveErrors.push({ room: r, error: e.message || String(e) });
      }
    }

    if (!createdRooms.length) throw new Error("Failed to save any rooms");

    return { success: true, rooms: createdRooms, saveErrors: saveErrors.length ? saveErrors : undefined };
  } catch (err) {
    console.error("Upload Error:", err);
    return { success: false, error: err.message || "Failed to upload" };
  }
}
