import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    leaveId: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^LVE\d{7}$/.test(v); // LVE + 7 digits
        },
        message: "Leave ID must be in format LVE + 7 digits (e.g., LVE0000001)",
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "sick",
        "vacation",
        "personal",
        "annual",
        "maternity",
        "paternity",
        "bereavement",
        "other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    comments: {
      type: String,
      trim: true,
    },
    // Additional fields for better leave management
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    halfDay: {
      type: Boolean,
      default: false,
    },
    attachment: {
      fileName: String,
      fileUrl: String,
    },
  },
  {
    timestamps: true,
    collection: "leaves",
  }
);

// Pre-save hook to generate unique leave ID and set employee details
leaveSchema.pre("save", async function (next) {
  try {
    // Generate unique leave ID if not already set
    if (!this.leaveId) {
      console.log("Generating unique 7-digit leave ID...");

      // Find the highest existing leaveId
      const lastLeave = await this.constructor.findOne(
        {},
        { leaveId: 1 },
        { sort: { leaveId: -1 } }
      );

      let nextNumber = 1;

      if (lastLeave && lastLeave.leaveId) {
        // Extract the number from the last leaveId (e.g., "LVE0000123" -> 123)
        const lastNumber = parseInt(lastLeave.leaveId.replace("LVE", ""));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      // Ensure the number doesn't exceed 7 digits (9999999)
      if (nextNumber > 9999999) {
        throw new Error("Maximum leave limit reached");
      }

      // Format as LVE + 7 digits with leading zeros
      this.leaveId = `LVE${String(nextNumber).padStart(7, "0")}`;
      console.log(`Generated leave ID: ${this.leaveId}`);
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

    // Calculate total days if start and end dates are provided
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diffTime = Math.abs(end - start);
      this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    next();
  } catch (error) {
    console.error("Error in leave pre-save hook:", error);
    next(error);
  }
});

// Index for better performance
leaveSchema.index({ leaveId: 1 }, { unique: true, sparse: true });
leaveSchema.index({ employee: 1 });
leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ endDate: 1 });
leaveSchema.index({ type: 1 });

// Virtual for leave summary
leaveSchema.virtual("leaveSummary").get(function () {
  return {
    leaveId: this.leaveId,
    employeeId: this.employeeId,
    employeeName: this.employeeName,
    type: this.type,
    status: this.status,
    totalDays: this.totalDays,
    startDate: this.startDate,
    endDate: this.endDate,
  };
});

// Ensure virtuals are included in JSON output
leaveSchema.set("toJSON", { virtuals: true });
leaveSchema.set("toObject", { virtuals: true });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
