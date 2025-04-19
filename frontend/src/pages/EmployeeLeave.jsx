import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
} from "react-bootstrap";
import { api } from "../config";
import { useAuth } from "../context/AuthContext";

const EmployeeLeave = () => {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "annual",
  });

  useEffect(() => {
    fetchLeaves();
  }, [token]);

  const fetchLeaves = async () => {
    try {
      console.log("Fetching employee leaves...");
      const response = await api.get("/leaves/employee/leaves");
      console.log("Leaves response:", response.data);
      setLeaves(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(err.response?.data?.message || "Failed to fetch leave requests");
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting leave request:", formData);
      await api.post("/leaves/employee/leaves", formData);
      handleCloseModal();
      fetchLeaves();
    } catch (err) {
      console.error("Error submitting leave request:", err);
      setError(err.response?.data?.message || "Failed to submit leave request");
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

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Leave Requests</h4>
          <Button variant="primary" onClick={handleShowModal}>
            Request Leave
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table responsive hover>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.type}</td>
                  <td>{leave.reason}</td>
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
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Request Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Submit Request
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployeeLeave;
