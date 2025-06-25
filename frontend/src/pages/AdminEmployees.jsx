import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Form,
  Modal,
  Alert,
  Spinner,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { useEmployee } from "../context/EmployeeContext";
import { FaUserPlus, FaUsers, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import EmployeeForm from "../components/EmployeeForm";

const AdminEmployees = () => {
  const { employees, fetchEmployees } = useEmployee();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const initialFormData = {
    name: "",
    email: "",
    password: "",
    department: "",
    salary: "",
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormData);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filter || employee.department === filter;
    return matchesSearch && matchesFilter;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setError("");
    setFormData(initialFormData);
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch("/api/admin/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add employee");
      }

      toast.success("Employee added successfully!");
      handleModalClose();
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        `/api/admin/employees/${selectedEmployee._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            salary: parseFloat(formData.salary) || 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee");
      }

      toast.success("Employee updated successfully!");
      handleModalClose();
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        `/api/admin/employees/${selectedEmployee._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      toast.success("Employee deleted successfully!");
      setShowDeleteModal(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.message);
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      ...initialFormData,
      ...employee,
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split("T")[0]
        : "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const departmentOptions = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Customer Support",
    "Engineering",
    "Product Management",
    "Design",
  ];

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <FaUsers size={32} className="text-primary" />
        </Col>
        <Col>
          <h2 className="mb-0">Employee Management</h2>
          <p className="mb-0 text-muted">
            Add, edit, and manage all employees in the system.
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleAddClick}
            className="d-flex align-items-center"
          >
            <FaUserPlus className="me-2" />
            Add Employee
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-3">
            <Col md={5}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading Employees...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee._id}>
                        <td>
                          <Badge pill bg="primary" className="fw-normal">
                            {employee.employeeId || "N/A"}
                          </Badge>
                        </td>
                        <td className="fw-bold">{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department}</td>
                        <td>
                          {employee.salary
                            ? `$${employee.salary.toLocaleString()}`
                            : "N/A"}
                        </td>
                        <td>
                          <Badge
                            pill
                            bg={
                              employee.status === "active"
                                ? "success"
                                : employee.status === "inactive"
                                ? "warning"
                                : "danger"
                            }
                            className="fw-normal"
                          >
                            {employee.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleView(employee)}
                          >
                            Show
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEdit(employee)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(employee)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Employee Modal */}
      <Modal show={showAddModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUserPlus className="me-2" /> Add New Employee
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <EmployeeForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleAddSubmit}
            handleClose={handleModalClose}
            loading={loading}
          />
        </Modal.Body>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal show={showEditModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <EmployeeForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleEditSubmit}
            isEdit={true}
            handleClose={handleModalClose}
            loading={loading}
          />
        </Modal.Body>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedEmployee && (
            <Row>
              <Col md={6}>
                <p>
                  <strong>Name:</strong> {selectedEmployee.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedEmployee.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedEmployee.phone || "N/A"}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Department:</strong> {selectedEmployee.department}
                </p>
                <p>
                  <strong>Salary:</strong> $
                  {selectedEmployee.salary?.toLocaleString() || "N/A"}
                </p>
                <p>
                  <strong>Joining Date:</strong>{" "}
                  {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                </p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Employee Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{selectedEmployee?.name}</strong>? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Employee
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminEmployees;
