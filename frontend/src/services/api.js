import axios from "axios";

// Create Axios instance pointing to backend
const API = axios.create({
  baseURL: "http://localhost:3000",
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------- AUTH ENDPOINTS --------------------
export const registerUser = (user) => API.post("/auth/register", user);
export const loginUser = (credentials) => API.post("/auth/login", credentials);

// -------------------- TASK ENDPOINTS --------------------

// ✅ Supports search and filters via query params
export const getTasks = ({ search, status, dueDate } = {}) =>
  API.get("/tasks", {
    params: {
      ...(search && { search }),
      ...(status && { status }),
      ...(dueDate && { dueDate }),
    },
  });

export const getTask = (id) => API.get(`/tasks/${id}`);
export const createTask = (task) => API.post("/tasks", task);
export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
