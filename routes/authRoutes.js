import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// Create a new user
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Verify email
router.get("/verify-email", verifyEmail);

// Login user
router.post("/login", loginUser);

// Forgot password (send email)
router.post("/forgot-password", forgotPassword);

// Reset password (ACTUAL reset)
router.post("/reset-password", resetPassword);


export default router;
