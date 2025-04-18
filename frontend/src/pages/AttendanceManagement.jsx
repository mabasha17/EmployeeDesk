import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function AttendanceManagement() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchAttendance = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendance(response.data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to fetch attendance records"
      );
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/attendance/${attendanceId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAttendance();
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to update attendance status"
      );
    }
  };

  const handleCheckIn = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/attendance/check-in",
        { employeeId, date: selectedDate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAttendance();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to check in");
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/attendance/${attendanceId}/check-out`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAttendance();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to check out");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      present: "success",
      absent: "danger",
      late: "warning",
      "half-day": "info",
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const filteredAttendance =
    selectedStatus === "all"
      ? attendance
      : attendance.filter((record) => record.status === selectedStatus);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Attendance Management</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Select Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Table hover responsive>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.employeeId}</td>
                  <td>{record.employeeName}</td>
                  <td>
                    {record.checkIn ? (
                      new Date(record.checkIn).toLocaleTimeString()
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleCheckIn(record.employeeId)}
                      >
                        Check In
                      </Button>
                    )}
                  </td>
                  <td>
                    {record.checkOut
                      ? new Date(record.checkOut).toLocaleTimeString()
                      : record.checkIn && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleCheckOut(record._id)}
                          >
                            Check Out
                          </Button>
                        )}
                  </td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(record._id, "present")
                        }
                      >
                        Present
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(record._id, "absent")}
                      >
                        Absent
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AttendanceManagement;
