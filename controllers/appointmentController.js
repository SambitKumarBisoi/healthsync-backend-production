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
      return res.status(400).json({
        success: false,
        message: "DoctorId and date are required",
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // 1️⃣ Fetch availability for that weekday
    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    if (!availability.length) {
      return res.json({
        success: true,
        date,
        dayOfWeek,
        slots: [],
      });
    }

    // 2️⃣ Fetch already booked appointments
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: selectedDate,
      status: { $ne: "CANCELLED" },
    });

    const bookedSlots = bookedAppointments.map((a) => a.slotTime);

    let availableSlots = [];

    availability.forEach((a) => {
      const allSlots = generateSlots(
        a.startTime,
        a.endTime,
        a.slotDuration
      );

      const filteredSlots = allSlots.filter(
        (slot) =>
          !a.disabledSlots.includes(slot) &&
          !bookedSlots.includes(slot)
      );

      availableSlots.push(...filteredSlots);
    });

    res.json({
      success: true,
      date,
      dayOfWeek,
      slots: availableSlots,
    });

  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
    });
  }
};

/* =====================================================
   BOOK APPOINTMENT (PATIENT) + QUEUE ASSIGN
===================================================== */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, slotTime } = req.body;

    if (!doctorId || !appointmentDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and slot are required",
      });
    }

    const selectedDate = new Date(appointmentDate);

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // 1️⃣ Fetch availability
    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    if (!availability.length) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available on selected day",
      });
    }

    // 2️⃣ Generate valid slots (exclude disabled)
    let validSlots = [];

    availability.forEach((a) => {
      const allSlots = generateSlots(
        a.startTime,
        a.endTime,
        a.slotDuration
      );

      const filtered = allSlots.filter(
        (slot) => !a.disabledSlots.includes(slot)
      );

      validSlots.push(...filtered);
    });

    if (!validSlots.includes(slotTime)) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    // 3️⃣ Prevent double booking (doctor side)
    const doctorConflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: selectedDate,
      slotTime,
      status: { $ne: "CANCELLED" },
    });

    if (doctorConflict) {
      return res.status(409).json({
        success: false,
        message: "Doctor slot already booked",
      });
    }

    // 4️⃣ Prevent patient overlapping booking
    const patientAppointments = await Appointment.find({
      patient: req.user._id,
      appointmentDate: selectedDate,
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

    // 5️⃣ Queue assignment
    const lastInQueue = await Appointment.findOne({
      doctor: doctorId,
      queueDate: selectedDate,
      status: { $ne: "CANCELLED" },
    })
      .sort({ queueNumber: -1 })
      .select("queueNumber");

    const nextQueueNumber = lastInQueue
      ? lastInQueue.queueNumber + 1
      : 1;

    // 6️⃣ Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: selectedDate,
      slotTime,
      status: "PENDING",
      queueNumber: nextQueueNumber,
      queueStatus: "WAITING",
      queueDate: selectedDate,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

/* =====================================================
   RESCHEDULE APPOINTMENT
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
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const selectedDate = new Date(appointmentDate);

    appointment.appointmentDate = selectedDate;
    appointment.slotTime = slotTime;
    appointment.queueDate = selectedDate;

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment rescheduled",
      appointment,
    });

  } catch (error) {
    console.error("Reschedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reschedule",
    });
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
   PATIENT QUEUE POSITION
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
   COMPLETE APPOINTMENT (DOCTOR)
===================================================== */
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const currentAppointment = await Appointment.findOne({
      _id: id,
      doctor: req.user._id,
      status: { $ne: "COMPLETED" },
    });

    if (!currentAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
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