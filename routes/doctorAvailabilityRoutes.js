import express from "express";
import {
  createAvailability,
  getMyAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  disableSlot,
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
 * Doctor disables specific slot
 */

router.patch(
  "/availability/:id/disable-slot",
  protect,
  authorizeRoles("doctor"),
  disableSlot
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
