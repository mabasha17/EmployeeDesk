import express from "express";
import {
  getAdminStats,
  getRecentLeaves,
  getRecentEmployees,
  getRecentAttendance,
  getRecentSalaries,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeProfile,
  updateEmployeeProfile,
  getEmployeeDashboard,
} from "../controllers/adminController.js";
import { auth, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Admin route accessed: ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});

// Admin dashboard routes
router.get("/stats", auth, isAdmin, getAdminStats);
router.get("/leaves/recent", auth, isAdmin, getRecentLeaves);
router.get("/employees/recent", auth, isAdmin, getRecentEmployees);
router.get("/attendance/recent", auth, isAdmin, getRecentAttendance);
router.get("/salaries/recent", auth, isAdmin, getRecentSalaries);

// Employee management routes
router.get("/employees", auth, isAdmin, getEmployees);
router.post("/employees", auth, isAdmin, createEmployee);
router.get("/employees/:id", auth, isAdmin, getEmployeeById);
router.put("/employees/:id", auth, isAdmin, updateEmployee);
router.delete("/employees/:id", auth, isAdmin, deleteEmployee);

// Employee profile routes (accessible by both admin and employee)
router.get("/employee/profile", auth, getEmployeeProfile);
router.put("/employee/profile", auth, updateEmployeeProfile);
router.get("/employee/dashboard", auth, getEmployeeDashboard);

export default router;
