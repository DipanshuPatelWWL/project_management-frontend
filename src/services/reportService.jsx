import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/reports`;


const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});


// GET /api/reports/project/:projectId
export const getProjectReport = async (projectId) => {
    if (!projectId) throw new Error("Project ID is required");
    const res = await api.get(`/project/${projectId}`);
    return res.data;
};

// GET /api/reports/sprint/:sprintId
export const getSprintReport = async (sprintId) => {
    if (!sprintId) throw new Error("Sprint ID is required");
    const res = await api.get(`/sprint/${sprintId}`);
    return res.data;
};

// GET /api/reports/employee/:employeeId
export const getEmployeeReport = async (employeeId) => {
    if (!employeeId) throw new Error("Employee ID is required");
    const res = await api.get(`/employee/${employeeId}`);
    return res.data;
};

// GET /api/reports/tasks (params: { projectId, sprintId, assignedTo })
export const getTaskReport = async (params = {}) => {
    const res = await api.get("/tasks", { params });
    return res.data;
};

// GET /api/reports/bugs (params: { projectId, sprintId, assignedTo })
export const getBugReport = async (params = {}) => {
    const res = await api.get("/bugs", { params });
    return res.data;
};

// GET /api/reports/timelogs (params: { startDate, endDate, projectId, userId })
export const getTimeLogReport = async (params = {}) => {
    const res = await api.get("/timelogs", { params });
    return res.data;
};

const reportService = {
    getProjectReport,
    getSprintReport,
    getEmployeeReport,
    getTaskReport,
    getBugReport,
    getTimeLogReport,
};

export default reportService;
