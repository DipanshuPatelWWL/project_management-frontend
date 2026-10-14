import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/bug`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getBugs = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};

export const getBugById = async (bugId) => {
    const res = await api.get(`/${bugId}`);
    return res.data;
};

export const getNextBugId = async () => {
    const res = await api.get("/next-id");
    return res.data;
};

export const createBug = async (bugData) => {
    const config = bugData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const res = await api.post("/", bugData, config);
    return res.data;
};

export const updateBug = async (bugId, bugData) => {
    const config = bugData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const res = await api.put(`/${bugId}`, bugData, config);
    return res.data;
};

export const deleteBug = async (bugId) => {
    const res = await api.delete(`/${bugId}`);
    return res.data;
};

export const assignBug = async (bugId, assignedTo) => {
    const res = await api.put(`/${bugId}/assign`, { assignedTo });
    return res.data;
};

export const changeBugStatus = async (bugId, status) => {
    const res = await api.put(`/${bugId}/status`, { status });
    return res.data;
};
