import React, { useState, useEffect } from "react"; // eslint-disable-line no-unused-vars
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { FaUsers, FaChartBar, FaUserClock, FaUserCheck } from "react-icons/fa";
import { api } from "../config";
import { useAuth } from "../context/AuthContext";
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
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        console.log("Starting to fetch dashboard data...");
        console.log("Token:", token ? "Present" : "Missing");

        if (!token) {
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

        // Fetch employees data
        console.log("Fetching employees from /employees...");
        const employeesResponse = await api.get("/employees");
        console.log("Employees response:", employeesResponse.data);

        if (!employeesResponse.data) {
          throw new Error("No employee data received from server");
        }

        const employees = Array.isArray(employeesResponse.data)
          ? employeesResponse.data
          : [];

        // Fetch leaves data
        console.log("Fetching leaves from /leaves/recent...");
        const leavesResponse = await api.get("/leaves/recent");
        console.log("Leaves response:", leavesResponse.data);

        if (!leavesResponse.data) {
          throw new Error("No leave data received from server");
        }

        const leaves = Array.isArray(leavesResponse.data)
          ? leavesResponse.data
          : [];

        // Calculate stats
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(
          (emp) => emp.status === "active"
        ).length;
        const pendingLeaves = leaves.filter(
          (leave) => leave.status === "pending"
        ).length;

        console.log("Calculated stats:", {
          totalEmployees,
          activeEmployees,
          pendingLeaves,
          totalDepartments: new Set(employees.map((emp) => emp.department))
            .size,
        });

        setStats({
          totalEmployees,
          activeEmployees,
          pendingLeaves,
          totalDepartments: new Set(employees.map((emp) => emp.department))
            .size,
        });

        // Get recent employees (last 5)
        const recentEmps = employees.slice(-5).reverse();
        console.log("Recent employees:", recentEmps);
        setRecentEmployees(recentEmps);

        // Get recent leaves (last 5)
        const recentLevs = leaves.slice(-5).reverse();
        console.log("Recent leaves:", recentLevs);
        setRecentLeaves(recentLevs);

        setError(null);
      } catch (err) {
        console.error("Detailed error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          stack: err.stack,
        });
        setError(
          err.message ||
            "Failed to load dashboard data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, isAuthenticated, isAdmin, navigate]);

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          <p className="mb-0">Please check your connection and try again.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-0">Total Employees</h6>
                  <h3 className="mb-0">{stats.totalEmployees}</h3>
                </div>
                <FaUsers className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-0">Active Employees</h6>
                  <h3 className="mb-0">{stats.activeEmployees}</h3>
                </div>
                <FaUserCheck className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-0">Pending Leaves</h6>
                  <h3 className="mb-0">{stats.pendingLeaves}</h3>
                </div>
                <FaUserClock className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-0">Departments</h6>
                  <h3 className="mb-0">{stats.totalDepartments}</h3>
                </div>
                <FaChartBar className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Employees */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Employees</h5>
            </Card.Header>
            <Card.Body>
              {recentEmployees.length > 0 ? (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmployees.map((employee) => (
                      <tr key={employee._id}>
                        <td>{employee.name}</td>
                        <td>{employee.department}</td>
                        <td>
                          <Badge
                            bg={
                              employee.status === "active"
                                ? "success"
                                : "warning"
                            }
                          >
                            {employee.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No recent employees</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Leaves */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Leave Requests</h5>
            </Card.Header>
            <Card.Body>
              {recentLeaves.length > 0 ? (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.employeeName}</td>
                        <td>{leave.type}</td>
                        <td>
                          <Badge
                            bg={
                              leave.status === "approved"
                                ? "success"
                                : leave.status === "pending"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No recent leave requests</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
