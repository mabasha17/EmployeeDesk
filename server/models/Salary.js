import mongoose from "mongoose";
import Counter from "./Counter.js";

const salarySchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate transaction ID
salarySchema.pre("save", async function (next) {
  try {
    // Generate sequential transaction ID if not already set
    if (!this.transactionId) {
      const seq = await Counter.getNextSequence("salaryTransactionId");
      this.transactionId = `SAL${String(seq).padStart(4, "0")}`;
      console.log(
        `Generated sequential salary transaction ID: ${this.transactionId}`
      );
    }
    next();
  } catch (error) {
    console.error("Error in salary pre-save hook:", error);
    next();
  }
});

const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
