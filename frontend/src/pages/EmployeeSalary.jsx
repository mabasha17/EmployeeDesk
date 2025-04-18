import React, { useEffect, useState } from "react"; // eslint-disable-line no-unused-vars
import { Container, Card, Table, Alert } from "react-bootstrap";
import { api } from "../config";
import { useNavigate } from "react-router-dom";

const EmployeeSalary = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await api.get("/employee/salary");
      setSalaries(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch salary records"
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

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">My Salary Records</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table responsive hover>
            <thead>
              <tr>
                <th>Month</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary) => (
                <tr key={salary._id}>
                  <td>
                    {new Date(salary.month).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </td>
                  <td>${salary.basicSalary.toFixed(2)}</td>
                  <td>${salary.allowances.toFixed(2)}</td>
                  <td>${salary.deductions.toFixed(2)}</td>
                  <td>
                    $
                    {(
                      salary.basicSalary +
                      salary.allowances -
                      salary.deductions
                    ).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        salary.status === "paid" ? "success" : "warning"
                      }`}
                    >
                      {salary.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeSalary;
