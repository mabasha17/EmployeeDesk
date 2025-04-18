import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const fetchEmployees = async () => {
  return await axios.get(`${API_URL}/employees`);
};

export const addEmployee = async (employeeData) => {
  return await axios.post(`${API_URL}/employees`, employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return await axios.put(`${API_URL}/employees/${id}`, employeeData);
};

export const deleteEmployee = async (id) => {
  return await axios.delete(`${API_URL}/employees/${id}`);
};
