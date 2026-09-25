import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/users",
    withCredentials: true,
});

export const createUser = async (userData) => {
    const res = await api.post("/", userData);
    return res.data;
};

export const getUsers = async () => {
    const res = await api.get("/");
    return res.data;
};

export const deleteUser = async (userId) => {
    const res = await api.delete(`/${userId}`);
    return res.data;
};

export const getUserById = async (userId) => {
    const res = await api.get(`/${userId}`);
    return res.data;
};

export const updateUser = async (userId, userData) => {
    const res = await api.put(`/${userId}`, userData);
    return res.data;
};

export const updateUserStatus = async (userId, status) => {
    const res = await api.patch(`/${userId}/status`, { status });
    return res.data;
};

export const updateUserRole = async (userId, role) => {
    const res = await api.patch(`/${userId}/role`, { role });
    return res.data;
};

export const updateProfileImage = async (formData) => {
    const res = await api.put("/profile/image", formData);
    return res.data;
};