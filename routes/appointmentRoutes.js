import express from "express";
import {
  getAvailableSlots,
  bookAppointment,
  rescheduleAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getMyQueuePosition,
  completeAppointment,
} from "../controllers/appointmentController.js";


import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/slots", protect, authorizeRoles("patient"), getAvailableSlots);
router.post("/", protect, authorizeRoles("patient"), bookAppointment);
router.put(
  "/:id/reschedule",
  protect,
  authorizeRoles("patient"),
  rescheduleAppointment
);
/**
 * Patient views own queue position
 */
router.get(
  "/my/queue-position",
  protect,
  authorizeRoles("patient"),
  getMyQueuePosition
);
/**
 * Doctor views own appointments (filters supported)
 */
router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

/**
 * Doctor completes appointment & moves queue
 */
router.put(
  "/:id/complete",
  protect,
  authorizeRoles("doctor"),
  completeAppointment
);

export default router;
