import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error; // ⬅️ VERY IMPORTANT
  }
};

export default connectDB;
