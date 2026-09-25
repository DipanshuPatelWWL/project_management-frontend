import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const dashboardApi = axios.create({
    baseURL: `${API_BASE_URL}/api/dashboard`,
    withCredentials: true,
});

const projectApi = axios.create({
    baseURL: `${API_BASE_URL}/api/project`,
    withCredentials: true,
});

const taskApi = axios.create({
    baseURL: `${API_BASE_URL}/api/task`,
    withCredentials: true,
});

const meetingApi = axios.create({
    baseURL: `${API_BASE_URL}/api/meeting`,
    withCredentials: true,
});

const ROLE_ENDPOINTS = {
    SuperAdmin: "/super-admin",
    Admin: "/admin",
    ProjectManager: "/project-manager",
    TeamLead: "/team-lead",
    Developer: "/developer",
    QA: "/qa",
    Client: "/client",
};

export const getDashboardStats = async (role) => {
    const endpoint = ROLE_ENDPOINTS[role];
    if (!endpoint) {
        throw new Error(`No dashboard endpoint mapped for role: ${role}`);
    }
    const res = await dashboardApi.get(endpoint);
    return res.data;
};

export const getRecentProjects = async (limit = 5) => {
    const res = await projectApi.get("/");
    const projects = res.data.projects || res.data || [];

    const sorted = [...projects].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return sorted.slice(0, limit);
};

export const getRecentTasks = async (limit = 5) => {
    const res = await taskApi.get("/");
    const tasks = res.data.tasks || res.data || [];

    const sorted = [...tasks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return sorted.slice(0, limit);
};

export const getUpcomingMeetings = async (limit = 5) => {
    const res = await meetingApi.get("/");
    const meetings = res.data.meetings || res.data || [];

    const now = new Date();
    const upcoming = meetings.filter(
        (m) => m.status === "scheduled" && m.meetingDate && new Date(m.meetingDate) >= now
    );

    const sorted = upcoming.sort(
        (a, b) => new Date(a.meetingDate) - new Date(b.meetingDate)
    );

    return sorted.slice(0, limit);
};