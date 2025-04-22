import React, { useState, useEffect } from "react"; // eslint-disable-line no-unused-vars
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaChartBar,
  FaUserClock,
  FaUserCheck,
  FaTasks,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserTie,
} from "react-icons/fa";
import { api } from "../config";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    totalDepartments: 0,
  });
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        console.log("Starting to fetch dashboard data...");
        const currentToken = localStorage.getItem("token");
        console.log("Token:", currentToken ? "Present" : "Missing");

        if (!currentToken) {
          throw new Error("No authentication token found. Please login again.");
        }

        // Test API connection first
        try {
          const testResponse = await api.get("/auth/profile");
          console.log("API connection test successful:", testResponse.data);
        } catch (testError) {
          console.error("API connection test failed:", testError);
          throw new Error(
            "Cannot connect to the server. Please make sure the server is running."
          );
        }

        // Create a mock stats object for testing
        let tempStats = {
          totalEmployees: 0,
          activeEmployees: 0,
          pendingLeaves: 0,
          totalDepartments: 0,
        };

        // Fetch admin dashboard data
        try {
          console.log("Fetching admin dashboard data...");
          const statsResponse = await api.get("/admin/stats");
          console.log("Stats response:", statsResponse.data);

          if (statsResponse.data && statsResponse.data.data) {
            tempStats = statsResponse.data.data;
          } else {
            console.warn(
              "Stats data format is not as expected:",
              statsResponse.data
            );
          }
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
          setErrorDetails((prev) => ({ ...prev, stats: statsError.message }));
        }

        // Set stats regardless, using what we have
        setStats(tempStats);

        // If we have all our data, clear any existing error
        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err);
        console.error("Detailed error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          stack: err.stack,
        });

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard data. Please try again later."
        );

        // Still set default empty data
        setStats({
          totalEmployees: 0,
          activeEmployees: 0,
          pendingLeaves: 0,
          totalDepartments: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, isAuthenticated, isAdmin, navigate]);

  if (loading) {
    return (
      <Container fluid className="dashboard-loading">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh" }}
        >
          <div className="text-center">
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <h4 className="mt-3">Loading Dashboard...</h4>
          </div>
        </div>
      </Container>
    );
  }

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <Container fluid className="dashboard-container py-4 px-4">
      {error && (
        <Alert variant="danger" className="mb-4 shadow-sm">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          {Object.keys(errorDetails).length > 0 && (
            <div>
              <p>Error Details:</p>
              <ul>
                {errorDetails.stats && <li>Stats: {errorDetails.stats}</li>}
              </ul>
            </div>
          )}
          <p className="mb-0">
            Showing available data. Some information may be missing.
          </p>
        </Alert>
      )}

      <div className="dashboard-header mb-4">
        <div className="bg-primary text-white p-4 rounded shadow">
          <h2 className="mb-2">Welcome to Admin Dashboard</h2>
          <p className="mb-0">
            Here&apos;s an overview of your employee management system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
          <Card className="stat-card h-100 shadow-sm border-0 hover-effect">
            <Card.Body className="d-flex flex-column align-items-center p-4">
              <div className="icon-container bg-primary-light rounded-circle mb-3">
                <FaUsers className="stat-icon text-primary" />
              </div>
              <h3 className="stat-value">{stats.totalEmployees}</h3>
              <p className="stat-label text-muted mb-0">Total Employees</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card h-100 shadow-sm border-0 hover-effect">
            <Card.Body className="d-flex flex-column align-items-center p-4">
              <div className="icon-container bg-success-light rounded-circle mb-3">
                <FaUserCheck className="stat-icon text-success" />
              </div>
              <h3 className="stat-value">{stats.activeEmployees}</h3>
              <p className="stat-label text-muted mb-0">Active Employees</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card h-100 shadow-sm border-0 hover-effect">
            <Card.Body className="d-flex flex-column align-items-center p-4">
              <div className="icon-container bg-warning-light rounded-circle mb-3">
                <FaUserClock className="stat-icon text-warning" />
              </div>
              <h3 className="stat-value">{stats.pendingLeaves}</h3>
              <p className="stat-label text-muted mb-0">Pending Leaves</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card h-100 shadow-sm border-0 hover-effect">
            <Card.Body className="d-flex flex-column align-items-center p-4">
              <div className="icon-container bg-info-light rounded-circle mb-3">
                <FaChartBar className="stat-icon text-info" />
              </div>
              <h3 className="stat-value">{stats.totalDepartments}</h3>
              <p className="stat-label text-muted mb-0">Departments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Action Cards */}
      <h4 className="section-title mb-3">Quick Access</h4>
      <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
          <Card
            className="action-card border-0 shadow-sm hover-effect"
            onClick={() => navigateTo("/admin/employees")}
          >
            <Card.Body className="d-flex align-items-center p-4">
              <div className="icon-container-sm bg-primary-light rounded-circle me-3">
                <FaUserTie className="text-primary" />
              </div>
              <div>
                <h5 className="mb-1">Employees</h5>
                <p className="text-muted mb-0">Manage all employees</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card
            className="action-card border-0 shadow-sm hover-effect"
            onClick={() => navigateTo("/admin/attendance")}
          >
            <Card.Body className="d-flex align-items-center p-4">
              <div className="icon-container-sm bg-success-light rounded-circle me-3">
                <FaTasks className="text-success" />
              </div>
              <div>
                <h5 className="mb-1">Attendance</h5>
                <p className="text-muted mb-0">Track daily records</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card
            className="action-card border-0 shadow-sm hover-effect"
            onClick={() => navigateTo("/admin/leaves")}
          >
            <Card.Body className="d-flex align-items-center p-4">
              <div className="icon-container-sm bg-warning-light rounded-circle me-3">
                <FaCalendarAlt className="text-warning" />
              </div>
              <div>
                <h5 className="mb-1">Leaves</h5>
                <p className="text-muted mb-0">Manage requests</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card
            className="action-card border-0 shadow-sm hover-effect"
            onClick={() => navigateTo("/admin/salaries")}
          >
            <Card.Body className="d-flex align-items-center p-4">
              <div className="icon-container-sm bg-info-light rounded-circle me-3">
                <FaMoneyBillWave className="text-info" />
              </div>
              <div>
                <h5 className="mb-1">Salaries</h5>
                <p className="text-muted mb-0">Process payments</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
