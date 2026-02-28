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
import { allowOnlyActiveDoctor } from "../middlewares/doctorStatusMiddleware.js";

const router = express.Router();

/**
 * Doctor creates availability
 */
router.post(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  allowOnlyActiveDoctor,
  createAvailability
);

/**
 * Doctor views own availability
 */
router.get(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  allowOnlyActiveDoctor,
  getMyAvailability
);

/**
 * Doctor updates availability
 */
router.put(
  "/availability/:id",
  protect,
  authorizeRoles("doctor"),
  allowOnlyActiveDoctor,
  updateAvailability
);

/**
 * Doctor disables availability
 */

router.patch(
  "/availability/:id/disable",
  protect,
  authorizeRoles("doctor"),
  allowOnlyActiveDoctor,
  disableAvailability
);

/**
 * Doctor disables specific slot
 */

router.patch(
  "/availability/:id/disable-slot",
  protect,
  authorizeRoles("doctor"),
  allowOnlyActiveDoctor,
  disableSlot
);

/**
 * Patient views doctor availability
 */
router.post(
  "/availability",
  protect,
  authorizeRoles("doctor"),
  allowOnlyActiveDoctor,
  createAvailability
);

export default router;
