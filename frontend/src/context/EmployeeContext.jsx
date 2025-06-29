import React, { createContext, useState, useContext } from "react"; // eslint-disable-line no-unused-vars
import axios from "axios";
import PropTypes from "prop-types";
import { API_URL, getAuthHeader } from "../config";

const EmployeeContext = createContext();

export const useEmployee = () => useContext(EmployeeContext);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/employees`, {
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        setEmployees(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch employees");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/admin/employees`,
        employeeData,
        {
          headers: getAuthHeader(),
        }
      );

      if (response.data.success) {
        setEmployees((prevEmployees) => [...prevEmployees, response.data.data]);
        setError(null);
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to add employee");
      }
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(err.response?.data?.message || "Failed to add employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/admin/employees/${id}`,
        employeeData,
        {
          headers: getAuthHeader(),
        }
      );

      if (response.data.success) {
        setEmployees(
          employees.map((emp) => (emp._id === id ? response.data.data : emp))
        );
        setError(null);
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to update employee");
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.response?.data?.message || "Failed to update employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/admin/employees/${id}`, {
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        setEmployees(employees.filter((emp) => emp._id !== id));
        setError(null);
      } else {
        throw new Error(response.data.message || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.response?.data?.message || "Failed to delete employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

EmployeeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
