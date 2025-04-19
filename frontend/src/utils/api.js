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

// Attendance API functions
export const fetchAttendance = async (token) => {
  const response = await axios.get(`${API_URL}/attendance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchEmployeeAttendance = async (token) => {
  const response = await axios.get(`${API_URL}/attendance/employee`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createAttendance = async (attendanceData, token) => {
  const response = await axios.post(`${API_URL}/attendance`, attendanceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateAttendance = async (id, attendanceData, token) => {
  const response = await axios.put(
    `${API_URL}/attendance/${id}`,
    attendanceData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteAttendance = async (id, token) => {
  const response = await axios.delete(`${API_URL}/attendance/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
