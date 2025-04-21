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
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
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
          // Continue with other requests instead of throwing
        }

        // Set stats regardless, using what we have
        setStats(tempStats);

        // Initialize arrays for data that might not be fetched successfully
        let tempRecentEmployees = [];
        let tempRecentLeaves = [];

        // Fetch recent employees
        try {
          console.log("Fetching recent employees...");
          const recentEmployeesResponse = await api.get(
            "/admin/employees/recent"
          );
          console.log(
            "Recent employees response:",
            recentEmployeesResponse.data
          );

          if (
            recentEmployeesResponse.data &&
            recentEmployeesResponse.data.data
          ) {
            tempRecentEmployees = recentEmployeesResponse.data.data;
          } else {
            console.warn(
              "Employee data format is not as expected:",
              recentEmployeesResponse.data
            );
          }
        } catch (employeesError) {
          console.error("Error fetching employees:", employeesError);
          setErrorDetails((prev) => ({
            ...prev,
            employees: employeesError.message,
          }));
          // Continue with other requests
        }

        // Fetch recent leaves
        try {
          console.log("Fetching recent leaves...");
          const recentLeavesResponse = await api.get("/admin/leaves/recent");
          console.log("Recent leaves response:", recentLeavesResponse.data);

          if (recentLeavesResponse.data && recentLeavesResponse.data.data) {
            tempRecentLeaves = recentLeavesResponse.data.data;
          } else {
            console.warn(
              "Leaves data format is not as expected:",
              recentLeavesResponse.data
            );
          }
        } catch (leavesError) {
          console.error("Error fetching leaves:", leavesError);
          setErrorDetails((prev) => ({ ...prev, leaves: leavesError.message }));
          // Continue with rendering what we have
        }

        // Set the data we've collected
        setRecentEmployees(tempRecentEmployees);
        setRecentLeaves(tempRecentLeaves);

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
        setRecentEmployees([]);
        setRecentLeaves([]);
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

  return (
    <Container className="mt-4">
      {error && (
        <Alert variant="danger" className="mb-4">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          {Object.keys(errorDetails).length > 0 && (
            <div>
              <p>Error Details:</p>
              <ul>
                {errorDetails.stats && <li>Stats: {errorDetails.stats}</li>}
                {errorDetails.employees && (
                  <li>Employees: {errorDetails.employees}</li>
                )}
                {errorDetails.leaves && <li>Leaves: {errorDetails.leaves}</li>}
              </ul>
            </div>
          )}
          <p className="mb-0">
            Showing available data. Some information may be missing.
          </p>
        </Alert>
      )}

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
