import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/task`;


const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getTasks = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};


export const getTaskById = async (taskId) => {
    const res = await api.get(`/${taskId}`);
    return res.data;
};

export const createTask = async (taskData) => {
    const config = taskData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const res = await api.post("/", taskData, config);
    return res.data;
};

export const updateTask = async (taskId, taskData) => {
    const config = taskData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const res = await api.put(`/${taskId}`, taskData, config);
    return res.data;
};

export const deleteTask = async (taskId) => {
    const res = await api.delete(`/${taskId}`);
    return res.data;
};

export const assignTask = async (taskId, assignedTo) => {
    const res = await api.put(`/${taskId}/assign`, { assignedTo });
    return res.data;
};

export const changeTaskStatus = async (taskId, status) => {
    const res = await api.put(`/${taskId}/status`, { status });
    return res.data;
};

export const changeTaskPriority = async (taskId, priority) => {
    const res = await api.put(`/${taskId}/priority`, { priority });
    return res.data;
};
