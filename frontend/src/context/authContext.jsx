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

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    window.location.href = "/login"; // Redirect to login on logout
  };

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

      // Ensure we have a consistent user object with _id
      const userData = response.data.user;

      // Normalize user object to ensure _id is used consistently
      const normalizedUser = {
        _id: userData._id || userData.id, // Prefer _id but fallback to id
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      console.log("User profile fetched successfully:", normalizedUser);
      setUser(normalizedUser);
      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch user profile"
      );
      logout(); // Use logout to clear state and redirect
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting login...");

      // Clear any existing token first
      localStorage.removeItem("token");

      // Create a dedicated axios instance for login to avoid interceptor issues
      const loginResponse = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Login API response:", loginResponse);

      if (!loginResponse.data || !loginResponse.data.token) {
        throw new Error("Invalid login response - no token received");
      }

      // Store the token immediately
      const token = loginResponse.data.token;
      localStorage.setItem("token", token);

      console.log("Token stored in localStorage");

      // Set the user from the response if available
      if (loginResponse.data.user) {
        // Normalize user object to ensure _id is used consistently
        const userData = loginResponse.data.user;
        const normalizedUser = {
          _id: userData._id || userData.id, // Prefer _id but fallback to id
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };

        console.log("Login successful. User data:", normalizedUser);
        setUser(normalizedUser);
        return normalizedUser;
      }

      // If no user in response, fetch profile with the new token
      console.log("Fetching user profile after login...");
      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.data || !profileResponse.data.user) {
        throw new Error("Failed to get user profile after login");
      }

      // Normalize user object to ensure _id is used consistently
      const profileData = profileResponse.data.user;
      const normalizedProfile = {
        _id: profileData._id || profileData.id, // Prefer _id but fallback to id
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
      };

      console.log("Profile fetched successfully:", normalizedProfile);
      setUser(normalizedProfile);
      setError(null);
      return normalizedProfile;
    } catch (err) {
      console.error("Login error details:", err);

      // Clear token on any login failure
      logout();

      // Provide more specific error messages
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response.data?.message || "Login failed");
        }
      } else if (
        err.code === "ECONNABORTED" ||
        err.message.includes("timeout")
      ) {
        setError("Connection timeout. Please check your internet connection.");
      } else if (err.code === "ECONNREFUSED") {
        setError(
          "Cannot connect to server. Please make sure the server is running."
        );
      } else {
        setError(err.message || "Login failed");
      }

      throw new Error(
        err.response?.data?.message || err.message || "Login failed"
      );
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

  const isAuthenticated = () => !!user && !!localStorage.getItem("token");
  const isAdmin = () => user?.role === "admin";
  const isEmployee = () => user?.role === "employee";

  const value = {
    user,
    loading,
    error,
    token: localStorage.getItem("token"),
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
