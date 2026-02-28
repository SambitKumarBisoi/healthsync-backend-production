import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      min: 0,
      max: 120,
    },

     phone: {
    type: String,
    required: true, // ✅ NOW MANDATORY
  },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
  type: String,
  enum: ["patient", "doctor", "admin"],
  default: "patient",
},

// Doctor lifecycle status (applies only if role = doctor)
accountStatus: {
  type: String,
  enum: [
    "PENDING_VERIFICATION",
    "ACTIVE",
    "REJECTED",
    "SUSPENDED"
  ],
  default: function () {
    return this.role === "doctor"
      ? "PENDING_VERIFICATION"
      : "ACTIVE";
  },
},

    // security
    captchaFails: {
      type: Number,
      default: 0,
    },
    // email verification
    emailVerificationToken: {
      type: String,
    },
    // token expiry time (e.g. 15 minutes)
    emailVerificationTokenExpires: {
      type: Date,
    },
    // email verification
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // password reset
    passwordResetToken: {
      type: String,
    },
    // token expiry time (e.g. 15 minutes)
    passwordResetTokenExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
