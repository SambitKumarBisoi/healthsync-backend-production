import express from "express";
import {
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  suspendDoctor,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { getAdminDashboard } from "../controllers/adminController.js";

const router = express.Router();

/*admin routes */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboard
);



/**
 * GET ALL DOCTORS
 * Only admin
 */
router.get(
  "/doctors",
  protect,
  authorizeRoles("admin"),
  getAllDoctors
);

/**
 * APPROVE DOCTOR
 */
router.patch(
  "/doctors/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveDoctor
);

/**
 * REJECT DOCTOR
 */
router.patch(
  "/doctors/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectDoctor
);

/**
 * SUSPEND DOCTOR
 */
router.patch(
  "/doctors/:id/suspend",
  protect,
  authorizeRoles("admin"),
  suspendDoctor
);

export default router;