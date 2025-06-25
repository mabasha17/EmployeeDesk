import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^ATT\d{7}$/.test(v); // ATT + 7 digits
        },
        message:
          "Attendance ID must be in format ATT + 7 digits (e.g., ATT0000001)",
      },
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      ref: "Employee.employeeId",
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // Time tracking
    checkIn: {
      time: {
        type: Date,
      },
      location: {
        type: String,
        trim: true,
      },
      method: {
        type: String,
        enum: ["card_swipe", "biometric", "mobile_app", "manual", "other"],
        default: "manual",
      },
    },
    checkOut: {
      time: {
        type: Date,
      },
      location: {
        type: String,
        trim: true,
      },
      method: {
        type: String,
        enum: ["card_swipe", "biometric", "mobile_app", "manual", "other"],
        default: "manual",
      },
    },
    // Status and tracking
    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "late",
        "half-day",
        "leave",
        "holiday",
        "weekend",
      ],
      required: true,
    },
    // Working hours calculation
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtime: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Additional fields
    notes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    // Break tracking
    breaks: [
      {
        startTime: Date,
        endTime: Date,
        duration: Number, // in minutes
        type: {
          type: String,
          enum: ["lunch", "tea", "personal", "other"],
        },
      },
    ],
    // Location tracking
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
  },
  {
    timestamps: true,
    collection: "attendance",
  }
);

// Pre-save hook to generate unique attendance ID and set employee details
attendanceSchema.pre("save", async function (next) {
  try {
    // Generate unique attendance ID if not already set
    if (!this.attendanceId) {
      console.log("Generating unique 7-digit attendance ID...");

      // Find the highest existing attendanceId
      const lastAttendance = await this.constructor.findOne(
        {},
        { attendanceId: 1 },
        { sort: { attendanceId: -1 } }
      );

      let nextNumber = 1;

      if (lastAttendance && lastAttendance.attendanceId) {
        // Extract the number from the last attendanceId (e.g., "ATT0000123" -> 123)
        const lastNumber = parseInt(
          lastAttendance.attendanceId.replace("ATT", "")
        );
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      // Ensure the number doesn't exceed 7 digits (9999999)
      if (nextNumber > 9999999) {
        throw new Error("Maximum attendance record limit reached");
      }

      // Format as ATT + 7 digits with leading zeros
      this.attendanceId = `ATT${String(nextNumber).padStart(7, "0")}`;
      console.log(`Generated attendance ID: ${this.attendanceId}`);
    }

    // Set employee details if employee reference is provided
    if (this.isNew || this.isModified("employee")) {
      const Employee = mongoose.model("Employee");
      const employee = await Employee.findById(this.employee);
      if (employee) {
        this.employeeId = employee.employeeId;
        this.employeeName = employee.name;
      }
    }

    // Calculate total hours if check-in and check-out times are provided
    if (this.checkIn.time && this.checkOut.time) {
      const checkInTime = new Date(this.checkIn.time);
      const checkOutTime = new Date(this.checkOut.time);
      const diffTime = checkOutTime - checkInTime;
      const diffHours = diffTime / (1000 * 60 * 60);
      this.totalHours = Math.round(diffHours * 100) / 100; // Round to 2 decimal places

      // Calculate overtime (assuming 8 hours is standard work day)
      if (this.totalHours > 8) {
        this.overtime = this.totalHours - 8;
      }
    }

    next();
  } catch (error) {
    console.error("Error in attendance pre-save hook:", error);
    next(error);
  }
});

// Index for better performance
attendanceSchema.index({ attendanceId: 1 }, { unique: true, sparse: true });
attendanceSchema.index({ employee: 1 });
attendanceSchema.index({ employeeId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ "checkIn.time": 1 });
attendanceSchema.index({ "checkOut.time": 1 });

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Virtual for attendance summary
attendanceSchema.virtual("attendanceSummary").get(function () {
  return {
    attendanceId: this.attendanceId,
    employeeId: this.employeeId,
    employeeName: this.employeeName,
    date: this.date,
    status: this.status,
    totalHours: this.totalHours,
    overtime: this.overtime,
  };
});

// Virtual for check-in time as string
attendanceSchema.virtual("checkInTime").get(function () {
  return this.checkIn.time ? this.checkIn.time.toLocaleTimeString() : null;
});

// Virtual for check-out time as string
attendanceSchema.virtual("checkOutTime").get(function () {
  return this.checkOut.time ? this.checkOut.time.toLocaleTimeString() : null;
});

// Ensure virtuals are included in JSON output
attendanceSchema.set("toJSON", { virtuals: true });
attendanceSchema.set("toObject", { virtuals: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
