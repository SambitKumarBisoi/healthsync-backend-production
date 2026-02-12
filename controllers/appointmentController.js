import DoctorAvailability from "../models/DoctorAvailability.js";
import Appointment from "../models/Appointment.js";
import generateSlots from "../utils/generateSlots.js";

const BUFFER_MINUTES = 10;

/* ===== TIME HELPERS ===== */
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const parseSlot = (slot) => {
  const [start, end] = slot.split(" - ");
  return { start: toMinutes(start), end: toMinutes(end) };
};

const isOverlap = (a, b, buffer) =>
  a.start < b.end + buffer && a.end + buffer > b.start;

/* =====================================================
   GET AVAILABLE SLOTS (PATIENT)
===================================================== */
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false });
    }

    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    let slots = [];
    availability.forEach((a) => {
      slots.push(...generateSlots(a.startTime, a.endTime, a.slotDuration));
    });

    res.json({ success: true, date, dayOfWeek, slots });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   BOOK APPOINTMENT (PATIENT) + QUEUE ASSIGN
===================================================== */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, slotTime } = req.body;
    if (!doctorId || !appointmentDate || !slotTime) {
      return res.status(400).json({ success: false });
    }

    const dayOfWeek = new Date(appointmentDate).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    let validSlots = [];
    availability.forEach((a) => {
      validSlots.push(...generateSlots(a.startTime, a.endTime, a.slotDuration));
    });

    if (!validSlots.includes(slotTime)) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    const doctorConflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      slotTime,
      status: { $ne: "CANCELLED" },
    });

    if (doctorConflict) {
      return res.status(409).json({
        success: false,
        message: "Doctor slot already booked",
      });
    }

    const patientAppointments = await Appointment.find({
      patient: req.user._id,
      appointmentDate,
      status: { $ne: "CANCELLED" },
    });

    const newSlot = parseSlot(slotTime);
    for (let appt of patientAppointments) {
      if (isOverlap(newSlot, parseSlot(appt.slotTime), BUFFER_MINUTES)) {
        return res.status(409).json({
          success: false,
          message: "Appointment overlaps with existing one",
        });
      }
    }

    const lastInQueue = await Appointment.findOne({
      doctor: doctorId,
      queueDate: new Date(appointmentDate),
    })
      .sort({ queueNumber: -1 })
      .select("queueNumber");

    const nextQueueNumber = lastInQueue ? lastInQueue.queueNumber + 1 : 1;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      slotTime,
      status: "PENDING",
      queueNumber: nextQueueNumber,
      queueStatus: "WAITING",
      queueDate: new Date(appointmentDate),
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   RESCHEDULE APPOINTMENT (PATIENT)
===================================================== */
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, slotTime } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      patient: req.user._id,
      status: { $ne: "CANCELLED" },
    });

    if (!appointment) {
      return res.status(404).json({ success: false });
    }

    const dayOfWeek = new Date(appointmentDate).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availability = await DoctorAvailability.find({
      doctor: appointment.doctor,
      dayOfWeek,
      isActive: true,
    });

    let validSlots = [];
    availability.forEach((a) => {
      validSlots.push(...generateSlots(a.startTime, a.endTime, a.slotDuration));
    });

    if (!validSlots.includes(slotTime)) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.slotTime = slotTime;
    appointment.queueDate = new Date(appointmentDate);
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   VIEW APPOINTMENTS
===================================================== */
export const getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    patient: req.user._id,
  }).sort({ appointmentDate: 1, queueNumber: 1 });

  res.json({ success: true, appointments });
};

export const getDoctorAppointments = async (req, res) => {
  const appointments = await Appointment.find({
    doctor: req.user._id,
  })
    .populate("patient", "name email")
    .sort({ appointmentDate: 1, queueNumber: 1 });

  res.json({ success: true, appointments });
};

/* =====================================================
   PATIENT QUEUE POSITION (READ ONLY)
===================================================== */
export const getMyQueuePosition = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      patient: req.user._id,
      status: { $ne: "CANCELLED" },
      queueNumber: { $ne: null },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "No active appointment found",
      });
    }

    const aheadCount = await Appointment.countDocuments({
      doctor: appointment.doctor,
      queueDate: appointment.queueDate,
      queueNumber: { $lt: appointment.queueNumber },
      status: { $ne: "CANCELLED" },
    });

    const totalInQueue = await Appointment.countDocuments({
      doctor: appointment.doctor,
      queueDate: appointment.queueDate,
      status: { $ne: "CANCELLED" },
    });

    res.json({
      success: true,
      queueNumber: appointment.queueNumber,
      position: aheadCount + 1,
      aheadOfYou: aheadCount,
      totalInQueue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch queue position",
    });
  }
};

/* =====================================================
   DOCTOR COMPLETES APPOINTMENT & MOVE QUEUE
===================================================== */
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const currentAppointment = await Appointment.findOne({
      _id: id,
      doctor: req.user._id,
      $or: [
        { queueStatus: { $ne: "COMPLETED" } },
        { queueStatus: { $exists: false } },
        { queueStatus: null },
      ],
    });

    if (!currentAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or already completed",
      });
    }

    // 🔹 SAFETY: Ensure queue is initialized
    const activeExists = await Appointment.findOne({
      doctor: req.user._id,
      queueDate: currentAppointment.queueDate,
      queueStatus: "IN_PROGRESS",
    });

    if (!activeExists && currentAppointment.queueNumber === 1) {
      currentAppointment.queueStatus = "IN_PROGRESS";
      await currentAppointment.save();
    }

    currentAppointment.status = "COMPLETED";
    currentAppointment.queueStatus = "COMPLETED";
    await currentAppointment.save();

    const nextAppointment = await Appointment.findOne({
      doctor: req.user._id,
      queueDate: currentAppointment.queueDate,
      queueNumber: currentAppointment.queueNumber + 1,
      status: { $ne: "CANCELLED" },
    });

    if (nextAppointment) {
      nextAppointment.queueStatus = "IN_PROGRESS";
      await nextAppointment.save();
    }

    const io = req.app.get("io");
    const roomName = `queue:${req.user._id}:${currentAppointment.queueDate
      .toISOString()
      .split("T")[0]}`;

    io.to(roomName).emit("queueUpdated", {
      doctorId: req.user._id,
      date: currentAppointment.queueDate,
    });

    res.json({
      success: true,
      message: "Appointment completed and queue updated",
    });
  } catch (error) {
    console.error("Complete appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete appointment",
    });
  }
};
