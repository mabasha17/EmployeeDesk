import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeProfile,
  updateEmployeeProfile,
  getEmployeeDashboard,
  getAdminDashboard,
} from "../controllers/employeeController.js";
import { auth, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Admin dashboard route
router.get("/dashboard", isAdmin, getAdminDashboard);

// Employee routes
router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);
router.post("/", isAdmin, createEmployee);
router.put("/:id", isAdmin, updateEmployee);
router.delete("/:id", isAdmin, deleteEmployee);
router.get("/profile/:id", getEmployeeProfile);
router.put("/profile/:id", updateEmployeeProfile);
router.get("/dashboard/:id", getEmployeeDashboard);

export default router;
