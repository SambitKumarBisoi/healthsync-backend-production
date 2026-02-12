import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

/**
 * REGISTER USER
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: role ? role.toLowerCase() : "patient",
  phone, // ✅ IMPORTANT
  emailVerificationToken,
  emailVerificationTokenExpires,
  emailVerified: false,
});


    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${emailVerificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your HealthSync account",
      html: `
        <h3>Welcome to HealthSync</h3>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    res.status(201).json({
      message: "Registration successful. Verification email sent.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

/**
 * VERIFY EMAIL
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Invalid verification link");
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .send("Verification link is invalid or has expired.");
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    return res.status(200).send(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Email Verified</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 40px;
          background-color: #f5f7fa;
        }
        .box {
          max-width: 400px;
          margin: auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
          color: #2e7d32;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>Email Verified Successfully ✅</h2>
        <p>Your HealthSync account has been verified.</p>
        <p>You can now log in from the app.</p>
      </div>
    </body>
  </html>
`);

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).send("Server error during email verification");
  }
};


/**
 * LOGIN USER (STEP 3.5)
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};

  /**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Basic email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({ message: "Invalid email format" });
}

    const user = await User.findOne({ email });

    // Security: do not reveal user existence
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

      // ✅ FRONTEND reset page, NOT backend API
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;


    await sendEmail({
      to: user.email,
      subject: "HealthSync – Reset Password",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    console.log("Token received:", token);

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    console.log("User found:", user ? user.email : null);

    if (!user) {
      return res.status(400).json({
        message: "Reset link invalid or expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // invalidate token
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


