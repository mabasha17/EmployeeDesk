import React from "react"; // eslint-disable-line no-unused-vars
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Auth error:", error);
    return <Navigate to="/login" state={{ from: location, error }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified and doesn't match, redirect to appropriate dashboard
  if (requiredRole && user.role !== requiredRole) {
    console.warn(
      `Access denied: User role ${user.role} does not match required role ${requiredRole}`
    );
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"}
        replace
      />
    );
  }

  // If children is a function, call it with user
  if (typeof children === "function") {
    try {
      return children(user);
    } catch (err) {
      console.error("Error rendering protected route:", err);
      return (
        <Navigate
          to="/login"
          state={{ from: location, error: err.message }}
          replace
        />
      );
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;
