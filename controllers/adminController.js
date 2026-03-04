import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Transaction from "../models/Transaction.js";

/**
 * ADMIN DASHBOARD SUMMARY
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const { start, end } = req.query;

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

    /* ================= APPOINTMENT FILTER ================= */

    let appointmentFilter = {};

    if (start && end) {
      appointmentFilter.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const totalAppointments = await Appointment.countDocuments(
      appointmentFilter
    );

    const completedAppointments = await Appointment.countDocuments({
      ...appointmentFilter,
      status: "COMPLETED",
    });

    const pendingAppointments = await Appointment.countDocuments({
      ...appointmentFilter,
      status: "PENDING",
    });

    const cancelledAppointments = await Appointment.countDocuments({
      ...appointmentFilter,
      status: "CANCELLED",
    });

    /* ================= TODAY APPOINTMENTS ================= */

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

    /* ================= REVENUE ANALYTICS ================= */

    let revenueFilter = { status: "PAID" };

    if (start && end) {
      revenueFilter.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const transactions = await Transaction.find(revenueFilter);

    const totalRevenue = transactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0
    );

    const todayRevenueData = await Transaction.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const todayRevenue = todayRevenueData[0]?.total || 0;

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
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
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