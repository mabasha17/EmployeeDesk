import React from "react"; // eslint-disable-line no-unused-vars
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

const EmployeeSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/employee/dashboard",
      icon: <FaHome />,
    },
    {
      title: "Profile",
      path: "/employee/profile",
      icon: <FaUser />,
    },
    {
      title: "Leaves",
      path: "/employee/leaves",
      icon: <FaCalendarAlt />,
    },
    {
      title: "Salary",
      path: "/employee/salary",
      icon: <FaMoneyBillWave />,
    },
  ];

  return (
    <div
      className="sidebar bg-dark text-white"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <div className="p-3">
        <h4 className="text-center mb-4">Employee Portal</h4>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`text-white mb-2 ${
                location.pathname === item.path ? "active bg-primary" : ""
              }`}
            >
              <span className="me-2">{item.icon}</span>
              {item.title}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
