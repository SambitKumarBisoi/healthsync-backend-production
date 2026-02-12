import express from "express";
import { createPaymentOrder } from "../controllers/paymentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Create Razorpay Order
 * Patient only
 */
router.post("/create-order", protect, authorizeRoles("patient"), createPaymentOrder);

/**
 * Verify Razorpay Payment
 * Patient only
 */
import { verifyPayment } from "../controllers/paymentController.js";

router.post(
  "/verify",
  protect,
  authorizeRoles("patient"),
  verifyPayment
);

export default router;
