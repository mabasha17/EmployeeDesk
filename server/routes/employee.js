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

// Add debug middleware to log route access
router.use((req, res, next) => {
  console.log(`Employee route accessed: ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("User:", req.user);
  next();
});

// Apply auth middleware to all routes
router.use(auth);

// Admin dashboard route
router.get("/dashboard", isAdmin, getAdminDashboard);

// Employee's own profile routes (must be before /:id routes)
router.get("/profile", getEmployeeProfile);

// Employee routes
router.get("/", getAllEmployees);
router.post("/", isAdmin, createEmployee);
router.get("/:id", getEmployeeById);
router.put("/:id", isAdmin, updateEmployee);
router.delete("/:id", isAdmin, deleteEmployee);
router.get("/profile/:id", getEmployeeProfile);
router.put("/profile/:id", updateEmployeeProfile);
router.get("/dashboard/:id", getEmployeeDashboard);

export default router;
