import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/company`,
    withCredentials: true,
});

export const getCompanies = async () => {
    const res = await api.get("/");
    return res.data;
};

export const createCompany = async (companyData) => {
    const res = await api.post("/", companyData);
    return res.data;
};

export const getCompanyById = async (companyId) => {
    const res = await api.get(`/${companyId}`);
    return res.data;
};

export const updateCompany = async (companyId, companyData) => {
    const res = await api.put(`/${companyId}`, companyData);
    return res.data;
};

export const deleteCompany = async (companyId) => {
    const res = await api.delete(`/${companyId}`);
    return res.data;
};