/*
 * UPDATE LOGGED-IN USER PROFILE
 * Access: Patient only
 * Depends on authMiddleware (JWT)
 */


import User from "../models/User.js";

/**
 * UPDATE LOGGED-IN USER PROFILE
 * Access: Patient only
 * Depends on authMiddleware (JWT)
 */
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, age } = req.body;

    // req.user is injected by authMiddleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Allowed updates only
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (age !== undefined) user.age = age;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};
