import axios from "axios";

// Create Axios instance pointing to backend
const API = axios.create({
  baseURL: "http://localhost:3000", // ✅ adjust if backend runs elsewhere
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

// -------------------- SHARE TASK ENDPOINT --------------------
export const shareTask = (taskId, userIds) =>
  API.put(`/tasks/${taskId}/share`, { userIds });

// -------------------- NEW ENDPOINTS --------------------
export const getMyTasks = () => API.get("/tasks/my");
export const getSharedTasks = () => API.get("/tasks/shared");

// -------------------- ANALYTICS ENDPOINTS --------------------
export const getAnalyticsOverview = () => API.get("/tasks/analytics/overview");
export const getAnalyticsTrends = () => API.get("/tasks/analytics/trends");

// -------------------- ATTACHMENT ENDPOINT --------------------
// ✅ Upload file to a task
export const uploadAttachment = (taskId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
