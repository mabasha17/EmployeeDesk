import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const auth = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);

    if (!authHeader) {
      console.log("No Authorization header");
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    // Extract token from Bearer scheme
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    console.log("Extracted token:", token ? "Present" : "Missing");

    if (!token) {
      console.log("No token found in Authorization header");
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded successfully:", {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email,
    });

    // Find user - Use _id consistently from token
    const userId = decoded._id || decoded.userId; // Fallback for backward compatibility
    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Attach user to request with proper MongoDB _id
    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    console.log("User attached to request:", {
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error) {
    console.error("Auth middleware error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log("No user in request");
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }
    if (req.user.role !== "admin") {
      console.log("User is not admin:", req.user.role);
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin only.",
      });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const isEmployee = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log("No user in request");
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }
    if (req.user.role !== "employee") {
      console.log("User is not employee:", req.user.role);
      return res.status(403).json({
        success: false,
        error: "Access denied. Employee only.",
      });
    }
    next();
  } catch (error) {
    console.error("Employee middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
