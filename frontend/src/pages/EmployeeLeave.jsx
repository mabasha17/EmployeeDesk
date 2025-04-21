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
  Spinner,
} from "react-bootstrap";
import { api } from "../config";
import { useAuth } from "../context/authContext";

const EmployeeLeave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "annual",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching employee leaves...");

      // Try both possible API endpoints
      try {
        const response = await api.get("/leaves/employee/leaves");
        console.log("Leaves response:", response.data);
        setLeaves(response.data);
      } catch (endpointError) {
        console.log("Trying alternative endpoint...");
        const altResponse = await api.get("/admin/leaves");
        console.log("Leaves from alternative endpoint:", altResponse.data);
        // Filter leaves for current user if needed
        const userLeaves = user
          ? altResponse.data.filter(
              (leave) =>
                leave.employee?._id === user._id || leave.employee === user._id
            )
          : altResponse.data;
        setLeaves(userLeaves);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(err.response?.data?.message || "Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => {
    setError(null);
    setSuccessMessage("");
    setFormData({
      startDate: "",
      endDate: "",
      reason: "",
      type: "annual",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        setError("End date cannot be before start date");
        setSubmitLoading(false);
        return;
      }

      console.log("Submitting leave request:", formData);

      // Try multiple possible API endpoints in sequence
      let leaveSubmitted = false;

      try {
        // Try direct leaves endpoint first (most reliable)
        const response = await api.post("/leaves", formData);
        console.log("Leave request submitted successfully:", response.data);
        leaveSubmitted = true;
      } catch (error1) {
        console.log("First endpoint failed, trying second endpoint...", error1);

        try {
          // Try employee leaves endpoint
          const response = await api.post("/leaves/employee/leaves", formData);
          console.log(
            "Leave request submitted via second endpoint:",
            response.data
          );
          leaveSubmitted = true;
        } catch (error2) {
          console.log(
            "Second endpoint failed, trying third endpoint...",
            error2
          );

          try {
            // Try admin leaves endpoint as last resort
            const response = await api.post("/admin/leaves", formData);
            console.log(
              "Leave request submitted via third endpoint:",
              response.data
            );
            leaveSubmitted = true;
          } catch (error3) {
            console.log("Third endpoint failed", error3);
            // All endpoints failed, throw the last error to be caught by the outer catch
            throw error3;
          }
        }
      }

      if (leaveSubmitted) {
        setSuccessMessage("Leave request submitted successfully!");
        setTimeout(() => {
          handleCloseModal();
          fetchLeaves();
        }, 1500);
      }
    } catch (err) {
      console.error("Error submitting leave request:", err);
      let errorMessage = "Failed to submit leave request. Please try again.";

      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      }

      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="ms-2">Loading leave requests...</p>
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

          {leaves && leaves.length > 0 ? (
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
          ) : (
            <Alert variant="info">You have no leave requests yet.</Alert>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Request Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                disabled={submitLoading}
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
                disabled={submitLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                disabled={submitLoading}
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="vacation">Vacation</option>
                <option value="other">Other</option>
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
                disabled={submitLoading}
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployeeLeave;
