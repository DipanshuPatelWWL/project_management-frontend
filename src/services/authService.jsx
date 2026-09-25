import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
});

export const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
    const response = await api.put("/auth/change-password", { oldPassword, newPassword });
    return response.data;
};