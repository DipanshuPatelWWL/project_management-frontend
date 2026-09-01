// src/services/projectService.jsx
import axios from "axios";

const API_URL = "http://localhost:5000/api/projects";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// POST / - naya project banao
export const createProject = async (projectData) => {
  const res = await api.post("/", projectData);
  return res.data;
};

// GET / - saare projects ki list
export const getProjects = async () => {
  const res = await api.get("/");
  return res.data;
};

// GET /:projectId - ek project ki detail
export const getProjectById = async (projectId) => {
  const res = await api.get(`/${projectId}`);
  return res.data;
};

// PUT /:projectId - project update karo
export const updateProject = async (projectId, projectData) => {
  const res = await api.put(`/${projectId}`, projectData);
  return res.data;
};

// DELETE /:projectId - project delete karo
export const deleteProject = async (projectId) => {
  const res = await api.delete(`/${projectId}`);
  return res.data;
};

// PUT /:projectId/assign-manager
export const assignProjectManager = async (projectId, managerId) => {
  const res = await api.put(`/${projectId}/assign-manager`, { managerId });
  return res.data;
};

// PUT /:projectId/assign-teamlead
export const assignTeamLead = async (projectId, teamLeadId) => {
  const res = await api.put(`/${projectId}/assign-teamlead`, { teamLeadId });
  return res.data;
};

// PUT /:projectId/assign-members
export const assignMembers = async (projectId, memberIds) => {
  const res = await api.put(`/${projectId}/assign-members`, { memberIds });
  return res.data;
};