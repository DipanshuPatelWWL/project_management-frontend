import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as meetingService from "../../services/meetingService";
import * as projectService from "../../services/projectService";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const Meeting = () => {
    const navigate = useNavigate();

    const [meetings, setMeetings] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    //Filters state
    const [filters, setFilters] = useState({
        search: "",
        project: "",
        status: "",
        meetingType: "",
    });
 
    const [page, setPage] = useState(1);
  
    // Modals state
    const [viewMeeting, setViewMeeting] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
 
    // Quick notes in modal
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesValue, setNotesValue] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        setError("");

        try {
            const [meetingsRes, projectsRes] = await Promise.all([
                meetingService.getMeetings(),
                projectService.getProjects().catch(() => ({ projects: [] })),
            ]);

            setMeetings(meetingsRes.meetings || meetingsRes || []);
            setProjects(projectsRes.projects || projectsRes || []);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load meetings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };
 
    // Filter meetings
    const filteredMeetings = useMemo(() => {
        return meetings.filter((m) => {
            const searchVal = filters.search.toLowerCase().trim();
            const idVal = (m.meetingId || "").toLowerCase();
            const titleVal = (m.meetingTitle || "").toLowerCase();
            const descVal = (m.description || "").toLowerCase();
            const agendaVal = (m.agenda || "").toLowerCase();
            const linkVal = (m.meetingLink || "").toLowerCase();
            const notesVal = (m.meetingNotes || "").toLowerCase();
            const typeVal = (m.meetingType || "").toLowerCase();
            const projName = (m.project?.projectName || "").toLowerCase();

            const organizerName = m.organizer
                ? `${m.organizer.firstName || ""} ${m.organizer.lastName || ""}`.toLowerCase()
                : m.createdBy
                ? `${m.createdBy.firstName || ""} ${m.createdBy.lastName || ""}`.toLowerCase()
                : "";

            const participantName = m.participants
                ? `${m.participants.firstName || ""} ${m.participants.lastName || ""}`.toLowerCase()
                : "";

            const matchesSearch =
                !searchVal ||
                idVal.includes(searchVal) ||
                titleVal.includes(searchVal) ||
                descVal.includes(searchVal) ||
                agendaVal.includes(searchVal) ||
                linkVal.includes(searchVal) ||
                notesVal.includes(searchVal) ||
                typeVal.includes(searchVal) ||
                projName.includes(searchVal) ||
                organizerName.includes(searchVal) ||
                participantName.includes(searchVal);

            const mProjId = m.project?._id || m.project;
            const matchesProject = !filters.project || mProjId === filters.project;

            const mStatus = (m.status || "scheduled").toLowerCase();
            const matchesStatus = !filters.status || mStatus === filters.status.toLowerCase();

            const matchesType = !filters.meetingType || m.meetingType === filters.meetingType;

            return matchesSearch && matchesProject && matchesStatus && matchesType;
        });
    }, [meetings, filters]);

    // Statistics counts
    const totalMeetings = meetings.length;
    const scheduledMeetings = meetings.filter(
        (m) => (m.status || "scheduled").toLowerCase() === "scheduled"
    ).length;
    const inProgressMeetings = meetings.filter(
        (m) => (m.status || "").toLowerCase() === "in-progress"
    ).length;
    const completedMeetings = meetings.filter(
        (m) => (m.status || "").toLowerCase() === "completed"
    ).length;

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
    const paginatedMeetings = filteredMeetings.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    // Helpers
    const getProjectName = (proj) => {
        if (!proj) return "-";
        if (typeof proj === "string") return proj;
        return proj.projectName || proj.name || "-";
    };

    const getUserName = (user) => {
        if (!user) return "-";
        if (typeof user === "string") return user;
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return name || user.name || user.email || "User";
    };

    const formatDate = (dateVal) => {
        if (!dateVal) return "-";
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return "-";
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "-";
        }
    };

    const formatTimeDisplay = (start, end) => {
        if (!start && !end) return "-";
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    // Badge styling helpers
    const getStatusBadgeClass = (status = "scheduled") => {
        const s = status.toLowerCase();
        if (s === "completed") return "bg-[#1c3a2e] text-[#7fe3a8] border border-[#265340]";
        if (s === "cancelled") return "bg-[#40252c] text-[#ff9da9] border border-[#5d303b]";
        if (s === "in-progress") return "bg-[#3d2f1d] text-[#f5b358] border border-[#5a4325]";
        return "bg-[#1f3554] text-[#9fc5ff] border border-[#2b4c7e]"; // scheduled
    };

    const getTypeBadgeClass = (type = "Video Call") => {
        const t = (type || "").toLowerCase();
        if (t.includes("video")) return "bg-[#222942] text-[#9fc5ff] border border-[#30364d]";
        if (t.includes("in-person")) return "bg-[#26354a] text-[#86efac] border border-[#1e4e38]";
        if (t.includes("hybrid")) return "bg-[#382b4a] text-[#c084fc] border border-[#4e346e]";
        return "bg-[#252a42] text-[#cbd2e3] border border-[#353d5e]";
    };

    // Quick workflow status change
    const handleQuickStatusChange = async (meetingId, newStatus) => {
        try {
            setError("");
            await meetingService.changeMeetingStatus(meetingId, newStatus);
            setMeetings((prev) =>
                prev.map((m) => (m._id === meetingId ? { ...m, status: newStatus } : m))
            );
            if (viewMeeting && viewMeeting._id === meetingId) {
                setViewMeeting((prev) => ({ ...prev, status: newStatus }));
            }
            setSuccess(`Meeting status updated to ${newStatus}!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update meeting status.");
        }
    };

    // Quick Save Notes from Modal
    const handleSaveNotes = async () => {
        if (!viewMeeting) return;
        setSavingNotes(true);
        try {
            await meetingService.addMeetingNotes(viewMeeting._id, notesValue);
            setMeetings((prev) =>
                prev.map((m) =>
                    m._id === viewMeeting._id ? { ...m, meetingNotes: notesValue } : m
                )
            );
            setViewMeeting((prev) => ({ ...prev, meetingNotes: notesValue }));
            setEditingNotes(false);
            setSuccess("Meeting notes saved successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save meeting notes.");
        } finally {
            setSavingNotes(false);
        }
    };

    // Delete meeting
    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await meetingService.deleteMeeting(deleteTarget._id);
            setMeetings((prev) => prev.filter((m) => m._id !== deleteTarget._id));
            if (viewMeeting && viewMeeting._id === deleteTarget._id) {
                setViewMeeting(null);
            }
            setDeleteTarget(null);
            setSuccess("Meeting deleted successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to delete meeting.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Meetings</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                        Schedule, organize, and track team syncs, agendas, and discussion minutes.
                    </p>
                </div>

                <button
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                    onClick={() => navigate("/meetings/create")}
                >
                    + Schedule Meeting
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-[18px] mb-[25px]">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Meetings</span>
                    <strong className="text-white text-[26px] font-bold">{totalMeetings}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Scheduled</span>
                    <strong className="text-white text-[26px] font-bold">{scheduledMeetings}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">In Progress</span>
                    <strong className="text-white text-[26px] font-bold">{inProgressMeetings}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Completed</span>
                    <strong className="text-white text-[26px] font-bold">{completedMeetings}</strong>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap max-md:flex-col max-md:items-stretch">
                <input
                    type="text"
                    className="flex-1 min-w-[220px] h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                    placeholder="Search by title, project, agenda, link, user..."
                    value={filters.search}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            search: e.target.value,
                        })
                    }
                />

                <select
                    value={filters.project}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            project: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[160px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Projects</option>
                    {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.projectId ? `[${p.projectId}] ` : ""}{p.projectName}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            status: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[140px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <select
                    value={filters.meetingType}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            meetingType: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[140px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Types</option>
                    <option value="Video Call">Video Call</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Audio Call">Audio Call</option>
                    <option value="Hybrid">Hybrid</option>
                </select>

                {(filters.search || filters.project || filters.status || filters.meetingType) && (
                    <button
                        onClick={() =>
                            handleFiltersChange({
                                search: "",
                                project: "",
                                status: "",
                                meetingType: "",
                            })
                        }
                        className="h-[42px] px-3.5 border border-[#30364d] rounded-lg bg-[#222942] text-[#9fc5ff] text-[13px] font-medium hover:bg-[#2b3558] transition-colors cursor-pointer"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Error & Success Messages */}
            {error && (
                <div className="py-3 px-4 rounded-lg bg-[#40252c] border border-[#5d303b] text-[#ff9da9] text-[14px] mb-5">
                    {error}
                </div>
            )}
            {success && (
                <div className="py-3 px-4 rounded-lg bg-[#1c3a2e] border border-[#265340] text-[#7fe3a8] text-[14px] mb-5">
                    {success}
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="w-full h-64 flex items-center justify-center">
                    <Loader />
                </div>
            ) : filteredMeetings.length === 0 ? (
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-[50px] text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-2xl font-bold">
                        📅
                    </div>
                    <h3 className="m-0 text-white text-[18px] font-semibold">No Meetings Found</h3>
                    <p className="text-[#8f9bb3] text-[14px] mt-1.5 mb-5 max-w-[420px] mx-auto">
                        No meetings match your filter criteria or none have been scheduled yet.
                    </p>
                    <button
                        onClick={() => navigate("/meetings/create")}
                        className="py-2.5 px-5 bg-[#5865f2] text-white rounded-lg text-[13px] font-semibold hover:bg-[#4752c4] transition-colors cursor-pointer border-none"
                    >
                        + Schedule First Meeting
                    </button>
                </div>
            ) : (
                <>
                    <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                        <table className="w-full min-w-[950px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Meeting ID
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Meeting Title
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Project
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Date & Time
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Type
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Organizer
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Participants
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Link / Location
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Status
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedMeetings.map((meeting) => {
                                    const status = (meeting.status || "scheduled").toLowerCase();
                                    const meetingType = meeting.meetingType || "Video Call";

                                    // Next workflow status helper
                                    let nextStatus = null;
                                    let nextStatusLabel = "";
                                    if (status === "scheduled") {
                                        nextStatus = "in-progress";
                                        nextStatusLabel = "Start";
                                    } else if (status === "in-progress") {
                                        nextStatus = "completed";
                                        nextStatusLabel = "Complete";
                                    }

                                    const isUrl = meeting.meetingLink && (meeting.meetingLink.startsWith("http://") || meeting.meetingLink.startsWith("https://"));

                                    return (
                                        <tr
                                            key={meeting._id}
                                            className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0"
                                        >
                                            {/* Meeting ID */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {meeting.meetingId || "-"}
                                            </td>

                                            {/* Meeting Title */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] max-w-[240px]">
                                                <span className="block text-white text-[14px] font-semibold truncate">
                                                    {meeting.meetingTitle}
                                                </span>
                                                <small className="block text-[#7f8aa5] text-[12px] truncate mt-0.5 max-w-[220px]">
                                                    {meeting.agenda || meeting.description || "No agenda set"}
                                                </small>
                                            </td>

                                            {/* Project */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                    {getProjectName(meeting.project)}
                                                </span>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="text-[13px] text-[#e8ebf5] font-medium">
                                                    {formatDate(meeting.meetingDate)}
                                                </div>
                                                <div className="text-[12px] text-[#7f8aa5] mt-0.5">
                                                    {formatTimeDisplay(meeting.startTime, meeting.endTime)}
                                                </div>
                                            </td>

                                            {/* Meeting Type */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-medium ${getTypeBadgeClass(meetingType)}`}>
                                                    {meetingType}
                                                </span>
                                            </td>

                                            {/* Organizer */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-6 h-6 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {getUserName(meeting.organizer || meeting.createdBy).charAt(0)}
                                                    </span>
                                                    <span className="text-[#cbd2e3] text-[13px]">
                                                        {getUserName(meeting.organizer || meeting.createdBy)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Participants */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {meeting.participants ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-6 h-6 rounded-full bg-[#1c3a2e] text-[#7fe3a8] flex items-center justify-center text-[10px] font-bold uppercase">
                                                            {getUserName(meeting.participants).charAt(0)}
                                                        </span>
                                                        <span className="text-[#cbd2e3] text-[13px]">
                                                            {getUserName(meeting.participants)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#7f8aa5] text-[12px] italic">
                                                        None
                                                    </span>
                                                )}
                                            </td>

                                            {/* Meeting Link / Location */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
                                                {isUrl ? (
                                                    <a
                                                        href={meeting.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#5865f2] hover:underline flex items-center gap-1 text-[13px]"
                                                        title={meeting.meetingLink}
                                                    >
                                                        🔗 Join Link
                                                    </a>
                                                ) : (
                                                    <span className="text-[#cbd2e3] text-[13px]">
                                                        {meeting.meetingLink || "-"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getStatusBadgeClass(status)}`}>
                                                    {status}
                                                </span>
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-[7px]">
                                                    {nextStatus && (
                                                        <button
                                                            className="border-none rounded-[6px] py-[6px] px-[9px] text-[11px] cursor-pointer font-medium bg-[#1c3a2e] text-[#7fe3a8] hover:bg-[#265340] transition-colors"
                                                            onClick={() => handleQuickStatusChange(meeting._id, nextStatus)}
                                                            title={`Advance status to ${nextStatus}`}
                                                        >
                                                            ➔ {nextStatusLabel}
                                                        </button>
                                                    )}

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                        onClick={() => {
                                                            setViewMeeting(meeting);
                                                            setNotesValue(meeting.meetingNotes || "");
                                                            setEditingNotes(false);
                                                        }}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                        onClick={() => navigate(`/meetings/${meeting._id}/edit`)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] font-medium hover:bg-[#522d36]"
                                                        onClick={() => setDeleteTarget(meeting)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredMeetings.length > 0 && (
                        <div className="flex items-center justify-center gap-[18px] mt-5">
                            <button
                                className="border border-[#30364d] bg-[#171b2e] text-[#e8ebf5] py-2 px-3.5 rounded-[7px] text-[13px] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>

                            <span className="text-[13px] font-medium text-[#8f9bb3]">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                className="border border-[#30364d] bg-[#171b2e] text-[#e8ebf5] py-2 px-3.5 rounded-[7px] text-[13px] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* View Meeting Modal */}
            {viewMeeting && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5 box-border"
                    onClick={() => setViewMeeting(null)}
                >
                    <div
                        className="w-[720px] max-w-full max-h-[90vh] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#282e45] bg-[#1c2136]">
                            <div className="flex items-center gap-3">
                                <h2 className="m-0 text-[18px] text-white font-semibold">
                                    Meeting Details
                                </h2>
                                <span className={`inline-block py-0.5 px-2.5 rounded-[20px] text-[11px] font-semibold capitalize ${getStatusBadgeClass(viewMeeting.status)}`}>
                                    {viewMeeting.status || "scheduled"}
                                </span>
                            </div>

                            <button
                                className="border-none bg-transparent text-[24px] leading-none text-[#8f9bb3] cursor-pointer w-8 h-8 rounded-md hover:bg-[#222942] hover:text-white flex items-center justify-center transition-colors"
                                onClick={() => setViewMeeting(null)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex flex-col gap-5">
                            {/* Title & Type */}
                            <div className="p-4 rounded-lg bg-[#111526] border border-[#282e45]">
                                <h3 className="m-0 text-white text-[18px] font-bold">
                                    {viewMeeting.meetingTitle}
                                </h3>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="text-[#8f9bb3] text-[13px]">
                                        Project: <span className="text-[#9fc5ff] font-medium">{getProjectName(viewMeeting.project)}</span>
                                    </span>
                                    <span className="text-[#4a5475]">•</span>
                                    <span className="text-[#8f9bb3] text-[13px]">
                                        Type: <span className="text-white font-medium">{viewMeeting.meetingType || "Video Call"}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Meeting ID
                                    </span>
                                    <span className="text-[14px] text-[#eef1f8] font-medium">
                                        {viewMeeting.meetingId || "-"}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Meeting Date
                                    </span>
                                    <span className="text-[14px] text-[#eef1f8]">
                                        {formatDate(viewMeeting.meetingDate)}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Time
                                    </span>
                                    <span className="text-[14px] text-[#eef1f8]">
                                        {formatTimeDisplay(viewMeeting.startTime, viewMeeting.endTime)}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Organizer
                                    </span>
                                    <span className="text-[14px] text-[#eef1f8]">
                                        {getUserName(viewMeeting.organizer || viewMeeting.createdBy)}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Participants
                                    </span>
                                    <span className="text-[14px] text-[#eef1f8]">
                                        {getUserName(viewMeeting.participants)}
                                    </span>
                                </div>
                            </div>

                            {/* Link / Location */}
                            {viewMeeting.meetingLink && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Link / Location
                                    </span>
                                    {viewMeeting.meetingLink.startsWith("http://") || viewMeeting.meetingLink.startsWith("https://") ? (
                                        <a
                                            href={viewMeeting.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#5865f2] hover:underline break-all text-[14px]"
                                        >
                                            {viewMeeting.meetingLink} ↗
                                        </a>
                                    ) : (
                                        <span className="text-[14px] text-[#eef1f8]">
                                            {viewMeeting.meetingLink}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Agenda */}
                            {viewMeeting.agenda && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Agenda
                                    </span>
                                    <p className="m-0 text-[14px] text-[#eef1f8] leading-relaxed whitespace-pre-wrap bg-[#111526] p-3 rounded-lg border border-[#282e45]">
                                        {viewMeeting.agenda}
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            {viewMeeting.description && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Description
                                    </span>
                                    <p className="m-0 text-[14px] text-[#cbd2e3] leading-relaxed whitespace-pre-wrap bg-[#111526] p-3 rounded-lg border border-[#282e45]">
                                        {viewMeeting.description}
                                    </p>
                                </div>
                            )}

                            {/* Meeting Notes */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] text-[#7f8aa5] font-semibold uppercase tracking-[0.04em]">
                                        Meeting Notes & Minutes
                                    </span>
                                    {!editingNotes && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingNotes(true)}
                                            className="border-none bg-transparent text-[#9fc5ff] text-[12px] hover:underline cursor-pointer"
                                        >
                                            ✏️ Edit Notes
                                        </button>
                                    )}
                                </div>

                                {editingNotes ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            rows={4}
                                            value={notesValue}
                                            onChange={(e) => setNotesValue(e.target.value)}
                                            className="w-full p-3 border border-[#30364d] rounded-lg bg-[#0f1322] text-white text-[13px] outline-none box-border focus:border-[#5969a8]"
                                            placeholder="Write meeting notes, conclusions, key points..."
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingNotes(false);
                                                    setNotesValue(viewMeeting.meetingNotes || "");
                                                }}
                                                className="py-1.5 px-3 border border-[#30364d] rounded bg-[#20253a] text-[#e8ebf5] text-[12px] cursor-pointer hover:bg-[#292f47]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveNotes}
                                                disabled={savingNotes}
                                                className="py-1.5 px-3 border-none rounded bg-[#5865f2] text-white text-[12px] font-semibold cursor-pointer hover:bg-[#4752c4] disabled:opacity-60"
                                            >
                                                {savingNotes ? "Saving..." : "Save Notes"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="m-0 text-[14px] text-[#eef1f8] leading-relaxed whitespace-pre-wrap bg-[#111526] p-3 rounded-lg border border-[#282e45]">
                                        {viewMeeting.meetingNotes || (
                                            <span className="text-[#7f8aa5] italic">No notes added yet. Click &quot;Edit Notes&quot; to add notes.</span>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between p-4 border-t border-[#282e45] bg-[#171b2e]">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#7f8aa5]">Status:</span>
                                <select
                                    value={viewMeeting.status || "scheduled"}
                                    onChange={(e) => handleQuickStatusChange(viewMeeting._id, e.target.value)}
                                    className="h-8 px-2.5 border border-[#30364d] rounded bg-[#0f1322] text-white text-[12px] outline-none cursor-pointer"
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const mId = viewMeeting._id;
                                        setViewMeeting(null);
                                        navigate(`/meetings/${mId}/edit`);
                                    }}
                                    className="py-1.5 px-3.5 border border-[#30364d] rounded bg-[#26354a] text-[#9fc5ff] text-[13px] font-medium hover:bg-[#30445f] cursor-pointer"
                                >
                                    Edit Meeting
                                </button>
                                <button
                                    onClick={() => setViewMeeting(null)}
                                    className="py-1.5 px-3.5 border border-[#30364d] rounded bg-[#20253a] text-[#e8ebf5] text-[13px] hover:bg-[#292f47] cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5 box-border"
                    onClick={() => !deleting && setDeleteTarget(null)}
                >
                    <div
                        className="w-[440px] max-w-full bg-[#171b2e] border border-[#30364d] rounded-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="m-0 text-white text-[18px] font-semibold">
                            Delete Meeting
                        </h3>
                        <p className="text-[#cbd2e3] text-[14px] mt-2 mb-4 leading-normal">
                            Are you sure you want to delete meeting &quot;<strong className="text-white">{deleteTarget.meetingTitle}</strong>&quot;? This action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="py-2.5 px-3 rounded bg-[#40252c] border border-[#5d303b] text-[#ff9da9] text-[13px] mb-4">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                                className="py-2 px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium hover:bg-[#292f47] cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="py-2 px-4 border-none rounded-[7px] bg-[#dc2626] text-white text-[13px] font-semibold hover:bg-[#b91c1c] cursor-pointer disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meeting;
