import React, { useState, useEffect } from "react"; // eslint-disable-line no-unused-vars
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserClock,
  FaUser,
} from "react-icons/fa";
import { api } from "../config";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState({
    name: "",
    department: "",
    position: "",
    leaves: 0,
    salary: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await api.get("/employee/profile");
      setEmployeeData(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch employee data"
        );
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
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

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Welcome, {employeeData.name}</h2>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaUser className="text-primary me-3" size={24} />
                <div>
                  <h6 className="mb-0">Department</h6>
                  <p className="mb-0">{employeeData.department}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaUserClock className="text-primary me-3" size={24} />
                <div>
                  <h6 className="mb-0">Position</h6>
                  <p className="mb-0">{employeeData.position}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-primary me-3" size={24} />
                <div>
                  <h6 className="mb-0">Leave Balance</h6>
                  <p className="mb-0">{employeeData.leaves} days</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaMoneyBillWave className="text-primary me-3" size={24} />
                <div>
                  <h6 className="mb-0">Monthly Salary</h6>
                  <p className="mb-0">${employeeData.salary.toFixed(2)}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Links</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to="/employee/leaves" className="btn btn-outline-primary">
                  Apply for Leave
                </Link>
                <Link to="/employee/salary" className="btn btn-outline-primary">
                  View Salary
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeDashboard;
