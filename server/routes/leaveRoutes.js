import express from "express";
import {
  getAllLeaves,
  updateLeaveStatus,
  getEmployeeLeaves,
  createLeave,
  getLeaveById,
  getRecentLeaves,
} from "../controllers/leaveController.js";
import { auth, isAdmin, isEmployee } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/leaves", auth, isAdmin, getAllLeaves);
router.put("/admin/leaves/:id/status", auth, isAdmin, updateLeaveStatus);
router.get("/recent", auth, isAdmin, getRecentLeaves);

// Employee routes
router.get("/employee/leaves", auth, isEmployee, getEmployeeLeaves);
router.post("/employee/leaves", auth, isEmployee, createLeave);
router.get("/employee/leaves/:id", auth, isEmployee, getLeaveById);

export default router;
