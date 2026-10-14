import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/document`;


const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});


export const getDocuments = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};
 

export const getDocumentById = async (documentId) => {
    const res = await api.get(`/${documentId}`);
    return res.data;
};


export const getNextDocumentId = async () => {
    const res = await api.get("/next-id");
    return res.data;
};



export const createDocument = async (documentData) => {
    const res = await api.post("/", documentData);
    return res.data;
};



export const updateDocument = async (documentId, documentData) => {
    const res = await api.put(`/${documentId}`, documentData);
    return res.data;
};



export const deleteDocument = async (documentId) => {
    const res = await api.delete(`/${documentId}`);
    return res.data;
};

export const downloadDocument = async (documentId) => {
    const res = await api.get(`/${documentId}/download`, { responseType: "blob" });
    return res.data;
};


const documentService = {
    getDocuments,
    getDocumentById,
    getNextDocumentId,
    createDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
};

export default documentService;
