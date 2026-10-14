import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/notifications`,
    withCredentials: true,
});

// GET /api/notifications
export const getNotifications = async () => {
    const res = await api.get("/");
    return res.data;
};

// GET /api/notifications/:notificationId
export const getNotificationById = async (notificationId) => {
    const res = await api.get(`/${notificationId}`);
    return res.data;
};

// PATCH /api/notifications/:notificationId/read
export const markAsRead = async (notificationId) => {
    const res = await api.patch(`/${notificationId}/read`);
    return res.data;
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async () => {
    const res = await api.patch("/read-all");
    return res.data;
};

// DELETE /api/notifications/:notificationId
export const deleteNotification = async (notificationId) => {
    const res = await api.delete(`/${notificationId}`);
    return res.data;
};

// DELETE /api/notifications (Delete all)
export const deleteAllNotifications = async () => {
    const res = await api.delete("/");
    return res.data;
};

export default {
    getNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
};