import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    // Which doctor this availability belongs to
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Day of the week (weekly schedule)
    dayOfWeek: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },

    // Start time (e.g. "10:00")
    startTime: {
      type: String,
      required: true,
    },

    // End time (e.g. "13:00")
    endTime: {
      type: String,
      required: true,
    },

    // Duration of each appointment slot (in minutes)
    slotDuration: {
      type: Number,
      required: true,
      default: 30,
    },

    // Whether this availability is active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const DoctorAvailability = mongoose.model(
  "DoctorAvailability",
  doctorAvailabilitySchema
);

export default DoctorAvailability;
