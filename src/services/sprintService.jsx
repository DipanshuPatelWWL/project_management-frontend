import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/sprint`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getSprints = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};


export const getSprintById = async (sprintId) => {
    const res = await api.get(`/${sprintId}`);
    return res.data;
};


export const createSprint = async (sprintData) => {
    const res = await api.post("/", sprintData);
    return res.data;
};


export const updateSprint = async (sprintId, sprintData) => {
    const res = await api.put(`/${sprintId}`, sprintData);
    return res.data;
};

export const deleteSprint = async (sprintId) => {
    const res = await api.delete(`/${sprintId}`);
    return res.data;
};

export const startSprint = async (sprintId) => {
    const res = await api.put(`/${sprintId}/start`);
    return res.data;
};

export const completeSprint = async (sprintId) => {
    const res = await api.put(`/${sprintId}/complete`);
    return res.data;
};

export default {
    getSprints,
    getSprintById,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
};
