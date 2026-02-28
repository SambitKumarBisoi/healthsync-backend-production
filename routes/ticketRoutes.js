import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  addAdminResponse,
} from "../controllers/ticketController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * USER ROUTES (Doctor / Patient)
 */

// Create ticket
router.post(
  "/",
  protect,
  authorizeRoles("doctor", "patient"),
  createTicket
);

// Get my tickets
router.get(
  "/my",
  protect,
  authorizeRoles("doctor", "patient"),
  getMyTickets
);

/**
 * ADMIN ROUTES
 */

// Get all tickets
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAllTickets
);

// Update ticket status
router.patch(
  "/admin/:id/status",
  protect,
  authorizeRoles("admin"),
  updateTicketStatus
);

// Add admin response
router.patch(
  "/admin/:id/response",
  protect,
  authorizeRoles("admin"),
  addAdminResponse
);

export default router;