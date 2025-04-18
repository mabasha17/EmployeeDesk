import express from "express";
import {
  getAllAttendance,
  getAttendanceReports,
  createBulkAttendance,
  getEmployeeAttendance,
  checkIn,
  checkOut,
  getEmployeeAttendanceHistory,
} from "../controllers/attendanceController.js";
import { isAdmin, isEmployee } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/attendance", isAdmin, getAllAttendance);
router.get("/admin/attendance/reports", isAdmin, getAttendanceReports);
router.post("/admin/attendance/bulk", isAdmin, createBulkAttendance);

// Employee routes
router.get("/employee/attendance", isEmployee, getEmployeeAttendance);
router.post("/employee/attendance/check-in", isEmployee, checkIn);
router.post("/employee/attendance/check-out", isEmployee, checkOut);
router.get(
  "/employee/attendance/history",
  isEmployee,
  getEmployeeAttendanceHistory
);

export default router;
