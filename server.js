import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import { Server } from "socket.io";
import protectedRoutes from "./routes/protectedRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import sendEmail from "./utils/sendEmail.js";
import doctorAvailabilityRoutes from "./routes/doctorAvailabilityRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";



/* ================= ENV CONFIG ================= */
dotenv.config();

/* ================= APP SETUP ================= */
const app = express();
const server = http.createServer(app);

/* ================= CORS ================= */

const allowedOrigins = [
  "https://healthsync-frontend-rosy.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      // Allow Vercel domains dynamically
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


/*===== BODY PARSER =====*/
app.use(express.json());
app.use("/api/doctor", doctorAvailabilityRoutes);
app.use("/api/appointments", appointmentRoutes);


/* ================= BASIC ROUTE ================= */
app.get("/", (req, res) => {
  res.send("HealthSync Backend Running");
});

/* ================= AUTH ROUTES ================= */
app.use("/api/auth", authRoutes);

/* ================= TEST ROUTES ================= */
/* ================= REAL EMAIL TEST ROUTE ================= */
/* HIT: http://localhost:5000/api/test-email */
/*app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "subhamku7735@gmail.com", // ✅ PUT YOUR REAL GMAIL HERE
      subject: "HealthSync – Real Email Test",
      html: "<h2>If you received this, Brevo SMTP is working 🎉</h2>",
    });

    res.json({
      success: true,
      message: "Email request sent. Check inbox or spam.",
    });
  } catch (error) {
    console.error("Email test error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
*/

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.set("io", io); // ✅ FIX: make io available to controllers

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinQueueRoom", ({ doctorId, date }) => {
    const room = `queue:${doctorId}:${date}`;
    socket.join(room);
    console.log("Joined room:", room);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ================= DATABASE ================= */
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

/* ================= USER ROUTES ================= */
app.use("/api/users", userRoutes);

/* ================= PROTECTED ROUTES ================= */
app.use("/api/protected", protectedRoutes);

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ================= PAYMENT ROUTES ================= */
app.use("/api/payments", paymentRoutes);