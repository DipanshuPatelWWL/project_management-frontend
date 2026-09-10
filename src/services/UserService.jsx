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