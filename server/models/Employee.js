import mongoose from "mongoose";
import Counter from "./Counter.js";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

// Pre-save hook to generate sequential employeeId
employeeSchema.pre("save", async function (next) {
  if (!this.employeeId) {
    try {
      // Get sequential counter value
      const seq = await Counter.getNextSequence("employeeId");

      // Format employee ID with padding (e.g., EMP00001)
      this.employeeId = `EMP${String(seq).padStart(5, "0")}`;
      console.log(`Generated sequential employee ID: ${this.employeeId}`);
    } catch (error) {
      console.error("Error generating employee ID:", error);
      // Fallback to date-based ID if counter fails
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      this.employeeId = `EMP-${year}${month}${day}-${random}`;
    }
  }
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
