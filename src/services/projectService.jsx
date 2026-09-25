import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/project`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const createProject = async (projectData) => {
  const res = await api.post("/", projectData);
  return res.data;
};

export const getProjects = async () => {
  const res = await api.get("/");
  return res.data;
};

export const getProjectById = async (projectId) => {
  const res = await api.get(`/${projectId}`);
  return res.data;
};

export const updateProject = async (projectId, projectData) => {
  const res = await api.put(`/${projectId}`, projectData);
  return res.data;
};

export const deleteProject = async (projectId) => {
  const res = await api.delete(`/${projectId}`);
  return res.data;
};

export const assignProjectManager = async (projectId, managerId) => {
  const res = await api.put(`/${projectId}/assign-manager`, { managerId });
  return res.data;
};

export const assignTeamLead = async (projectId, teamLeadId) => {
  const res = await api.put(`/${projectId}/assign-teamlead`, { teamLeadId });
  return res.data;
};

export const assignMembers = async (projectId, memberIds) => {
  const res = await api.put(`/${projectId}/assign-members`, { memberIds });
  return res.data;
};