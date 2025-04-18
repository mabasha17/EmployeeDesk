import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Department from "../models/Department.js";
import Attendance from "../models/Attendance.js";
import Salary from "../models/Salary.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAdminStats = async (req, res) => {
  try {
    console.log("Fetching admin stats for user:", req.user._id);

    const [totalEmployees, activeEmployees, pendingLeaves, totalDepartments] =
      await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: "active" }),
        Leave.countDocuments({ status: "pending" }),
        Department.countDocuments(),
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
    const recentLeaves = await Leave.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("employee", "name email");
    res.json({ success: true, data: recentLeaves });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getRecentEmployees = async (req, res) => {
  try {
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, data: recentEmployees });
  } catch (error) {
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
    const {
      name,
      email,
      password,
      department,
      position,
      salary,
      joiningDate,
      contactNumber,
      address,
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account first
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    });
    await newUser.save();

    // Create new employee with reference to user
    const newEmployee = new Employee({
      user: newUser._id, // Link to the created user
      name,
      email,
      department,
      position,
      salary,
      joiningDate,
      contactNumber,
      address,
      status: "active",
    });
    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        position: newEmployee.position,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
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
    const updateData = req.body;

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Also update the corresponding user account if email or password was changed
    if (updateData.email || updateData.password) {
      await User.findOneAndUpdate(
        { email: updatedEmployee.email },
        {
          email: updateData.email || updatedEmployee.email,
          password: updateData.password || undefined,
        }
      );
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
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

    // Delete both employee and user account
    await Promise.all([
      Employee.findByIdAndDelete(id),
      User.findOneAndDelete({ email: employee.email }),
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
    const employee = await Employee.findById(id);

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
