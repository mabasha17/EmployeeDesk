import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Employee from "./models/Employee.js";

dotenv.config();

const testEmployeeCreation = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URL || "mongodb://localhost:27017/ems"
    );
    console.log("MongoDB connected successfully");

    // Check existing users
    console.log("\n=== Existing Users ===");
    const users = await User.find({}, { name: 1, email: 1, role: 1 });
    console.log(`Total users: ${users.length}`);
    users.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    // Check existing employees
    console.log("\n=== Existing Employees ===");
    const employees = await Employee.find(
      {},
      { name: 1, email: 1, employeeId: 1 }
    );
    console.log(`Total employees: ${employees.length}`);
    employees.forEach((emp) => {
      console.log(
        `- ${emp.name} (${emp.email}) - ${emp.employeeId || "No ID"}`
      );
    });

    // Test creating a new employee
    console.log("\n=== Testing Employee Creation ===");

    // Check if test email already exists
    const testEmail = `test.employee.${Date.now()}@company.com`;
    console.log(`Testing with email: ${testEmail}`);

    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log("Test email already exists, skipping test");
    } else {
      // Create test user
      const testUser = new User({
        name: "Test Employee",
        email: testEmail,
        password: "hashedpassword",
        role: "employee",
      });
      await testUser.save();
      console.log("Test user created successfully");

      // Create test employee
      const testEmployee = new Employee({
        user: testUser._id,
        name: "Test Employee",
        email: testEmail,
        department: "Engineering",
        position: "Software Engineer",
        salary: 75000,
        joiningDate: new Date(),
        status: "active",
      });

      await testEmployee.save();
      console.log(
        `Test employee created successfully with ID: ${testEmployee.employeeId}`
      );

      // Clean up test data
      await Employee.findByIdAndDelete(testEmployee._id);
      await User.findByIdAndDelete(testUser._id);
      console.log("Test data cleaned up");
    }

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

testEmployeeCreation();
