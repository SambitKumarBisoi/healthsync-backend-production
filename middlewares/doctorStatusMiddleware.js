/**
 * DOCTOR ACCOUNT STATUS CHECK
 * Allows only ACTIVE doctors to access certain routes
 */

export const allowOnlyActiveDoctor = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to doctors only",
      });
    }

    if (req.user.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          "Doctor account not active. Please wait for admin approval.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};