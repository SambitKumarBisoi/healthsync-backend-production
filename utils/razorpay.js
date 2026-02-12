import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config(); // ✅ ENSURE env is loaded

console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID ? "LOADED" : "MISSING");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
