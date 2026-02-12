/*
Field	                               Meaning
1.code	                          Coupon string user enters
2.discountType	                  FLAT or PERCENT
3.discountValue	                  ₹ or %
4.maxDiscount	                  Cap for percent coupons
5.intendedPaymentMode	          UPI / CARD / null
6.allowedCardTypes	              RuPay / Visa / MasterCard
7.expiryDate	                  Coupon validity
8.isActive	                      Enable/disable
9.timestamps	                  Audit
 */

/*
 * Coupon Model
 * Represents a discount coupon for payments
 */

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["FLAT", "PERCENT"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    maxDiscount: {
      type: Number, // only for percentage coupons
    },

    intendedPaymentMode: {
      type: String,
      enum: ["UPI", "CARD"],
    },

    allowedCardTypes: [
      {
        type: String,
        enum: ["RUPAY", "VISA", "MASTERCARD"],
      },
    ],

    expiryDate: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
