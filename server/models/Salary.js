import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    salaryId: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^SAL\d{7}$/.test(v); // SAL + 7 digits
        },
        message:
          "Salary ID must be in format SAL + 7 digits (e.g., SAL0000001)",
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
    // Salary breakdown
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      da: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      loan: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    // Pay period
    month: {
      type: String,
      required: true,
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    year: {
      type: Number,
      required: true,
    },
    // Payment details
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "check", "cash", "other"],
      default: "bank_transfer",
    },
    // Additional fields
    workingDays: {
      type: Number,
      required: true,
    },
    overtime: {
      hours: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
    bonus: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "salaries",
  }
);

// Pre-save hook to generate unique salary ID and set employee details
salarySchema.pre("save", async function (next) {
  try {
    // Generate unique salary ID if not already set
    if (!this.salaryId) {
      console.log("Generating unique 7-digit salary ID...");

      // Find the highest existing salaryId
      const lastSalary = await this.constructor.findOne(
        {},
        { salaryId: 1 },
        { sort: { salaryId: -1 } }
      );

      let nextNumber = 1;

      if (lastSalary && lastSalary.salaryId) {
        // Extract the number from the last salaryId (e.g., "SAL0000123" -> 123)
        const lastNumber = parseInt(lastSalary.salaryId.replace("SAL", ""));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      // Ensure the number doesn't exceed 7 digits (9999999)
      if (nextNumber > 9999999) {
        throw new Error("Maximum salary record limit reached");
      }

      // Format as SAL + 7 digits with leading zeros
      this.salaryId = `SAL${String(nextNumber).padStart(7, "0")}`;
      console.log(`Generated salary ID: ${this.salaryId}`);
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

    next();
  } catch (error) {
    console.error("Error in salary pre-save hook:", error);
    next(error);
  }
});

// Virtual for total allowances
salarySchema.virtual("totalAllowances").get(function () {
  return Object.values(this.allowances || {}).reduce(
    (sum, value) => sum + (value || 0),
    0
  );
});

// Virtual for total deductions
salarySchema.virtual("totalDeductions").get(function () {
  return Object.values(this.deductions || {}).reduce(
    (sum, value) => sum + (value || 0),
    0
  );
});

// Virtual for net salary
salarySchema.virtual("netSalary").get(function () {
  const overtimeAmount = this.overtime ? this.overtime.amount : 0;
  const bonusAmount = this.bonus || 0;
  const grossSalary =
    this.basicSalary + this.totalAllowances + overtimeAmount + bonusAmount;
  return grossSalary - this.totalDeductions;
});

// Virtual for gross salary
salarySchema.virtual("grossSalary").get(function () {
  return (
    this.basicSalary + this.totalAllowances + this.overtime.amount + this.bonus
  );
});

// Index for better performance
salarySchema.index({ salaryId: 1 }, { unique: true, sparse: true });
salarySchema.index({ employee: 1 });
salarySchema.index({ employeeId: 1 });
salarySchema.index({ month: 1, year: 1 });
salarySchema.index({ status: 1 });
salarySchema.index({ paymentDate: 1 });

// Ensure virtuals are included in JSON output
salarySchema.set("toJSON", { virtuals: true });
salarySchema.set("toObject", { virtuals: true });

const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
