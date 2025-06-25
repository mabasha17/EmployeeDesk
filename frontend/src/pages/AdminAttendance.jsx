import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { FaCalendarAlt, FaSearch, FaTrash } from "react-icons/fa";
import { api } from "../config";
import { useAuth } from "../context/authContext";

const AdminAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user) {
        setLoading(false);
        setError("You must be logged in to view attendance.");
        return;
      }
      try {
        const response = await api.get("/attendance/all");
        if (response.data.success) {
          setAttendanceRecords(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch attendance"
          );
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/attendance/${id}`);
        setAttendanceRecords(
          attendanceRecords.filter((record) => record._id !== id)
        );
      } catch (err) {
        setError("Failed to delete attendance record.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "danger";
      case "late":
        return "warning";
      case "half-day":
        return "info";
      default:
        return "secondary";
    }
  };

  const filteredRecords = attendanceRecords.filter(
    (record) =>
      record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(record.date).toLocaleDateString().includes(searchTerm)
  );

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <FaCalendarAlt size={32} className="text-primary" />
        </Col>
        <Col>
          <h2 className="mb-0">Attendance Records</h2>
          <p className="mb-0 text-muted">
            View and manage all employee attendance records.
          </p>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={5}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading Attendance...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Employee Name</th>
                    <th>Date</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record._id}>
                        <td className="fw-bold">{record.employeeName}</td>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>
                          {record.checkIn?.time
                            ? new Date(record.checkIn.time).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td>
                          {record.checkOut?.time
                            ? new Date(
                                record.checkOut.time
                              ).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td>
                          <Badge
                            pill
                            bg={getStatusBadge(record.status)}
                            className="fw-normal"
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(record._id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminAttendance;
