import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { updateMyProfile } from "../controllers/userController.js";

const router = express.Router();

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
