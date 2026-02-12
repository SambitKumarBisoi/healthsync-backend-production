import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId: userId, role: role },   // ✅ FIX HERE
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export default generateToken;
