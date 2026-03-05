import express from "express";
import {
  getAdminDashboard,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  suspendDoctor,
} from "../controllers/adminController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboard
);

/* ================= DOCTOR MANAGEMENT ================= */
router.get(
  "/doctors",
  protect,
  authorizeRoles("admin"),
  getAllDoctors
);

router.patch(
  "/doctors/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveDoctor
);

router.patch(
  "/doctors/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectDoctor
);

router.patch(
  "/doctors/:id/suspend",
  protect,
  authorizeRoles("admin"),
  suspendDoctor
);

/* ================= SOCKET TEST ROUTE ================= */
/* This route triggers realtime dashboard update */

router.get(
  "/socket-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    const io = req.app.get("io");

    io.emit("adminDashboardUpdate");

    res.json({
      success: true,
      message: "Socket test event triggered",
    });
  }
);

export default router;