/* 
Import necessary modules
*/
import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import Transaction from "../models/Transaction.js";
import Appointment from "../models/Appointment.js";
import Coupon from "../models/Coupon.js";

/**
 * CREATE RAZORPAY ORDER (TEST MODE)
 * Service: OPD Consultation (GST Exempt)
 * Access: Patient
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId, couponCode, paymentMode, cardType } = req.body;

    if (!appointmentId || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and payment mode are required",
      });
    }

    if (paymentMode === "CARD" && !cardType) {
      return res.status(400).json({
        success: false,
        message: "Card type is required for card payments",
      });
    }

    /* 1️⃣ Validate appointment */
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    /* 2️⃣ Base billing (India OPD – GST Exempt) */
    const baseAmount = 300; // ₹300
    const gstPercentage = 0;
    const gstAmount = 0;

    let discountAmount = 0;
    let appliedCoupon = null;

    /* 3️⃣ Coupon validation (optional) */
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        expiresAt: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired coupon",
        });
      }

      if (
        coupon.allowedPaymentModes &&
        !coupon.allowedPaymentModes.includes(paymentMode)
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon not valid for selected payment mode",
        });
      }

      if (coupon.discountType === "FLAT") {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === "PERCENT") {
        discountAmount = Math.floor(
          (baseAmount * coupon.discountValue) / 100
        );
      }

      appliedCoupon = coupon;
    }

    /* 4️⃣ Final amount calculation */
    const totalAmount = Math.max(
      baseAmount + gstAmount - discountAmount,
      0
    );

    /* 5️⃣ Create transaction */
    const transaction = await Transaction.create({
      appointment: appointment._id,
      patient: req.user._id,
      doctor: appointment.doctor,
      baseAmount,
      gstPercentage,
      gstAmount,
      discountAmount,
      totalAmount,
      coupon: appliedCoupon?._id,
      couponCode: appliedCoupon?.code,
      paymentMode,
      cardType: paymentMode === "CARD" ? cardType : undefined,
      status: "CREATED",
      invoiceDate: new Date(),
    });

    /* 6️⃣ Create Razorpay order */
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `HS-INV-${transaction._id}`,
      notes: {
        appointmentId: appointment._id.toString(),
        transactionId: transaction._id.toString(),
        serviceType: "OPD_CONSULTATION",
        gst: "EXEMPT",
        coupon: appliedCoupon?.code || "NONE",
        paymentMode,
        cardType: cardType || "N/A",
      },
    });

    transaction.gatewayOrderId = razorpayOrder.id;
    await transaction.save();

    /* 7️⃣ Response */
    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      order: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      billing: {
        baseAmount,
        discountAmount,
        gstAmount,
        totalAmount,
      },
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

/* PAYMENT VERIFICATION */

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    // 1️⃣ Find transaction
    const transaction = await Transaction.findOne({
      gatewayOrderId: razorpayOrderId,
      status: "CREATED",
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or already processed",
      });
    }

    // 2️⃣ Generate expected signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // 3️⃣ Compare signatures
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 4️⃣ Update transaction
    transaction.status = "PAID";
    transaction.gatewayPaymentId = razorpayPaymentId;
    transaction.paidAt = new Date();
    await transaction.save();

    // 5️⃣ Update appointment
    const appointment = await Appointment.findById(
      transaction.appointment
    );

    if (appointment) {
      appointment.paymentStatus = "PAID";
      appointment.appointmentStatus = "CONFIRMED";
      await appointment.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
};
