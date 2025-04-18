import express from "express";
import {
  login,
  verifyToken,
  getProfile,
} from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/verify", auth, verifyToken);
router.get("/profile", auth, getProfile);

export default router;
