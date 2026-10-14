import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";
const API_URL = `${API_BASE_URL}/api/meeting`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const getMeetings = async (params = {}) => {
    const res = await api.get("/", { params });
    return res.data;
};

export const getMeetingById = async (meetingId) => {
    const res = await api.get(`/${meetingId}`);
    return res.data;
};

export const getNextMeetingId = async () => {
    const res = await api.get("/next-id");
    return res.data;
};

export const createMeeting = async (meetingData) => {
    const res = await api.post("/", meetingData);
    return res.data;
};

export const updateMeeting = async (meetingId, meetingData) => {
    const res = await api.put(`/${meetingId}`, meetingData);
    return res.data;
};

export const deleteMeeting = async (meetingId) => {
    const res = await api.delete(`/${meetingId}`);
    return res.data;
};

export const changeMeetingStatus = async (meetingId, status) => {
    const res = await api.patch(`/${meetingId}/status`, { status });
    return res.data;
};

export const addMeetingNotes = async (meetingId, meetingNotes) => {
    const res = await api.patch(`/${meetingId}/notes`, { meetingNotes });
    return res.data;
};

const meetingService = {
    getMeetings,
    getMeetingById,
    getNextMeetingId,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    changeMeetingStatus,
    addMeetingNotes,
};

export default meetingService;
