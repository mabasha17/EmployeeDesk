import React from "react"; // eslint-disable-line no-unused-vars
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUserClock,
  FaSignOutAlt,
} from "react-icons/fa";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="sidebar bg-dark text-white p-3" style={{ width: "250px" }}>
      <div className="d-flex flex-column h-100">
        <div className="mb-4">
          <h4 className="text-center">Admin Portal</h4>
        </div>
        <nav className="nav flex-column">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `nav-link text-white mb-2 ${isActive ? "active" : ""}`
            }
          >
            <FaHome className="me-2" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/employees"
            className={({ isActive }) =>
              `nav-link text-white mb-2 ${isActive ? "active" : ""}`
            }
          >
            <FaUsers className="me-2" />
            Employees
          </NavLink>
          <NavLink
            to="/admin/salaries"
            className={({ isActive }) =>
              `nav-link text-white mb-2 ${isActive ? "active" : ""}`
            }
          >
            <FaMoneyBillWave className="me-2" />
            Salaries
          </NavLink>
          <NavLink
            to="/admin/leaves"
            className={({ isActive }) =>
              `nav-link text-white mb-2 ${isActive ? "active" : ""}`
            }
          >
            <FaCalendarAlt className="me-2" />
            Leaves
          </NavLink>
          <NavLink
            to="/admin/attendance"
            className={({ isActive }) =>
              `nav-link text-white mb-2 ${isActive ? "active" : ""}`
            }
          >
            <FaUserClock className="me-2" />
            Attendance
          </NavLink>
        </nav>
        <div className="mt-auto">
          <button
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
