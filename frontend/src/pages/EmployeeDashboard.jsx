import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import {
  FaUser,
  FaUserClock,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import { api } from "../config";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await api.get("/admin/employee/dashboard");
        console.log("Employee dashboard data:", response.data);

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch data");
        }

        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Error fetching employee data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            err.response?.data?.message || "Failed to fetch employee data"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, [navigate]);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Could not load dashboard data.</Alert>
      </Container>
    );
  }

  const { employee, recentLeaves, recentSalary } = dashboardData;

  const latestSalary = recentSalary?.[0];

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Welcome, {employee.name}</h2>
      <Row>
        <Col md={3}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaUser className="text-primary me-3" size={32} />
                <div>
                  <h6 className="mb-0 text-muted">Department</h6>
                  <p className="mb-0 fs-5 fw-bold">{employee.department}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaUserClock className="text-success me-3" size={32} />
                <div>
                  <h6 className="mb-0 text-muted">Position</h6>
                  <p className="mb-0 fs-5 fw-bold">
                    {employee.position || "N/A"}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-warning me-3" size={32} />
                <div>
                  <h6 className="mb-0 text-muted">Recent Leaves</h6>
                  <p className="mb-0 fs-5 fw-bold">{recentLeaves.length}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaMoneyBillWave className="text-info me-3" size={32} />
                <div>
                  <h6 className="mb-0 text-muted">Latest Salary</h6>
                  <p className="mb-0 fs-5 fw-bold">
                    {latestSalary
                      ? `$${latestSalary.netSalary.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeDashboard;
