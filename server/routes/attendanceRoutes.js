import express from "express";
import {
  getAllAttendance,
  getEmployeeAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";
import { auth, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Admin routes
router.get("/", isAdmin, getAllAttendance);
router.delete("/:id", isAdmin, deleteAttendance);

// Employee routes
router.get("/employee", getEmployeeAttendance);
router.post("/", createAttendance);
router.put("/:id", updateAttendance);

export default router;
