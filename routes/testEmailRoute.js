import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  await sendEmail({
    to: "test@example.com",
    subject: "HealthSync Email Test",
    html: "<h3>Email system is working</h3>",
  });

  res.json({ message: "Test email sent. Check console for preview link." });
});

export default router;
