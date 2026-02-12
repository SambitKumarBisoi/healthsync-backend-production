import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;
