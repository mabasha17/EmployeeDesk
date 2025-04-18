import { useState } from "react";
import {
  Container,
  Button,
  Card,
  Spinner,
  Modal,
  Form,
  Table,
  Alert,
} from "react-bootstrap";
import { useEmployee } from "../context/EmployeeContext";
import { FaUserPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";

const AdminEmployees = () => {
  const {
    employees,
    loading,
    error: contextError,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
  } = useEmployee();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    position: "",
    salary: "",
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
  });

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addEmployee(formData);
      if (response.success) {
        setSuccessMessage("Employee added successfully!");
        // Don't reset form data
        setShowAddModal(false);
        // Refresh the employees list
        await fetchEmployees();
        // Show success message for 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEmployee(selectedEmployee._id, formData);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee(selectedEmployee._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      joiningDate: employee.joiningDate,
      phone: employee.phone,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  // Add handler for modal close
  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSuccessMessage("");
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Employee Management</h2>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center"
            >
              <FaUserPlus className="me-2" />
              Add Employee
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="row mb-4">
            <div className="col-md-6">
              <Form.Control
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-lg"
              />
            </div>
            <div className="col-md-6">
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-control-lg"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Research & Development">
                  Research & Development
                </option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Legal">Legal</option>
                <option value="Administration">Administration</option>
                <option value="Product Management">Product Management</option>
                <option value="Design">Design</option>
                <option value="Business Development">
                  Business Development
                </option>
              </Form.Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading employees...</p>
            </div>
          ) : contextError ? (
            <div className="alert alert-danger" role="alert">
              {contextError}
            </div>
          ) : (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleView(employee)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(employee)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(employee)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Employee Modal */}
      <Modal show={showAddModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="h4">Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}
          <Form onSubmit={handleAddSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter email address"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter password"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Research & Development">
                      Research & Development
                    </option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Information Technology">
                      Information Technology
                    </option>
                    <option value="Legal">Legal</option>
                    <option value="Administration">Administration</option>
                    <option value="Product Management">
                      Product Management
                    </option>
                    <option value="Design">Design</option>
                    <option value="Business Development">
                      Business Development
                    </option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Position</Form.Label>
                  <Form.Select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  >
                    <option value="">Select Position</option>
                    {formData.department === "Engineering" && (
                      <>
                        <option value="Software Engineer">
                          Software Engineer
                        </option>
                        <option value="Senior Software Engineer">
                          Senior Software Engineer
                        </option>
                        <option value="Lead Engineer">Lead Engineer</option>
                        <option value="Technical Architect">
                          Technical Architect
                        </option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Frontend Developer">
                          Frontend Developer
                        </option>
                        <option value="Backend Developer">
                          Backend Developer
                        </option>
                        <option value="Full Stack Developer">
                          Full Stack Developer
                        </option>
                        <option value="Mobile Developer">
                          Mobile Developer
                        </option>
                      </>
                    )}
                    {formData.department === "Marketing" && (
                      <>
                        <option value="Marketing Coordinator">
                          Marketing Coordinator
                        </option>
                        <option value="Marketing Manager">
                          Marketing Manager
                        </option>
                        <option value="Digital Marketing Specialist">
                          Digital Marketing Specialist
                        </option>
                        <option value="Content Marketing Manager">
                          Content Marketing Manager
                        </option>
                        <option value="Social Media Manager">
                          Social Media Manager
                        </option>
                        <option value="Brand Manager">Brand Manager</option>
                        <option value="Marketing Analyst">
                          Marketing Analyst
                        </option>
                        <option value="SEO Specialist">SEO Specialist</option>
                      </>
                    )}
                    {formData.department === "Sales" && (
                      <>
                        <option value="Sales Representative">
                          Sales Representative
                        </option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Account Executive">
                          Account Executive
                        </option>
                        <option value="Business Development Manager">
                          Business Development Manager
                        </option>
                        <option value="Sales Director">Sales Director</option>
                        <option value="Sales Operations Manager">
                          Sales Operations Manager
                        </option>
                        <option value="Sales Analyst">Sales Analyst</option>
                      </>
                    )}
                    {formData.department === "Human Resources" && (
                      <>
                        <option value="HR Coordinator">HR Coordinator</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Recruiter">Recruiter</option>
                        <option value="Training Specialist">
                          Training Specialist
                        </option>
                        <option value="Compensation Analyst">
                          Compensation Analyst
                        </option>
                        <option value="HR Business Partner">
                          HR Business Partner
                        </option>
                        <option value="Talent Acquisition Specialist">
                          Talent Acquisition Specialist
                        </option>
                      </>
                    )}
                    {formData.department === "Finance" && (
                      <>
                        <option value="Financial Analyst">
                          Financial Analyst
                        </option>
                        <option value="Accountant">Accountant</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Controller">Controller</option>
                        <option value="CFO">Chief Financial Officer</option>
                        <option value="Financial Planner">
                          Financial Planner
                        </option>
                        <option value="Auditor">Auditor</option>
                      </>
                    )}
                    {formData.department === "Operations" && (
                      <>
                        <option value="Operations Manager">
                          Operations Manager
                        </option>
                        <option value="Supply Chain Manager">
                          Supply Chain Manager
                        </option>
                        <option value="Logistics Coordinator">
                          Logistics Coordinator
                        </option>
                        <option value="Production Manager">
                          Production Manager
                        </option>
                        <option value="Quality Control Manager">
                          Quality Control Manager
                        </option>
                        <option value="Process Improvement Specialist">
                          Process Improvement Specialist
                        </option>
                      </>
                    )}
                    {formData.department === "Customer Support" && (
                      <>
                        <option value="Customer Service Representative">
                          Customer Service Representative
                        </option>
                        <option value="Support Team Lead">
                          Support Team Lead
                        </option>
                        <option value="Customer Success Manager">
                          Customer Success Manager
                        </option>
                        <option value="Technical Support Specialist">
                          Technical Support Specialist
                        </option>
                        <option value="Help Desk Analyst">
                          Help Desk Analyst
                        </option>
                      </>
                    )}
                    {formData.department === "Research & Development" && (
                      <>
                        <option value="Research Scientist">
                          Research Scientist
                        </option>
                        <option value="R&D Engineer">R&D Engineer</option>
                        <option value="Product Development Manager">
                          Product Development Manager
                        </option>
                        <option value="Innovation Specialist">
                          Innovation Specialist
                        </option>
                        <option value="Research Analyst">
                          Research Analyst
                        </option>
                      </>
                    )}
                    {formData.department === "Quality Assurance" && (
                      <>
                        <option value="QA Analyst">QA Analyst</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="QA Manager">QA Manager</option>
                        <option value="Test Automation Engineer">
                          Test Automation Engineer
                        </option>
                        <option value="Quality Control Specialist">
                          Quality Control Specialist
                        </option>
                      </>
                    )}
                    {formData.department === "Information Technology" && (
                      <>
                        <option value="IT Support Specialist">
                          IT Support Specialist
                        </option>
                        <option value="System Administrator">
                          System Administrator
                        </option>
                        <option value="Network Engineer">
                          Network Engineer
                        </option>
                        <option value="IT Manager">IT Manager</option>
                        <option value="CIO">Chief Information Officer</option>
                        <option value="Database Administrator">
                          Database Administrator
                        </option>
                        <option value="Security Analyst">
                          Security Analyst
                        </option>
                      </>
                    )}
                    {formData.department === "Legal" && (
                      <>
                        <option value="Legal Assistant">Legal Assistant</option>
                        <option value="Paralegal">Paralegal</option>
                        <option value="Corporate Counsel">
                          Corporate Counsel
                        </option>
                        <option value="Legal Manager">Legal Manager</option>
                        <option value="General Counsel">General Counsel</option>
                      </>
                    )}
                    {formData.department === "Administration" && (
                      <>
                        <option value="Administrative Assistant">
                          Administrative Assistant
                        </option>
                        <option value="Office Manager">Office Manager</option>
                        <option value="Executive Assistant">
                          Executive Assistant
                        </option>
                        <option value="Administrative Coordinator">
                          Administrative Coordinator
                        </option>
                      </>
                    )}
                    {formData.department === "Product Management" && (
                      <>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Product Owner">Product Owner</option>
                        <option value="Product Marketing Manager">
                          Product Marketing Manager
                        </option>
                        <option value="Product Analyst">Product Analyst</option>
                      </>
                    )}
                    {formData.department === "Design" && (
                      <>
                        <option value="Graphic Designer">
                          Graphic Designer
                        </option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Creative Director">
                          Creative Director
                        </option>
                        <option value="Web Designer">Web Designer</option>
                        <option value="Product Designer">
                          Product Designer
                        </option>
                      </>
                    )}
                    {formData.department === "Business Development" && (
                      <>
                        <option value="Business Development Manager">
                          Business Development Manager
                        </option>
                        <option value="Business Development Representative">
                          Business Development Representative
                        </option>
                        <option value="Partnership Manager">
                          Partnership Manager
                        </option>
                        <option value="Market Development Manager">
                          Market Development Manager
                        </option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Salary</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                      className="form-control-lg"
                      placeholder="Enter salary"
                      min="0"
                      step="1000"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Joining Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={handleModalClose}
                className="me-2 px-4 py-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="px-4 py-2">
                Add Employee
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="h4">Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleEditSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter email address"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Research & Development">
                      Research & Development
                    </option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Information Technology">
                      Information Technology
                    </option>
                    <option value="Legal">Legal</option>
                    <option value="Administration">Administration</option>
                    <option value="Product Management">
                      Product Management
                    </option>
                    <option value="Design">Design</option>
                    <option value="Business Development">
                      Business Development
                    </option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Position</Form.Label>
                  <Form.Select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  >
                    <option value="">Select Position</option>
                    {formData.department === "Engineering" && (
                      <>
                        <option value="Software Engineer">
                          Software Engineer
                        </option>
                        <option value="Senior Software Engineer">
                          Senior Software Engineer
                        </option>
                        <option value="Lead Engineer">Lead Engineer</option>
                        <option value="Technical Architect">
                          Technical Architect
                        </option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Frontend Developer">
                          Frontend Developer
                        </option>
                        <option value="Backend Developer">
                          Backend Developer
                        </option>
                        <option value="Full Stack Developer">
                          Full Stack Developer
                        </option>
                        <option value="Mobile Developer">
                          Mobile Developer
                        </option>
                      </>
                    )}
                    {formData.department === "Marketing" && (
                      <>
                        <option value="Marketing Coordinator">
                          Marketing Coordinator
                        </option>
                        <option value="Marketing Manager">
                          Marketing Manager
                        </option>
                        <option value="Digital Marketing Specialist">
                          Digital Marketing Specialist
                        </option>
                        <option value="Content Marketing Manager">
                          Content Marketing Manager
                        </option>
                        <option value="Social Media Manager">
                          Social Media Manager
                        </option>
                        <option value="Brand Manager">Brand Manager</option>
                        <option value="Marketing Analyst">
                          Marketing Analyst
                        </option>
                        <option value="SEO Specialist">SEO Specialist</option>
                      </>
                    )}
                    {formData.department === "Sales" && (
                      <>
                        <option value="Sales Representative">
                          Sales Representative
                        </option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Account Executive">
                          Account Executive
                        </option>
                        <option value="Business Development Manager">
                          Business Development Manager
                        </option>
                        <option value="Sales Director">Sales Director</option>
                        <option value="Sales Operations Manager">
                          Sales Operations Manager
                        </option>
                        <option value="Sales Analyst">Sales Analyst</option>
                      </>
                    )}
                    {formData.department === "Human Resources" && (
                      <>
                        <option value="HR Coordinator">HR Coordinator</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Recruiter">Recruiter</option>
                        <option value="Training Specialist">
                          Training Specialist
                        </option>
                        <option value="Compensation Analyst">
                          Compensation Analyst
                        </option>
                        <option value="HR Business Partner">
                          HR Business Partner
                        </option>
                        <option value="Talent Acquisition Specialist">
                          Talent Acquisition Specialist
                        </option>
                      </>
                    )}
                    {formData.department === "Finance" && (
                      <>
                        <option value="Financial Analyst">
                          Financial Analyst
                        </option>
                        <option value="Accountant">Accountant</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Controller">Controller</option>
                        <option value="CFO">Chief Financial Officer</option>
                        <option value="Financial Planner">
                          Financial Planner
                        </option>
                        <option value="Auditor">Auditor</option>
                      </>
                    )}
                    {formData.department === "Operations" && (
                      <>
                        <option value="Operations Manager">
                          Operations Manager
                        </option>
                        <option value="Supply Chain Manager">
                          Supply Chain Manager
                        </option>
                        <option value="Logistics Coordinator">
                          Logistics Coordinator
                        </option>
                        <option value="Production Manager">
                          Production Manager
                        </option>
                        <option value="Quality Control Manager">
                          Quality Control Manager
                        </option>
                        <option value="Process Improvement Specialist">
                          Process Improvement Specialist
                        </option>
                      </>
                    )}
                    {formData.department === "Customer Support" && (
                      <>
                        <option value="Customer Service Representative">
                          Customer Service Representative
                        </option>
                        <option value="Support Team Lead">
                          Support Team Lead
                        </option>
                        <option value="Customer Success Manager">
                          Customer Success Manager
                        </option>
                        <option value="Technical Support Specialist">
                          Technical Support Specialist
                        </option>
                        <option value="Help Desk Analyst">
                          Help Desk Analyst
                        </option>
                      </>
                    )}
                    {formData.department === "Research & Development" && (
                      <>
                        <option value="Research Scientist">
                          Research Scientist
                        </option>
                        <option value="R&D Engineer">R&D Engineer</option>
                        <option value="Product Development Manager">
                          Product Development Manager
                        </option>
                        <option value="Innovation Specialist">
                          Innovation Specialist
                        </option>
                        <option value="Research Analyst">
                          Research Analyst
                        </option>
                      </>
                    )}
                    {formData.department === "Quality Assurance" && (
                      <>
                        <option value="QA Analyst">QA Analyst</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="QA Manager">QA Manager</option>
                        <option value="Test Automation Engineer">
                          Test Automation Engineer
                        </option>
                        <option value="Quality Control Specialist">
                          Quality Control Specialist
                        </option>
                      </>
                    )}
                    {formData.department === "Information Technology" && (
                      <>
                        <option value="IT Support Specialist">
                          IT Support Specialist
                        </option>
                        <option value="System Administrator">
                          System Administrator
                        </option>
                        <option value="Network Engineer">
                          Network Engineer
                        </option>
                        <option value="IT Manager">IT Manager</option>
                        <option value="CIO">Chief Information Officer</option>
                        <option value="Database Administrator">
                          Database Administrator
                        </option>
                        <option value="Security Analyst">
                          Security Analyst
                        </option>
                      </>
                    )}
                    {formData.department === "Legal" && (
                      <>
                        <option value="Legal Assistant">Legal Assistant</option>
                        <option value="Paralegal">Paralegal</option>
                        <option value="Corporate Counsel">
                          Corporate Counsel
                        </option>
                        <option value="Legal Manager">Legal Manager</option>
                        <option value="General Counsel">General Counsel</option>
                      </>
                    )}
                    {formData.department === "Administration" && (
                      <>
                        <option value="Administrative Assistant">
                          Administrative Assistant
                        </option>
                        <option value="Office Manager">Office Manager</option>
                        <option value="Executive Assistant">
                          Executive Assistant
                        </option>
                        <option value="Administrative Coordinator">
                          Administrative Coordinator
                        </option>
                      </>
                    )}
                    {formData.department === "Product Management" && (
                      <>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Product Owner">Product Owner</option>
                        <option value="Product Marketing Manager">
                          Product Marketing Manager
                        </option>
                        <option value="Product Analyst">Product Analyst</option>
                      </>
                    )}
                    {formData.department === "Design" && (
                      <>
                        <option value="Graphic Designer">
                          Graphic Designer
                        </option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Creative Director">
                          Creative Director
                        </option>
                        <option value="Web Designer">Web Designer</option>
                        <option value="Product Designer">
                          Product Designer
                        </option>
                      </>
                    )}
                    {formData.department === "Business Development" && (
                      <>
                        <option value="Business Development Manager">
                          Business Development Manager
                        </option>
                        <option value="Business Development Representative">
                          Business Development Representative
                        </option>
                        <option value="Partnership Manager">
                          Partnership Manager
                        </option>
                        <option value="Market Development Manager">
                          Market Development Manager
                        </option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Salary</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                      className="form-control-lg"
                      placeholder="Enter salary"
                      min="0"
                      step="1000"
                    />
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-bold">Joining Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="me-2 px-4 py-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="px-4 py-2">
                Update Employee
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="h4">Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedEmployee && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="mb-3">
                  <label className="fw-bold d-block">Name</label>
                  <span className="fs-5">{selectedEmployee.name}</span>
                </div>
                <div className="mb-3">
                  <label className="fw-bold d-block">Email</label>
                  <span className="fs-5">{selectedEmployee.email}</span>
                </div>
                <div className="mb-3">
                  <label className="fw-bold d-block">Phone Number</label>
                  <span className="fs-5">
                    {selectedEmployee.phone || "Not provided"}
                  </span>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="mb-3">
                  <label className="fw-bold d-block">Department</label>
                  <span className="fs-5">{selectedEmployee.department}</span>
                </div>
                <div className="mb-3">
                  <label className="fw-bold d-block">Position</label>
                  <span className="fs-5">{selectedEmployee.position}</span>
                </div>
                <div className="mb-3">
                  <label className="fw-bold d-block">Salary</label>
                  <span className="fs-5">${selectedEmployee.salary}</span>
                </div>
                <div className="mb-3">
                  <label className="fw-bold d-block">Joining Date</label>
                  <span className="fs-5">
                    {new Date(
                      selectedEmployee.joiningDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Employee Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="h4">Delete Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="fs-5 mb-0">
            Are you sure you want to delete{" "}
            <strong>{selectedEmployee?.name}</strong>? This action cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} className="px-4 py-2">
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminEmployees;
