import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { api } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        const response = await api.get("/admin/employee/profile");
        setEmployee(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(
          error.response?.data?.error || "Failed to fetch employee profile"
        );
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!employee)
    return <Alert variant="warning">Employee profile not found</Alert>;

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">My Profile</h2>
            <div>
              <Button
                variant="outline-warning"
                size="sm"
                className="me-2"
                onClick={() => navigate(`/employee/edit-profile`)}
              >
                <i className="bi bi-pencil me-2"></i>Edit Profile
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate("/employee/dashboard")}
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
              </Button>
            </div>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <i
                      className="bi bi-person-circle"
                      style={{ fontSize: "5rem" }}
                    ></i>
                  </div>
                  <h4>{employee.name}</h4>
                  <p className="text-muted">{employee.position}</p>
                  <Badge
                    bg={employee.status === "active" ? "success" : "danger"}
                  >
                    {employee.status}
                  </Badge>
                  <p className="mt-2 text-muted">ID: {employee.employeeId}</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-4">Personal Information</h5>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted">Email Address</label>
                        <p className="mb-0">{employee.email}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted">Phone Number</label>
                        <p className="mb-0">{employee.phone}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted">Department</label>
                        <p className="mb-0">{employee.department}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted">Joining Date</label>
                        <p className="mb-0">
                          {new Date(employee.joiningDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted">Salary</label>
                        <p className="mb-0">
                          ${employee.salary.toLocaleString()}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EmployeeProfile;
