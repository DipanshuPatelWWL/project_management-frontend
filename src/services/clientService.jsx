import axios from "axios";

const API_URL = "http://localhost:5000/api/client";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const createClient = async (clientData) => {
    const response = await api.post("/", clientData);
    return response.data;
};

export const getClients = async () => {
    const response = await api.get("/");
    return response.data;
};

export const getClientById = async (clientId) => {
    const response = await api.get(`/${clientId}`);
    return response.data;
};

export const updateClient = async (clientId, clientData) => {
    const response = await api.put(`/${clientId}`, clientData);
    return response.data;
};

export const deleteClient = async (clientId) => {
    const response = await api.delete(`/${clientId}`);
    return response.data;
};