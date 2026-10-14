import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as meetingService from "../../services/meetingService";
import * as projectService from "../../services/projectService";
import * as userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

const inputBaseClass =
    "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";

const textareaBaseClass =
    "w-full p-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5] resize-y min-h-[90px]";

const readonlyClass = "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";

const getInputClass = (hasError, isReadonly = false) => {
    let cls = inputBaseClass;
    if (isReadonly) cls += ` ${readonlyClass}`;
    if (hasError) cls += " field-error !border-[#ff8e9a] focus:!ring-[#ff8e9a]/20";
    return cls;
};

const getTextareaClass = (hasError) => {
    let cls = textareaBaseClass;
    if (hasError) cls += " field-error !border-[#ff8e9a] focus:!ring-[#ff8e9a]/20";
    return cls;
};

export const MEETING_TYPES = [
    "Video Call",
    "In-Person",
    "Phone Call",
    "Audio Call",
    "Hybrid",
];

export const MEETING_STATUSES = [
    { value: "scheduled", label: "Scheduled" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const initialMeetingState = {
    meetingId: "",
    meetingTitle: "",
    description: "",
    project: "",
    organizer: "",
    participants: "",
    meetingDate: "",
    startTime: "",
    endTime: "",
    meetingType: "Video Call",
    meetingLink: "",
    agenda: "",
    meetingNotes: "",
    status: "scheduled",
};

const CreateMeeting = () => {
    const navigate = useNavigate();
    const { meetingId } = useParams();
    const { user: currentUser } = useAuth();

    const isEditMode = Boolean(meetingId);

    const [formData, setFormData] = useState({
        ...initialMeetingState,
        organizer: currentUser?._id || "",
    });

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // Load initial projects and users
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [projRes, userRes] = await Promise.all([
                    projectService.getProjects().catch(() => ({ projects: [] })),
                    userService.getUsers().catch(() => ({ users: [] })),
                ]);

                const projList = Array.isArray(projRes?.projects)
                    ? projRes.projects
                    : Array.isArray(projRes)
                    ? projRes
                    : [];

                const userList = Array.isArray(userRes?.users)
                    ? userRes.users
                    : Array.isArray(userRes)
                    ? userRes
                    : [];

                setProjects(projList);
                setUsers(userList);
            } catch (err) {
                console.error("Failed to load projects/users options:", err);
            }
        };

        fetchInitialData();
    }, []);

    // Load next Meeting ID in create mode
    useEffect(() => {
        if (isEditMode) return;

        const loadNextId = async () => {
            try {
                const res = await meetingService.getNextMeetingId();
                if (res?.nextMeetingId) {
                    setFormData((prev) => ({ ...prev, meetingId: res.nextMeetingId }));
                }
            } catch (e) {
                console.error("Failed to load next Meeting ID:", e);
            }
        };

        loadNextId();
    }, [isEditMode]);

    // Load existing meeting for edit mode
    useEffect(() => {
        if (!isEditMode) return;

        const loadMeeting = async () => {
            setPageLoading(true);
            setError("");

            try {
                const res = await meetingService.getMeetingById(meetingId);
                const meeting = res?.meeting || res;

                if (!meeting) {
                    setError("Meeting not found.");
                    return;
                }

                // Format meetingDate to YYYY-MM-DD
                let formattedDate = "";
                if (meeting.meetingDate) {
                    if (typeof meeting.meetingDate === "string" && meeting.meetingDate.length >= 10) {
                        formattedDate = meeting.meetingDate.substring(0, 10);
                    } else {
                        const d = new Date(meeting.meetingDate);
                        if (!isNaN(d.getTime())) formattedDate = d.toISOString().substring(0, 10);
                    }
                }

                setFormData({
                    meetingId: meeting.meetingId || "",
                    meetingTitle: meeting.meetingTitle || "",
                    description: meeting.description || "",
                    project: meeting.project?._id || meeting.project || "",
                    organizer: meeting.organizer?._id || meeting.organizer || meeting.createdBy?._id || meeting.createdBy || "",
                    participants: meeting.participants?._id || meeting.participants || "",
                    meetingDate: formattedDate,
                    startTime: meeting.startTime || "",
                    endTime: meeting.endTime || "",
                    meetingType: meeting.meetingType || "Video Call",
                    meetingLink: meeting.meetingLink || "",
                    agenda: meeting.agenda || "",
                    meetingNotes: meeting.meetingNotes || "",
                    status: meeting.status || "scheduled",
                });
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load meeting details.");
            } finally {
                setPageLoading(false);
            }
        };

        loadMeeting();
    }, [isEditMode, meetingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name] || (name === "startTime" && fieldErrors.endTime)) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                if (name === "startTime") delete updated.endTime;
                return updated;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.meetingTitle?.trim()) {
            errors.meetingTitle = "Meeting title is required.";
        }
        if (!formData.project) {
            errors.project = "Project is required.";
        }
        if (!formData.startTime) {
            errors.startTime = "Start time is required.";
        }
        if (!formData.endTime) {
            errors.endTime = "End time is required.";
        } else if (formData.startTime && formData.startTime >= formData.endTime) {
            errors.endTime = "End time must be after start time.";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
                setError("End time must be after start time.");
            } else {
                setError("Please fill out all required fields.");
            }
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                meetingId: formData.meetingId || null,
                meetingTitle: formData.meetingTitle.trim(),
                description: formData.description?.trim() || "",
                project: formData.project || null,
                organizer: formData.organizer || currentUser?._id || null,
                participants: formData.participants || null,
                meetingDate: formData.meetingDate || null,
                startTime: formData.startTime || "",
                endTime: formData.endTime || "",
                meetingType: formData.meetingType || "Video Call",
                meetingLink: formData.meetingLink?.trim() || "",
                agenda: formData.agenda?.trim() || "",
                meetingNotes: formData.meetingNotes?.trim() || "",
                status: formData.status || "scheduled",
            };

            if (isEditMode) {
                await meetingService.updateMeeting(meetingId, payload);
                setSuccess("Meeting updated successfully!");
            } else {
                await meetingService.createMeeting(payload);
                setSuccess("Meeting scheduled successfully!");
                setFormData({
                    ...initialMeetingState,
                    organizer: currentUser?._id || "",
                });
            }

            setTimeout(() => {
                navigate("/meetings");
            }, 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "An error occurred while saving the meeting."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="w-full min-w-0 box-border p-[30px] max-sm:p-4">
                <div className="text-[#8f9bb3] py-16 text-center">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 box-border p-[30px] max-sm:p-4">
            <div className="w-full max-w-[1000px] mx-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-[22px_28px] max-sm:p-5 bg-[#171b2e] border-b border-[#30364d] max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
                    <h1 className="m-0 text-[22px] font-semibold text-white">
                        {isEditMode ? "Edit Meeting" : "Schedule Meeting"}
                    </h1>

                    <button
                        type="button"
                        className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
                        onClick={() => navigate("/meetings")}
                    >
                        Back to Meetings
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="my-0 mx-7 max-sm:mx-5 mt-5 p-[12px_14px] border border-[#7f1d1d] rounded-[7px] bg-[#2a1518] text-[#fca5a5] text-[13px]">
                        {error}
                    </div>
                )}

                {/* Success Banner */}
                {success && (
                    <div className="my-0 mx-7 max-sm:mx-5 mt-5 p-[12px_14px] border border-[#166534] rounded-[7px] bg-[#14251b] text-[#86efac] text-[13px]">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form className="p-7 max-sm:p-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                        {/* Meeting ID */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="meetingId" className="text-[13px] font-medium text-[#cbd2e3]">
                                Meeting ID
                            </label>
                            <input
                                id="meetingId"
                                name="meetingId"
                                value={formData.meetingId}
                                readOnly
                                className={getInputClass(false, true)}
                            />
                        </div>

                        {/* Meeting Title */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="meetingTitle" className="text-[13px] font-medium text-[#cbd2e3]">
                                Meeting Title <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="meetingTitle"
                                name="meetingTitle"
                                type="text"
                                className={getInputClass(fieldErrors.meetingTitle)}
                                value={formData.meetingTitle}
                                onChange={handleChange}
                                placeholder="e.g. Sprint Planning Sync"
                            />
                            {fieldErrors.meetingTitle && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.meetingTitle}</span>
                            )}
                        </div>

                        {/* Project */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="project" className="text-[13px] font-medium text-[#cbd2e3]">
                                Project <span className="text-[#ff9da9]">*</span>
                            </label>
                            <select
                                id="project"
                                name="project"
                                className={getInputClass(fieldErrors.project)}
                                value={formData.project}
                                onChange={handleChange}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    Select Project
                                </option>
                                {projects.map((proj) => (
                                    <option key={proj._id} value={proj._id} className="bg-[#171b2e] text-white">
                                        {proj.projectName} {proj.projectId ? `(${proj.projectId})` : ""}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.project && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.project}</span>
                            )}
                        </div>

                        {/* Meeting Type */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="meetingType" className="text-[13px] font-medium text-[#cbd2e3]">
                                Meeting Type
                            </label>
                            <select
                                id="meetingType"
                                name="meetingType"
                                className={getInputClass(fieldErrors.meetingType)}
                                value={formData.meetingType}
                                onChange={handleChange}
                            >
                                {MEETING_TYPES.map((type) => (
                                    <option key={type} value={type} className="bg-[#171b2e] text-white">
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Organizer */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="organizer" className="text-[13px] font-medium text-[#cbd2e3]">
                                Organizer
                            </label>
                            <select
                                id="organizer"
                                name="organizer"
                                className={getInputClass(fieldErrors.organizer)}
                                value={formData.organizer}
                                onChange={handleChange}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    Select Organizer
                                </option>
                                {users.map((usr) => (
                                    <option key={usr._id} value={usr._id} className="bg-[#171b2e] text-white">
                                        {usr.firstName || ""} {usr.lastName || ""} {usr.email ? `(${usr.email})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Participants */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="participants" className="text-[13px] font-medium text-[#cbd2e3]">
                                Participants
                            </label>
                            <select
                                id="participants"
                                name="participants"
                                className={getInputClass(fieldErrors.participants)}
                                value={formData.participants}
                                onChange={handleChange}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    Select Participant
                                </option>
                                {users.map((usr) => (
                                    <option key={usr._id} value={usr._id} className="bg-[#171b2e] text-white">
                                        {usr.firstName || ""} {usr.lastName || ""} {usr.email ? `(${usr.email})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Meeting Date */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="meetingDate" className="text-[13px] font-medium text-[#cbd2e3]">
                                Meeting Date
                            </label>
                            <input
                                id="meetingDate"
                                name="meetingDate"
                                type="date"
                                className={getInputClass(fieldErrors.meetingDate)}
                                value={formData.meetingDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="status" className="text-[13px] font-medium text-[#cbd2e3]">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                className={getInputClass(fieldErrors.status)}
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {MEETING_STATUSES.map((st) => (
                                    <option key={st.value} value={st.value} className="bg-[#171b2e] text-white">
                                        {st.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Time */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="startTime" className="text-[13px] font-medium text-[#cbd2e3]">
                                Start Time <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="startTime"
                                name="startTime"
                                type="time"
                                className={getInputClass(fieldErrors.startTime)}
                                value={formData.startTime}
                                onChange={handleChange}
                            />
                            {fieldErrors.startTime && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.startTime}</span>
                            )}
                        </div>

                        {/* End Time */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="endTime" className="text-[13px] font-medium text-[#cbd2e3]">
                                End Time <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="endTime"
                                name="endTime"
                                type="time"
                                className={getInputClass(fieldErrors.endTime)}
                                value={formData.endTime}
                                onChange={handleChange}
                            />
                            {fieldErrors.endTime && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.endTime}</span>
                            )}
                        </div>

                        {/* Meeting Link / Location */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="meetingLink" className="text-[13px] font-medium text-[#cbd2e3]">
                                Meeting Link / Location
                            </label>
                            <input
                                id="meetingLink"
                                name="meetingLink"
                                type="text"
                                className={getInputClass(fieldErrors.meetingLink)}
                                value={formData.meetingLink}
                                onChange={handleChange}
                                placeholder="e.g. https://meet.google.com/abc-defg-hij or Board Room 4"
                            />
                        </div>

                        {/* Agenda */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="agenda" className="text-[13px] font-medium text-[#cbd2e3]">
                                Agenda
                            </label>
                            <textarea
                                id="agenda"
                                name="agenda"
                                rows={3}
                                className={getTextareaClass(fieldErrors.agenda)}
                                value={formData.agenda}
                                onChange={handleChange}
                                placeholder="Key agenda items and goals for this meeting..."
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="description" className="text-[13px] font-medium text-[#cbd2e3]">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className={getTextareaClass(fieldErrors.description)}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide meeting context or background details..."
                            />
                        </div>

                        {/* Meeting Notes */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="meetingNotes" className="text-[13px] font-medium text-[#cbd2e3]">
                                Meeting Notes
                            </label>
                            <textarea
                                id="meetingNotes"
                                name="meetingNotes"
                                rows={3}
                                className={getTextareaClass(fieldErrors.meetingNotes)}
                                value={formData.meetingNotes}
                                onChange={handleChange}
                                placeholder="Discussion notes, key takeaways, and action items..."
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3.5 mt-7">
                        <button
                            type="button"
                            onClick={() => navigate("/meetings")}
                            className="py-[11px] px-5 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8]"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="w-[180px] max-sm:w-full h-11 border-none rounded-[7px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#4752c4] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            {submitting
                                ? isEditMode
                                    ? "Saving..."
                                    : "Scheduling..."
                                : isEditMode
                                ? "Save Changes"
                                : "Schedule Meeting"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMeeting;
