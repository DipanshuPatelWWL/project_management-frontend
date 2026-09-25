import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/notifications`,
    withCredentials: true,
});

// GET / - list notifications
// NOTE: backend's getNotification currently returns ALL notifications for
// ALL users (no receiver filter) - not just the logged-in user's own.
export const getNotifications = async () => {
    const res = await api.get("/");
    return res.data;
};

// PATCH /:id/read
export const markAsRead = async (notificationId) => {
    const res = await api.patch(`/${notificationId}/read`);
    return res.data;
};

// PATCH /read-all
export const markAllAsRead = async () => {
    const res = await api.patch("/read-all");
    return res.data;
};

// DELETE /:id
export const deleteNotification = async (notificationId) => {
    const res = await api.delete(`/${notificationId}`);
    return res.data;
};