import express from "express";
import {
  getAllSalaries,
  createSalary,
  updateSalary,
  getSalaryById,
  getEmployeeSalary,
  getEmployeeSalaryHistory,
} from "../controllers/salaryController.js";
import { auth, isAdmin, isEmployee } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/salaries", auth, isAdmin, getAllSalaries);
router.post("/admin/salaries", auth, isAdmin, createSalary);
router.put("/admin/salaries/:id", auth, isAdmin, updateSalary);
router.get("/admin/salaries/:id", auth, isAdmin, getSalaryById);

// Employee routes
router.get("/employee/salary", auth, isEmployee, getEmployeeSalary);
router.get(
  "/employee/salary/history",
  auth,
  isEmployee,
  getEmployeeSalaryHistory
);

export default router;
