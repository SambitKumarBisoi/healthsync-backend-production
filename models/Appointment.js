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
      type: String, // "10:00 - 10:30"
      required: true,
    },

    /* ===== QUEUE FIELDS (STEP 6) ===== */
    queueNumber: {
      type: Number,
      default: null, // assigned later
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
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
