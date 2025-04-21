import mongoose from "mongoose";
import Counter from "./Counter.js";

const leaveSchema = new mongoose.Schema(
  {
    leaveId: {
      type: String,
      unique: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
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
    },
    type: {
      type: String,
      enum: ["sick", "vacation", "personal", "annual", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    comments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to get employee name from User model and generate leaveId
leaveSchema.pre("save", async function (next) {
  try {
    // Generate sequential leave ID if not already set
    if (!this.leaveId) {
      const seq = await Counter.getNextSequence("leaveId");
      this.leaveId = `LVE${String(seq).padStart(4, "0")}`;
      console.log(`Generated sequential leave ID: ${this.leaveId}`);
    }

    // Set employee name if not already set
    if (this.isNew || this.isModified("employee")) {
      const User = mongoose.model("User");
      const user = await User.findById(this.employee);
      if (user) {
        this.employeeName = user.name;
      }
    }
    next();
  } catch (error) {
    console.error("Error in leave pre-save hook:", error);
    next();
  }
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
