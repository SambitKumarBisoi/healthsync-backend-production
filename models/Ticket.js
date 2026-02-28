import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "EMAIL_UPDATE",
        "REFUND",
        "APPOINTMENT_ISSUE",
        "PAYMENT_ISSUE",
        "TECHNICAL_ISSUE"
      ],
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },

    adminResponse: {
      type: String,
    },

    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);