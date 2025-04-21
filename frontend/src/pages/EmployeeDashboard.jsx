import React, { useState, useEffect } from "react"; // eslint-disable-line no-unused-vars
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
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
      const response = await api.get("/employees/profile");
      console.log("Employee profile data:", response.data);

      // Make sure we have valid data or set defaults
      const employeeData = {
        name: response.data.name || "Employee",
        department: response.data.department || "Not assigned",
        position: response.data.position || "Not assigned",
        leaves: response.data.leaves || 0,
        salary: response.data.salary || 0,
      };

      setEmployeeData(employeeData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employee data:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to fetch employee data");
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
    </Container>
  );
};

export default EmployeeDashboard;
