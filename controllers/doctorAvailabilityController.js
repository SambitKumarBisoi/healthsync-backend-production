import DoctorAvailability from "../models/DoctorAvailability.js";
import generateSlots from "../utils/generateSlots.js";

/**
 * CREATE DOCTOR AVAILABILITY
 */
export const createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

    const allowedDurations = [10, 15, 20, 30, 45, 60];

    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day, start time and end time are required",
      });
    }

    if (!allowedDurations.includes(Number(slotDuration))) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot duration selected",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const availability = await DoctorAvailability.create({
      doctor: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability,
    });

  } catch (error) {
    console.error("Create availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * GET OWN AVAILABILITY (Doctor)
 */
export const getMyAvailability = async (req, res) => {
  try {
    const availability = await DoctorAvailability.find({
      doctor: req.user._id,
      isActive: true,
    }).sort({ dayOfWeek: 1 });

    const availabilityWithSlots = availability.map((item) => {
      const allSlots = generateSlots(
        item.startTime,
        item.endTime,
        item.slotDuration
      );

      const activeSlots = allSlots.filter(
        (slot) => !item.disabledSlots.includes(slot)
      );

      return {
        ...item.toObject(),
        slots: activeSlots,
      };
    });

    res.status(200).json({
      success: true,
      availability: availabilityWithSlots,
    });

  } catch (error) {
    console.error("Get my availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * GET AVAILABILITY BY DOCTOR ID (Patient)
 */
import Appointment from "../models/Appointment.js";

export const getAvailabilityByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
const { date } = req.query;

if (!date) {
  return res.status(400).json({
    success: false,
    message: "Date query parameter is required",
  });
}

// FIXED DATE PARSING
const [year, month, day] = date.split("-");

const selectedDate = new Date(
  Number(year),
  Number(month) - 1,
  Number(day)
);

const dayName = selectedDate.toLocaleDateString("en-US", {
  weekday: "long",
});

    // 1️⃣ Get availability for that weekday
    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      dayOfWeek: dayName,
      isActive: true,
    });

    // 2️⃣ Get already booked appointments for that date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: selectedDate,
      status: { $ne: "CANCELLED" },
    });

    const bookedSlots = bookedAppointments.map(
      (appt) => appt.slotTime
    );

    // 3️⃣ Generate slots and remove disabled + booked
    const availabilityWithSlots = availability.map((item) => {
      const allSlots = generateSlots(
        item.startTime,
        item.endTime,
        item.slotDuration
      );

      const filteredSlots = allSlots.filter(
        (slot) =>
          !item.disabledSlots.includes(slot) &&
          !bookedSlots.includes(slot)
      );

      return {
        ...item.toObject(),
        slots: filteredSlots,
      };
    });

    res.status(200).json({
      success: true,
      availability: availabilityWithSlots,
    });

  } catch (error) {
    console.error("Availability fetch error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * UPDATE DOCTOR AVAILABILITY
 */
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

    const availability = await DoctorAvailability.findOne({
      _id: id,
      doctor: req.user._id,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    availability.dayOfWeek = dayOfWeek || availability.dayOfWeek;
    availability.startTime = startTime || availability.startTime;
    availability.endTime = endTime || availability.endTime;
    availability.slotDuration =
      slotDuration || availability.slotDuration;

    await availability.save();

    res.json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });

  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * DISABLE ENTIRE AVAILABILITY
 */
export const disableAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await DoctorAvailability.findOne({
      _id: id,
      doctor: req.user._id,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    availability.isActive = false;
    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability disabled successfully",
    });

  } catch (error) {
    console.error("Disable availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * DISABLE SPECIFIC SLOT
 */
export const disableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slot } = req.body;

    const availability = await DoctorAvailability.findOne({
      _id: id,
      doctor: req.user._id,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    if (!availability.disabledSlots.includes(slot)) {
      availability.disabledSlots.push(slot);
    }

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Slot disabled successfully",
    });

  } catch (error) {
    console.error("Disable slot error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};