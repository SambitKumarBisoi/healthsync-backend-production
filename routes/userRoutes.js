import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { updateMyProfile, getDoctors } from "../controllers/userController.js";

const router = express.Router();

/**
 * GET ALL DOCTORS
 * Route: GET /api/users/doctors
 * Role: Patient only
 */
router.get(
  "/doctors",
  protect,
  authorizeRoles("patient"),
  getDoctors
);

/**
 * Update own profile
 * Route: PUT /api/users/me
 * Role: Patient only
 */
router.put(
  "/me",
  protect,
  authorizeRoles("patient"),
  updateMyProfile
);

export default router;