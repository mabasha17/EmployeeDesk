import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Department from "../models/Department.js";
import Attendance from "../models/Attendance.js";
import Salary from "../models/Salary.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const getAdminStats = async (req, res) => {
  try {
    console.log("Fetching admin stats for user:", req.user._id);

    let totalDepartments = 0;
    try {
      // Check if Department model exists and is accessible
      if (mongoose.models.Department) {
        totalDepartments = await Department.countDocuments();
      } else {
        console.warn("Department model not found or not accessible");
      }
    } catch (deptError) {
      console.error("Error fetching department stats:", deptError);
      // Continue with other stats
    }

    const [totalEmployees, activeEmployees, pendingLeaves] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Leave.countDocuments({ status: "pending" }),
    ]);

    console.log("Admin stats fetched successfully:", {
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      totalDepartments,
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        totalDepartments,
      },
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getRecentLeaves = async (req, res) => {
  try {
    console.log("Fetching recent leaves");

    let recentLeaves = [];
    try {
      recentLeaves = await Leave.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("employee", "name email");
      console.log(`Found ${recentLeaves.length} recent leaves`);
    } catch (error) {
      console.error("Error in leave query:", error);
      // Return empty array instead of failing
      recentLeaves = [];
    }

    res.json({ success: true, data: recentLeaves });
  } catch (error) {
    console.error("Error getting recent leaves:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getRecentEmployees = async (req, res) => {
  try {
    console.log("Fetching recent employees");

    let recentEmployees = [];
    try {
      recentEmployees = await Employee.find().sort({ createdAt: -1 }).limit(5);
      console.log(`Found ${recentEmployees.length} recent employees`);
    } catch (error) {
      console.error("Error in employee query:", error);
      // Return empty array instead of failing
      recentEmployees = [];
    }

    res.json({ success: true, data: recentEmployees });
  } catch (error) {
    console.error("Error getting recent employees:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getRecentAttendance = async (req, res) => {
  try {
    const recentAttendance = await Attendance.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("employee", "name email");
    res.json({ success: true, data: recentAttendance });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getRecentSalaries = async (req, res) => {
  try {
    const recentSalaries = await Salary.find()
      .sort({ month: -1 })
      .limit(5)
      .populate("employee", "name email");
    res.json({ success: true, data: recentSalaries });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    console.log("=== Creating Employee ===");
    console.log("Request body:", req.body);

    const { name, email, password, department, salary, joiningDate, phone } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !salary ||
      !joiningDate
    ) {
      console.log("Missing required fields");
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, email, password, department, salary, joiningDate",
      });
    }

    // Check if user already exists (since email uniqueness is on User model)
    console.log("Checking for existing user with email:", email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({
        success: false,
        message:
          "A user with this email address already exists. Please use a different email.",
      });
    }

    // Also check if employee already exists with this email
    console.log("Checking for existing employee with email:", email);
    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase(),
    });
    if (existingEmployee) {
      console.log("Employee already exists with email:", email);
      return res.status(400).json({
        success: false,
        message:
          "An employee with this email address already exists. Please use a different email.",
      });
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account first
    console.log("Creating user account...");
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "employee",
    });

    try {
      await newUser.save();
      console.log("User created successfully with ID:", newUser._id);
    } catch (userError) {
      console.error("Error creating user:", userError);
      if (userError.code === 11000 && userError.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message:
            "A user with this email address already exists. Please use a different email.",
        });
      }
      throw userError;
    }

    // Create new employee with reference to user
    console.log("Creating employee record...");
    const employeeData = {
      user: newUser._id, // Link to the created user
      name,
      email: email.toLowerCase(),
      department,
      salary: Number(salary),
      joiningDate: new Date(joiningDate),
      phone,
      status: "active",
    };

    const newEmployee = new Employee(employeeData);

    console.log("Employee object before save:", {
      user: newEmployee.user,
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department,
      salary: newEmployee.salary,
      joiningDate: newEmployee.joiningDate,
      employeeId: newEmployee.employeeId, // This should be undefined initially
    });

    try {
      await newEmployee.save();
      console.log("Employee saved successfully with ID:", newEmployee._id);
      console.log("Generated employeeId:", newEmployee.employeeId);
    } catch (employeeError) {
      console.error("Error creating employee:", employeeError);

      // If employee creation fails, delete the user we just created
      try {
        await User.findByIdAndDelete(newUser._id);
        console.log("Deleted user due to employee creation failure");
      } catch (deleteError) {
        console.error(
          "Error deleting user after employee creation failure:",
          deleteError
        );
      }

      if (employeeError.code === 11000) {
        if (employeeError.keyPattern.email) {
          return res.status(400).json({
            success: false,
            message:
              "An employee with this email address already exists. Please use a different email.",
          });
        }
        if (employeeError.keyPattern.employeeId) {
          return res.status(400).json({
            success: false,
            message: "Employee ID generation error. Please try again.",
          });
        }
      }

      if (employeeError.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: employeeError.message,
        });
      }

      throw employeeError;
    }

    // Populate user data in response
    console.log("Populating user data...");
    const populatedEmployee = await Employee.findById(newEmployee._id).populate(
      "user",
      "name email role"
    );

    console.log("=== Employee Creation Complete ===");
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: populatedEmployee,
    });
  } catch (error) {
    console.error("=== Error Creating Employee ===");
    console.error("Error details:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message:
            "A user with this email address already exists. Please use a different email.",
        });
      }
      if (error.keyPattern.employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID generation error. Please try again.",
        });
      }
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, salary, joiningDate, phone, status } = req.body;

    // Find employee first
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Convert salary to number if provided
    if (salary) {
      req.body.salary = Number(salary);
    }

    // Convert joiningDate to Date if provided
    if (joiningDate) {
      req.body.joiningDate = new Date(joiningDate);
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("user", "name email role");

    // Also update the corresponding user account if email, name, or password was changed
    if (req.body.email || req.body.name || req.body.password) {
      const userUpdateData = {};
      if (req.body.email) userUpdateData.email = req.body.email;
      if (req.body.name) userUpdateData.name = req.body.name;
      if (req.body.password) userUpdateData.password = req.body.password;

      await User.findByIdAndUpdate(employee.user, userUpdateData);
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message:
            "A user with this email address already exists. Please use a different email.",
        });
      }
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete both employee and user account using the user reference
    await Promise.all([
      Employee.findByIdAndDelete(id),
      User.findByIdAndDelete(employee.user),
    ]);

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate(
      "user",
      "name email role"
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

export const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee profile",
      error: error.message,
    });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    const updateData = req.body;
    const employee = await Employee.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error updating employee profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating employee profile",
      error: error.message,
    });
  }
};

export const getEmployeeDashboard = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const [leaves, attendance, salary] = await Promise.all([
      Leave.find({ employee: employee._id }).sort({ createdAt: -1 }).limit(5),
      Attendance.find({ employee: employee._id }).sort({ date: -1 }).limit(5),
      Salary.find({ employee: employee._id }).sort({ month: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        employee,
        recentLeaves: leaves,
        recentAttendance: attendance,
        recentSalary: salary,
      },
    });
  } catch (error) {
    console.error("Error fetching employee dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee dashboard",
      error: error.message,
    });
  }
};
