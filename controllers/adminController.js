import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

/**
 * ADMIN DASHBOARD SUMMARY
 */
export const getAdminDashboard = async (req, res) => {
  try {
    /* ================= DOCTOR STATS ================= */

    const totalDoctors = await User.countDocuments({ role: "doctor" });

    const activeDoctors = await User.countDocuments({
      role: "doctor",
      accountStatus: "ACTIVE",
    });

    const pendingDoctors = await User.countDocuments({
      role: "doctor",
      accountStatus: "PENDING_VERIFICATION",
    });

    const suspendedDoctors = await User.countDocuments({
      role: "doctor",
      accountStatus: "SUSPENDED",
    });

    /* ================= PATIENT STATS ================= */

    const totalPatients = await User.countDocuments({
      role: "patient",
    });

    /* ================= APPOINTMENT STATS ================= */

    const totalAppointments = await Appointment.countDocuments();

    // Today range (00:00 to 23:59)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const completedAppointments = await Appointment.countDocuments({
      status: "COMPLETED",
    });

    const pendingAppointments = await Appointment.countDocuments({
      status: "PENDING",
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: "CANCELLED",
    });

    /* ================= RESPONSE ================= */

    res.status(200).json({
      success: true,
      data: {
        doctors: {
          total: totalDoctors,
          active: activeDoctors,
          pending: pendingDoctors,
          suspended: suspendedDoctors,
        },
        patients: {
          total: totalPatients,
        },
        appointments: {
          total: totalAppointments,
          today: todayAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    doctor.accountStatus = "ACTIVE";
    await doctor.save();

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

    doctor.accountStatus = "REJECTED";
    await doctor.save();

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

    doctor.accountStatus = "SUSPENDED";
    await doctor.save();

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