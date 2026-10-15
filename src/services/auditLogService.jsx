import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/audit-logs`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// GET /api/audit-logs (params: { page, limit, action, user, entityType, entityId, startDate, endDate })
export const getAuditLogs = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};

// GET /api/audit-logs/:auditLogId
export const getAuditLogById = async (auditLogId) => {
    if (!auditLogId) throw new Error("Audit Log ID is required");
    const res = await api.get(`/${auditLogId}`);
    return res.data;
};

// GET /api/audit-logs/user/:userId
export const getUserAuditLogs = async (userId) => {
    if (!userId) throw new Error("User ID is required");
    const res = await api.get(`/user/${userId}`);
    return res.data;
};

// GET /api/audit-logs/project/:projectId
export const getProjectAuditLogs = async (projectId) => {
    if (!projectId) throw new Error("Project ID is required");
    const res = await api.get(`/project/${projectId}`);
    return res.data;
};

// DELETE /api/audit-logs/:auditLogId (SuperAdmin only)
export const deleteAuditLog = async (auditLogId) => {
    if (!auditLogId) throw new Error("Audit Log ID is required");
    const res = await api.delete(`/${auditLogId}`);
    return res.data;
};

const auditLogService = {
    getAuditLogs,
    getAuditLogById,
    getUserAuditLogs,
    getProjectAuditLogs,
    deleteAuditLog,
};

export default auditLogService;
