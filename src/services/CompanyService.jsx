import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/company",
    withCredentials: true,
});

export const getCompanies = async () => {
    const res = await api.get("/");
    return res.data;
};