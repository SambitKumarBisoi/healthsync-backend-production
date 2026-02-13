import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "YOUR_PERSONAL_EMAIL@gmail.com",
      subject: "HealthSync Test Email",
      html: "<h2>Email working from Render</h2>",
    });

    res.send("Email sent successfully");
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).send("Email failed");
  }
});

export default router;
