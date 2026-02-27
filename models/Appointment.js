import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    slotTime: {
      type: String, // Example: "10:00 - 10:30"
      required: true,
    },

    /* ===== QUEUE SYSTEM ===== */

    queueNumber: {
      type: Number,
      default: null,
    },

    queueStatus: {
      type: String,
      enum: ["WAITING", "IN_PROGRESS", "COMPLETED"],
      default: "WAITING",
    },

    queueDate: {
      type: Date,
      required: true,
    },

    /* ===== APPOINTMENT STATUS ===== */

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "CONFIRMED",
    },

    /* ===== OPTIONAL NOTES (Future Safe) ===== */

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/* 🔒 Prevent double booking for same doctor + date + slot */
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, slotTime: 1 },
  { unique: true }
);

export default mongoose.model("Appointment", appointmentSchema);