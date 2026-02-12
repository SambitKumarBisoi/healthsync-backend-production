import DoctorAvailability from "../models/DoctorAvailability.js";

/**
 * CREATE DOCTOR AVAILABILITY
 * Doctor only
 */
export const createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day, start time and end time are required",
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
      message: "Server error while creating availability",
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

    res.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("Get my availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability",
    });
  }
};

/**
 * GET AVAILABILITY BY DOCTOR ID (Patient)
 */
export const getAvailabilityByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      isActive: true,
    }).sort({ dayOfWeek: 1 });

    res.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("Get doctor availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctor availability",
    });
  }
};

/**
 * UPDATE DOCTOR AVAILABILITY
 * Doctor only
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
      message: "Server error while updating availability",
    });
  }
};

/**
 * DISABLE DOCTOR AVAILABILITY (Soft delete)
 * Doctor only
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

    res.json({
      success: true,
      message: "Availability disabled successfully",
    });
  } catch (error) {
    console.error("Disable availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while disabling availability",
    });
  }
};
