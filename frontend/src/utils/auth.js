import axios from "axios";
const API_URL = "http://localhost:5000/api";
export const login = async (credentials) => {
  return await axios.post(`${API_URL}/auth/login`, credentials);
};

export const register = async (userData) => {
  return await axios.post(`${API_URL}/auth/register`, userData);
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
