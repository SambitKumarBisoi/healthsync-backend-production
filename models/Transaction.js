/*
  Transaction Model
  Represents a financial transaction between a patient and a doctor
*/


import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // 🔗 Core References
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
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

    // 💰 Amount Breakdown
    baseAmount: {
      type: Number,
      required: true, // e.g. 300
    },
    gstPercentage: {
      type: Number,
      default: 0, // OPD = 0% GST (India 2026)
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0, // coupon discount
    },
    totalAmount: {
      type: Number,
      required: true, // final payable in INR
    },

    // 🎟️ Coupon Info
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponCode: {
      type: String,
    },

    // 💳 Payment Mode Info
    paymentMode: {
      type: String,
      enum: ["UPI", "CARD"],
    },
    cardType: {
      type: String,
      enum: ["RUPAY", "VISA", "MASTERCARD"],
    },

    // 💳 Payment Gateway Info
    paymentGateway: {
      type: String,
      default: "RAZORPAY",
    },
    gatewayOrderId: {
      type: String,
    },
    gatewayPaymentId: {
      type: String,
    },
    gatewaySignature: {
      type: String,
    },

    // 📄 Invoice Metadata
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true, // ✅ IMPORTANT FIX
    },
    invoiceDate: {
      type: Date,
    },

    // 🔄 Transaction Status
    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED", "REFUNDED"],
      default: "PAID",
    },

    // ↩️ Refund Info
    refundAmount: {
      type: Number,
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
