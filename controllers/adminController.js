import User from "../models/User.js";

/**
 * GET ALL DOCTORS
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * APPROVE DOCTOR
 */
export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(
      id,
      { accountStatus: "ACTIVE" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
    });
  } catch (error) {
    console.error("Approve doctor error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * REJECT DOCTOR
 */
export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(
      id,
      { accountStatus: "REJECTED" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Doctor rejected",
    });
  } catch (error) {
    console.error("Reject doctor error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * SUSPEND DOCTOR
 */
export const suspendDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(
      id,
      { accountStatus: "SUSPENDED" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Doctor suspended",
    });
  } catch (error) {
    console.error("Suspend doctor error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};