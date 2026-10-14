import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/timelog`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getTimeLogs = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};

export const getTimeLogById = async (timeLogId) => {
    const res = await api.get(`/${timeLogId}`);
    return res.data;
};

export const getNextTimeLogId = async () => {
    const res = await api.get("/next-id");
    return res.data;
};

export const createTimeLog = async (timeLogData) => {
    const res = await api.post("/", timeLogData);
    return res.data;
};

export const updateTimeLog = async (timeLogId, timeLogData) => {
    const res = await api.put(`/${timeLogId}`, timeLogData);
    return res.data;
};

export const deleteTimeLog = async (timeLogId) => {
    const res = await api.delete(`/${timeLogId}`);
    return res.data;
};

export const getMyTimeLogs = async () => {
    const res = await api.get("/my");
    return res.data;
};

export const getWeeklySummary = async () => {
    const res = await api.get("/summary/weekly");
    return res.data;
};

export const getMonthlySummary = async () => {
    const res = await api.get("/summary/monthly");
    return res.data;
};

const timeLogService = {
    getTimeLogs,
    getTimeLogById,
    getNextTimeLogId,
    createTimeLog,
    updateTimeLog,
    deleteTimeLog,
    getMyTimeLogs,
    getWeeklySummary,
    getMonthlySummary,
};

export default timeLogService;
