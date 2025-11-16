import mongoose from "mongoose";
import "@/models/room.model";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: ["Pending", "Checked-In", "Checked-Out", "Cancelled"],
      default: "Pending",
    },

    guests: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Guest",
        },
      ],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1 && new Set(v.map(String)).size === v.length,
        message: "At least one guest is required, and guest IDs must be unique",
      },
    },
  },
  { timestamps: true }
);

//
// 🔹 Utility: Only handle payment logic
//
function applyPaymentLogic(doc) {
  if (!doc) return;

  if (doc.paidAmount >= doc.totalAmount) {
    doc.paymentStatus = "Paid";
  } else if (doc.paidAmount > 0 && doc.paidAmount < doc.totalAmount) {
    doc.paymentStatus = "Pending";
  } else if (doc.paidAmount === 0) {
    doc.paymentStatus = "Pending";
  }
}

//
// 🧩 pre('save') - when creating or editing booking
//
bookingSchema.pre("save", function (next) {
  applyPaymentLogic(this);
  next();
});

//
// 🧩 pre('findOneAndUpdate') & pre('updateOne') - for query updates
//
bookingSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  // Get the object of the document being updated
  const update = this.getUpdate();
  if (!update) return next();

  // Auto-cancel sync
  if (update.paymentStatus === "Cancelled" || update.status === "Cancelled") {
    this.setUpdate({ ...update, paymentStatus: "Cancelled", status: "Cancelled" });
    return next();
  }

  // Handle payment logic if paidAmount or totalAmount updated
  if (update.paidAmount !== undefined || update.totalAmount !== undefined) {
    applyPaymentLogic(update);
  }

  this.setUpdate(update);
  next();
});

// 🧩 post('findOneAndDelete') - cascade delete related guests
bookingSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  // delete the related guests
  const Guest = mongoose.model("Guest");
  const otherBookings = await Booking.countDocuments({
    guests: { $in: doc.guests },
    _id: { $ne: doc._id }
  });
  
  if (otherBookings === 0) {
    await Guest.deleteMany({ _id: { $in: doc.guests } });
  }
});

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
