import { api } from "../config";

// Employee API functions
export const fetchEmployees = async () => {
  return await api.get("/admin/employees");
};

export const addEmployee = async (employeeData) => {
  return await api.post("/admin/employees", employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return await api.put(`/admin/employees/${id}`, employeeData);
};

export const deleteEmployee = async (id) => {
  return await api.delete(`/admin/employees/${id}`);
};

// Attendance API functions
export const fetchAttendance = async () => {
  const response = await api.get("/attendance");
  return response.data;
};

export const fetchEmployeeAttendance = async () => {
  const response = await api.get("/attendance/employee");
  return response.data;
};

export const createAttendance = async (attendanceData) => {
  const response = await api.post("/attendance", attendanceData);
  return response.data;
};

export const updateAttendance = async (id, attendanceData) => {
  const response = await api.put(`/attendance/${id}`, attendanceData);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};
