import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import dotenv from "dotenv";

dotenv.config();

const sampleLeaves = [
  {
    employeeId: "EMP0001",
    employeeName: "John Doe",
    type: "vacation",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-05"),
    reason: "Annual vacation",
    status: "pending",
  },
  {
    employeeId: "EMP0002",
    employeeName: "Jane Smith",
    type: "sick",
    startDate: new Date("2024-03-10"),
    endDate: new Date("2024-03-11"),
    reason: "Medical appointment",
    status: "approved",
  },
  {
    employeeId: "EMP0003",
    employeeName: "Mike Johnson",
    type: "personal",
    startDate: new Date("2024-03-15"),
    endDate: new Date("2024-03-16"),
    reason: "Family event",
    status: "rejected",
  },
];

const seedLeaves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing leaves
    await Leave.deleteMany({});
    console.log("Cleared existing leaves");

    // Insert sample leaves
    await Leave.insertMany(sampleLeaves);
    console.log("Added sample leave requests");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding leaves:", error);
    process.exit(1);
  }
};

seedLeaves();
