import express from "express";
import {
  createAvailability,
  getMyAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  disableAvailability,
} from "../controllers/doctorAvailabilityController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Doctor creates availability
 */
router.post(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  createAvailability
);

/**
 * Doctor views own availability
 */
router.get(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  getMyAvailability
);

/**
 * Doctor updates availability
 */
router.put(
  "/availability/:id",
  protect,
  authorizeRoles("doctor"),
  updateAvailability
);

/**
 * Doctor disables availability
 */
router.patch(
  "/availability/:id/disable",
  protect,
  authorizeRoles("doctor"),
  disableAvailability
);

/**
 * Patient views doctor availability
 */
router.get(
  "/doctors/:doctorId/availability",
  protect,
  authorizeRoles("patient"),
  getAvailabilityByDoctor
);

export default router;
