import React, { createContext, useState, useContext, useEffect } from "react"; // eslint-disable-line no-unused-vars
import PropTypes from "prop-types";
import axios from "axios";
import { API_URL } from "../config";

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Auth API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.code === "ECONNREFUSED") {
      console.error(
        "Could not connect to the server. Please make sure the backend server is running."
      );
      return Promise.reject(
        new Error("Could not connect to the server. Please try again later.")
      );
    }

    if (error.response?.status === 401) {
      console.log("Unauthorized access. Clearing token and redirecting...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching user profile...");
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !response.data.user) {
        throw new Error("Invalid user data received");
      }

      console.log("User profile fetched successfully:", response.data.user);
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch user profile"
      );
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting login...");
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error("Invalid login response");
      }

      console.log("Login successful:", response.data.user);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setError(null);
      return response.data.user;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting registration...");
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error("Invalid registration response");
      }

      console.log("Registration successful:", response.data.user);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setError(null);
      return response.data.user;
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  const isAuthenticated = () => !!user && !!localStorage.getItem("token");
  const isAdmin = () => user?.role === "admin";
  const isEmployee = () => user?.role === "employee";

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    fetchUserProfile,
    isAuthenticated,
    isAdmin,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
