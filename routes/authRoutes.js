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

// Optional: Informational route for browser access
router.get("/login", (req, res) => {
  res.json({
    message: "Login endpoint. Use POST request with email and password."
  });
});

// Login user
router.post("/login", loginUser);

// Forgot password (informational)
router.get("/forgot-password", (req, res) => {
  res.json({
    message: "Forgot password endpoint. Use POST with email."
  });
});

// Forgot password (send email)
router.post("/forgot-password", forgotPassword);

// Reset password (ACTUAL reset)
router.post("/reset-password", resetPassword);


export default router;
