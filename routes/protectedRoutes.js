import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Any logged-in user
 */
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "User profile accessed",
    user: req.user,
  });
});

/**
 * Admin only
 */
router.get(
  "/admin-dashboard",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin dashboard accessed",
    });
  }
);

/**
 * Doctor only
 */
router.get(
  "/doctor-dashboard",
  protect,
  authorizeRoles("doctor"),
  (req, res) => {
    res.json({
      success: true,
      message: "Doctor dashboard accessed",
    });
  }
);

/**
 * Admin OR Doctor
 */
router.get(
  "/reports",
  protect,
  authorizeRoles("admin", "doctor"),
  (req, res) => {
    res.json({
      success: true,
      message: "Reports accessed",
    });
  }
);

export default router;
