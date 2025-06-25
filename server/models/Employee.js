import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow undefined during creation
          return /^EMP\d{7}$/.test(v); // EMP + 7 digits
        },
        message:
          "Employee ID must be in format EMP + 7 digits (e.g., EMP0000001)",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "IT",
        "HR",
        "Finance",
        "Marketing",
        "Sales",
        "Operations",
        "Customer Support",
        "Engineering",
        "Product Management",
        "Design",
      ],
    },
    position: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },
    // Additional fields for better employee management
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ["aadhar", "pan", "passport", "driving_license", "other"],
        },
        number: String,
        expiryDate: Date,
      },
    ],
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

// Pre-save hook to generate unique 7-digit employeeId
employeeSchema.pre("save", async function (next) {
  try {
    // Only generate employeeId if it doesn't exist
    if (!this.employeeId) {
      console.log("Generating unique 7-digit employee ID...");

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          // Find the highest existing employeeId
          const lastEmployee = await this.constructor.findOne(
            {},
            { employeeId: 1 },
            { sort: { employeeId: -1 } }
          );

          let nextNumber = 1;

          if (lastEmployee && lastEmployee.employeeId) {
            // Extract the number from the last employeeId (e.g., "EMP0000123" -> 123)
            const lastNumber = parseInt(
              lastEmployee.employeeId.replace("EMP", "")
            );
            if (!isNaN(lastNumber)) {
              nextNumber = lastNumber + 1;
            }
          }

          // Ensure the number doesn't exceed 7 digits (9999999)
          if (nextNumber > 9999999) {
            throw new Error("Maximum employee limit reached");
          }

          // Format as EMP + 7 digits with leading zeros
          const newEmployeeId = `EMP${String(nextNumber).padStart(7, "0")}`;

          // Check if this ID already exists (race condition protection)
          const existingEmployee = await this.constructor.findOne({
            employeeId: newEmployeeId,
          });
          if (!existingEmployee) {
            this.employeeId = newEmployeeId;
            console.log(`Generated employee ID: ${this.employeeId}`);
            break; // Success, exit the retry loop
          } else {
            console.log(
              `Employee ID ${newEmployeeId} already exists, retrying...`
            );
            retryCount++;
            if (retryCount >= maxRetries) {
              throw new Error(
                "Failed to generate unique employee ID after multiple attempts"
              );
            }
          }
        } catch (retryError) {
          console.error(`Retry ${retryCount + 1} failed:`, retryError);
          retryCount++;
          if (retryCount >= maxRetries) {
            throw retryError;
          }
        }
      }
    }
    next();
  } catch (error) {
    console.error("Error generating employee ID:", error);
    next(error);
  }
});

// Post-save hook to ensure employeeId is set
employeeSchema.post("save", function (doc) {
  if (!doc.employeeId) {
    console.error("Employee saved without employeeId!");
  } else {
    console.log(`Employee saved successfully with ID: ${doc.employeeId}`);
  }
});

// Index for better performance
employeeSchema.index({ employeeId: 1 }, { unique: true, sparse: true });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ user: 1 }, { unique: true });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

// Virtual for full employee info
employeeSchema.virtual("fullInfo").get(function () {
  return {
    employeeId: this.employeeId,
    name: this.name,
    email: this.email,
    department: this.department,
    position: this.position,
    status: this.status,
  };
});

// Ensure virtuals are included in JSON output
employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
