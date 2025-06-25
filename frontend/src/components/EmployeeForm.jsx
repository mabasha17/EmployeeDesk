import { Form, Button, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";

const EmployeeForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isEdit = false,
  handleClose,
  loading,
}) => {
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
    <Form onSubmit={handleSubmit}>
      {/* Name, Email, Password */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              disabled={isEdit}
            />
          </Form.Group>
        </Col>
      </Row>

      {!isEdit && (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required={!isEdit}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Department, Position */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Salary, Joining Date */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Salary</Form.Label>
            <Form.Control
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Enter salary"
              required
              min="0"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Joining Date</Form.Label>
            <Form.Control
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Phone */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <hr className="my-4" />

      {/* Submit Buttons */}
      <div className="d-flex justify-content-end mt-4">
        <Button
          variant="secondary"
          onClick={handleClose}
          className="me-2 px-4 py-2"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          className="px-4 py-2"
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </Form>
  );
};

EmployeeForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default EmployeeForm;
