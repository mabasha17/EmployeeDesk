import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Salary from "../models/Salary.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error("Error getting all employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single employee
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate(
      "user",
      "name email role"
    );
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    console.error("Error getting employee by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create employee
export const createEmployee = async (req, res) => {
  try {
    console.log("Creating new employee with data:", req.body);

    const { name, email, password, department, position, salary, joiningDate } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !position ||
      !salary ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message:
          "Please provide all required fields: name, email, password, department, position, salary, and joiningDate",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User with email already exists:", email);
      return res.status(400).json({
        success: false,
        error: "Email already exists",
        message:
          "A user with this email address already exists. Please use a different email.",
      });
    }

    // Create new user
    console.log("Creating new user...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    });
    await user.save();
    console.log("User created successfully:", user._id);

    // Create employee with user reference
    console.log("Creating new employee...");
    const employee = new Employee({
      user: user._id,
      name,
      email,
      department,
      position,
      salary,
      joiningDate,
      status: "active",
    });
    await employee.save();
    console.log("Employee created successfully:", employee._id);

    // Populate user data in response
    const populatedEmployee = await Employee.findById(employee._id).populate(
      "user",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: populatedEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          error: "Duplicate email",
          message:
            "A user with this email address already exists. Please use a different email.",
        });
      } else if (error.keyPattern.employeeId) {
        return res.status(400).json({
          success: false,
          error: "Duplicate employee ID",
          message:
            "An error occurred while generating employee ID. Please try again.",
        });
      }
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: error.message,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to create employee. Please try again later.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, position, salary, joiningDate, status } =
      req.body;

    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Update user if email or name changed
    if (name || email) {
      await User.findByIdAndUpdate(employee.user, {
        ...(name && { name }),
        ...(email && { email }),
      });
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { name, email, department, position, salary, joiningDate, status },
      { new: true }
    ).populate("user", "name email role");

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Delete user
    await User.findByIdAndDelete(employee.user);

    // Delete employee
    await Employee.findByIdAndDelete(id);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmployeeProfile = async (req, res) => {
  try {
    console.log("getEmployeeProfile called");
    console.log("User in request:", req.user);

    let employee;

    // If an ID is provided in params, use that
    if (req.params.id) {
      console.log("Finding employee by ID:", req.params.id);
      employee = await Employee.findById(req.params.id);
    } else {
      // Otherwise, get the profile of the currently logged in user
      console.log("Finding employee by user ID:", req.user._id);
      employee = await Employee.findOne({ user: req.user._id });
      console.log("Employee found:", employee ? "Yes" : "No");
    }

    if (!employee) {
      console.log("Employee profile not found");
      return res.status(404).json({ error: "Employee profile not found" });
    }

    console.log("Returning employee profile");
    res.json(employee);
  } catch (error) {
    console.error("Error getting employee profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ error: "Employee profile not found" });
    }
    res.json(employee);
  } catch (error) {
    console.error("Error updating employee profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmployeeDashboard = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ error: "Employee profile not found" });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const salary = await Salary.findOne({ employee: employee._id }).sort({
      createdAt: -1,
    });

    res.json({
      employee,
      recentLeaves: leaves,
      salary,
    });
  } catch (error) {
    console.error("Error getting employee dashboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    // Get all employees
    const employees = await Employee.find().select("-password");

    // Get all leaves
    const leaves = await Leave.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(
      (emp) => emp.status === "active"
    ).length;
    const pendingLeaves = leaves.filter(
      (leave) => leave.status === "pending"
    ).length;
    const totalDepartments = new Set(employees.map((emp) => emp.department))
      .size;

    // Get recent employees (last 5)
    const recentEmployees = employees.slice(-5).reverse();

    // Get recent leaves (last 5)
    const recentLeaves = leaves.slice(-5).reverse();

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        totalDepartments,
      },
      recentEmployees,
      recentLeaves,
    });
  } catch (error) {
    console.error("Error getting admin dashboard:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
