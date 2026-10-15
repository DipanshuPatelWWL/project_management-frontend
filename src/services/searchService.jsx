import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/search`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

/**
 * Global Search across all entities (Users, Companies, Clients, Projects, Tasks, Bugs)
 * @param {string} query
 * @returns {Promise<{success: boolean, query: string, data: object, counts: object}>}
 */
export const searchGlobal = async (query) => {
    if (!query || !query.trim()) return { data: {}, counts: {} };
    const res = await api.get("/", { params: { q: query.trim() } });
    return res.data;
};

/**
 * Category-specific search
 */
export const searchUsers = async (query) => {
    const res = await api.get("/users", { params: { q: query } });
    return res.data;
};

export const searchProjects = async (query) => {
    const res = await api.get("/projects", { params: { q: query } });
    return res.data;
};

export const searchTasks = async (query) => {
    const res = await api.get("/tasks", { params: { q: query } });
    return res.data;
};

export const searchBugs = async (query) => {
    const res = await api.get("/bugs", { params: { q: query } });
    return res.data;
};

export const searchCompanies = async (query) => {
    const res = await api.get("/companies", { params: { q: query } });
    return res.data;
};

export const searchClients = async (query) => {
    const res = await api.get("/clients", { params: { q: query } });
    return res.data;
};

const searchService = {
    searchGlobal,
    searchUsers,
    searchProjects,
    searchTasks,
    searchBugs,
    searchCompanies,
    searchClients,
};

export default searchService;
