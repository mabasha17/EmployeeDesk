import React, { useState, useEffect } from "react"; // eslint-disable-line no-unused-vars
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
} from "react-bootstrap";
import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminSalaries.css";

const AdminSalaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newSalary, setNewSalary] = useState({
    employee: "",
    amount: "",
    paymentDate: "",
    status: "pending",
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/salaries/admin/salaries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Safely handle the response data
      const responseData = response.data;
      const salariesData = Array.isArray(responseData)
        ? responseData
        : responseData.data || [];

      setSalaries(salariesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setError(error.message || "Failed to fetch salaries");
      setSalaries([]); // Ensure salaries is an empty array on error
      setLoading(false);
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.post(`${API_URL}/salaries/admin/salaries`, newSalary, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      fetchSalaries();
    } catch (error) {
      console.error("Error adding salary:", error);
      setError(error.message || "Failed to add salary");
    }
  };

  // Make sure salaries is always an array before filtering
  const filteredSalaries =
    salaries && Array.isArray(salaries)
      ? salaries.filter((salary) => {
          if (!salary || !salary.employee || !salary.employee.name)
            return false;
          const matchesSearch = salary.employee.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesStatus =
            filterStatus === "all" || salary.status === filterStatus;
          return matchesSearch && matchesStatus;
        })
      : [];

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

  return (
    <Container fluid className="py-4">
      <div className="bg-light rounded-3 p-4 mb-4 shadow-sm">
        <h2 className="display-4 text-center mb-4">Salary Management</h2>
        <p className="lead text-center text-muted">
          Manage employee salaries and payments
        </p>
      </div>

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaFilter />
                  </span>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                className="px-4"
              >
                <FaPlus className="me-2" />
                Add Salary
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.map((salary) => (
                  <tr key={salary._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="ms-3">
                          <h6 className="mb-0">{salary.employee.name}</h6>
                          <small className="text-muted">
                            {salary.employee.department}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>${salary.amount.toLocaleString()}</td>
                    <td>{new Date(salary.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <Badge
                        bg={
                          salary.status === "paid"
                            ? "success"
                            : salary.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                        className="px-3 py-2"
                      >
                        {salary.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add Salary Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Salary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSalary}>
            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select
                value={newSalary.employee}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, employee: e.target.value })
                }
                required
              >
                <option value="">Select Employee</option>
                {/* Add employee options here */}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={newSalary.amount}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, amount: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Date</Form.Label>
              <Form.Control
                type="date"
                value={newSalary.paymentDate}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, paymentDate: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newSalary.status}
                onChange={(e) =>
                  setNewSalary({ ...newSalary, status: e.target.value })
                }
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Salary
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminSalaries;
