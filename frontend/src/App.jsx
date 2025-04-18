import React from "react"; // eslint-disable-line no-unused-vars
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { EmployeeProvider } from "./context/EmployeeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminLeaves from "./pages/AdminLeaves";
import AdminAttendance from "./pages/AdminAttendance";
import AdminSalaries from "./pages/AdminSalaries";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeLeave from "./pages/EmployeeLeave";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeSalary from "./pages/EmployeeSalary";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <EmployeeProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Admin protected routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="leaves" element={<AdminLeaves />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="salaries" element={<AdminSalaries />} />
            </Route>

            {/* Employee protected routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="leave" element={<EmployeeLeave />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="salary" element={<EmployeeSalary />} />
            </Route>

            {/* Redirect root to appropriate dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {(user) => (
                    <Navigate
                      to={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : "/employee/dashboard"
                      }
                      replace
                    />
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </EmployeeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
