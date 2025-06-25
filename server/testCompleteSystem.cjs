const mongoose = require("mongoose");
const Employee = require("./models/Employee.js");
const User = require("./models/User.js");

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/ems", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

  try {
    console.log("\n=== Testing Complete Employee Management System ===\n");

    // Clean up any existing test data
    await Employee.deleteMany({ email: { $regex: /test.*@example\.com$/ } });
    await User.deleteMany({ email: { $regex: /test.*@example\.com$/ } });

    // Test 1: Create Employee
    console.log("1. Testing Employee Creation...");
    const testEmployeeData = {
      name: "Test Employee",
      email: "test.employee@example.com",
      password: "password123",
      department: "IT",
      position: "Software Engineer",
      salary: 75000,
      joiningDate: "2024-01-15",
      phone: "+1234567890",
      address: "123 Test Street, Test City, TC 12345",
      status: "active",
      emergencyContact: {
        name: "Emergency Contact",
        phone: "+1987654321",
        relationship: "Spouse",
      },
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "Test Bank",
        ifscCode: "TEST0001234",
      },
    };

    const response = await fetch("http://localhost:5000/api/admin/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testEmployeeData),
    });

    const createResult = await response.json();

    if (response.ok) {
      console.log("✅ Employee created successfully");
      console.log(`   Employee ID: ${createResult.employee.employeeId}`);
      console.log(`   MongoDB ID: ${createResult.employee._id}`);

      const employeeId = createResult.employee._id;

      // Test 2: Read Employee
      console.log("\n2. Testing Employee Retrieval...");
      const readResponse = await fetch(
        `http://localhost:5000/api/admin/employees/${employeeId}`
      );
      const readResult = await readResponse.json();

      if (readResponse.ok) {
        console.log("✅ Employee retrieved successfully");
        console.log(`   Name: ${readResult.name}`);
        console.log(`   Email: ${readResult.email}`);
        console.log(`   Department: ${readResult.department}`);
        console.log(`   Salary: $${readResult.salary}`);
      } else {
        console.log("❌ Failed to retrieve employee:", readResult.message);
      }

      // Test 3: Update Employee
      console.log("\n3. Testing Employee Update...");
      const updateData = {
        name: "Updated Test Employee",
        salary: 80000,
        position: "Senior Software Engineer",
        status: "active",
      };

      const updateResponse = await fetch(
        `http://localhost:5000/api/admin/employees/${employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const updateResult = await updateResponse.json();

      if (updateResponse.ok) {
        console.log("✅ Employee updated successfully");
        console.log(`   New Name: ${updateResult.name}`);
        console.log(`   New Salary: $${updateResult.salary}`);
        console.log(`   New Position: ${updateResult.position}`);
      } else {
        console.log("❌ Failed to update employee:", updateResult.message);
      }

      // Test 4: List All Employees
      console.log("\n4. Testing Employee List...");
      const listResponse = await fetch(
        "http://localhost:5000/api/admin/employees"
      );
      const listResult = await listResponse.json();

      if (listResponse.ok) {
        console.log("✅ Employee list retrieved successfully");
        console.log(`   Total Employees: ${listResult.length}`);
        const testEmployee = listResult.find(
          (emp) => emp.email === "test.employee@example.com"
        );
        if (testEmployee) {
          console.log(
            `   Test Employee Found: ${testEmployee.name} (${testEmployee.employeeId})`
          );
        }
      } else {
        console.log("❌ Failed to retrieve employee list:", listResult.message);
      }

      // Test 5: Delete Employee
      console.log("\n5. Testing Employee Deletion...");
      const deleteResponse = await fetch(
        `http://localhost:5000/api/admin/employees/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const deleteResult = await deleteResponse.json();

      if (deleteResponse.ok) {
        console.log("✅ Employee deleted successfully");
        console.log(`   Message: ${deleteResult.message}`);
      } else {
        console.log("❌ Failed to delete employee:", deleteResult.message);
      }

      // Test 6: Verify Deletion
      console.log("\n6. Verifying Employee Deletion...");
      const verifyResponse = await fetch(
        `http://localhost:5000/api/admin/employees/${employeeId}`
      );

      if (verifyResponse.status === 404) {
        console.log("✅ Employee successfully deleted (404 Not Found)");
      } else {
        console.log("❌ Employee still exists after deletion");
      }
    } else {
      console.log("❌ Failed to create employee:", createResult.message);
    }

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Clean up
    await Employee.deleteMany({ email: { $regex: /test.*@example\.com$/ } });
    await User.deleteMany({ email: { $regex: /test.*@example\.com$/ } });
    mongoose.disconnect();
  }
});
