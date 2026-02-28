import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import userRoutes from "./routes/userRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorAvailabilityRoutes from "./routes/doctorAvailabilityRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import ticketRoutes from "./routes/ticketRoutes.js";

/* ================= ENV CONFIG ================= */
dotenv.config();
console.log("BASE_URL:", process.env.BASE_URL);

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
      if (!origin) return callback(null, true);

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

/* ================= SAFE BODY PARSER ================= */

/*
Fix for:
Unexpected end of JSON input
when empty body sent with Content-Type: application/json
*/
app.use(
  express.json({
    strict: false,
  })
);

/* Catch JSON parsing errors safely */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON received");
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }
  next();
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("HealthSync Backend Running");
});

/* Auth Routes */
app.use("/api/auth", authRoutes);

/* Doctor Routes */
app.use("/api/doctor", doctorAvailabilityRoutes);

/* Appointment Routes */
app.use("/api/appointments", appointmentRoutes);

/* Payment Routes */
app.use("/api/payments", paymentRoutes);

/* User Routes */
app.use("/api/users", userRoutes);

/* Protected Routes */
app.use("/api/protected", protectedRoutes);

/** Admin Routes */
app.use("/api/admin", adminRoutes);

/* Ticket Routes */
app.use("/api/tickets", ticketRoutes);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

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

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("FULL ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});