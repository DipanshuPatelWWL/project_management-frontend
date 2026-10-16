import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as timeLogService from "../../services/timeLogService";
import * as projectService from "../../services/projectService";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const getStatusBadgeClass = (status = "") => {
    const s = status.toLowerCase();
    if (s === "approved") {
        return "bg-[#1c3a2e] text-[#7fe3a8] border border-[#265340]";
    }
    if (s === "pending") {
        return "bg-[#3d2f1d] text-[#f5b358] border border-[#5a4325]";
    }
    if (s === "rejected") {
        return "bg-[#40252c] text-[#ff9da9] border border-[#5d303b]";
    }
    return "bg-[#222942] text-[#9fc5ff] border border-[#30364d]";
};

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

const selectBaseClass =
    "h-10 px-3 border border-[#30364d] rounded-lg bg-[#0f1322] text-white text-[13px] outline-none transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20";

const inputBaseClass =
    "w-full h-10 pl-9 pr-3 border border-[#30364d] rounded-lg bg-[#0f1322] text-white text-[13px] outline-none transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";

const TimeLog = () => {
    const navigate = useNavigate();

    const [timeLogs, setTimeLogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        project: "",
        status: "",
    });

    const [page, setPage] = useState(1);

    // Modals
    const [viewLog, setViewLog] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const fetchAllData = async () => {
        setLoading(true);
        setError("");

        try {
            const [logsRes, projsRes] = await Promise.all([
                timeLogService.getTimeLogs(),
                projectService.getProjects().catch(() => ({ projects: [] })),
            ]);

            const logList = Array.isArray(logsRes?.timeLogs)
                ? logsRes.timeLogs
                : Array.isArray(logsRes)
                ? logsRes
                : [];

            const projList = Array.isArray(projsRes?.projects)
                ? projsRes.projects
                : Array.isArray(projsRes)
                ? projsRes
                : [];

            setTimeLogs(logList);
            setProjects(projList);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load time logs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleClearFilters = () => {
        setFilters({
            search: "",
            project: "",
            status: "",
        });
        setPage(1);
    };

    // Filtered logs
    const filteredTimeLogs = useMemo(() => {
        return timeLogs.filter((log) => {
            const searchVal = filters.search.toLowerCase().trim();
            const idVal = (log.timeLogId || "").toLowerCase();
            const descVal = (log.description || log.Description || "").toLowerCase();
            const projName = (
                log.project?.projectName ||
                log.project?.name ||
                (typeof log.project === "string" ? log.project : "")
            ).toLowerCase();
            const taskName = (
                log.task?.taskTitle ||
                log.task?.title ||
                log.task?.name ||
                ""
            ).toLowerCase();
            const userName = (
                log.user
                    ? `${log.user.firstName || ""} ${log.user.lastName || ""}`
                    : ""
            ).toLowerCase();

            const matchesSearch =
                !searchVal ||
                idVal.includes(searchVal) ||
                descVal.includes(searchVal) ||
                projName.includes(searchVal) ||
                taskName.includes(searchVal) ||
                userName.includes(searchVal);

            const matchesProject =
                !filters.project ||
                log.project?._id === filters.project ||
                log.project === filters.project;

            const matchesStatus =
                !filters.status ||
                (log.status || "Logged").toLowerCase() === filters.status.toLowerCase();

            return matchesSearch && matchesProject && matchesStatus;
        });
    }, [timeLogs, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredTimeLogs.length / PAGE_SIZE) || 1;
    const paginatedTimeLogs = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredTimeLogs.slice(start, start + PAGE_SIZE);
    }, [filteredTimeLogs, page]);

    // Statistics counts
    const stats = useMemo(() => {
        const total = timeLogs.length;
        const totalHours = timeLogs.reduce((acc, curr) => acc + (Number(curr.hoursWorked) || 0), 0);
        const approved = timeLogs.filter((l) => (l.status || "").toLowerCase() === "approved").length;
        const pending = timeLogs.filter((l) => (l.status || "").toLowerCase() === "pending" || (l.status || "").toLowerCase() === "logged").length;
        return {
            total,
            totalHours: Math.round(totalHours * 10) / 10,
            approved,
            pending,
        };
    }, [timeLogs]);

    const handleEdit = (log) => {
        const targetId = log._id || log.timeLogId;
        navigate(`/timelogs/${targetId}/edit`);
    };

    const handleDeletePrompt = (log) => {
        setDeleteTarget(log);
        setDeleteError("");
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setDeleteError("");

        try {
            const targetId = deleteTarget._id || deleteTarget.timeLogId;
            await timeLogService.deleteTimeLog(targetId);

            setTimeLogs((prev) => prev.filter((l) => l._id !== deleteTarget._id));
            setSuccess(`Time log record was deleted.`);
            setDeleteTarget(null);

            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete time log."
            );
        } finally {
            setDeleting(false);
        }
    };

    const hasActiveFilters = Boolean(filters.search || filters.project || filters.status);

    return (
        <div className="p-7 max-sm:p-4 text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-[24px] font-semibold text-[#e8ebf5] tracking-tight">
                        Time Logs
                    </h1>
                    <p className="text-[13px] text-[#8f9ab5] mt-1">
                        Track, review, and manage billable and project work hours.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/timelogs/create")}
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                >
                    + Log Time
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4 mb-6">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Total Logs
                    </span>
                    <span className="text-[26px] font-bold text-white tracking-tight">
                        {stats.total}
                    </span>
                </div>
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Total Hours
                    </span>
                    <span className="text-[26px] font-bold text-[#5969a8] tracking-tight">
                        {stats.totalHours} <small className="text-[15px] font-normal text-[#8f9ab5]">hrs</small>
                    </span>
                </div>
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Approved Logs
                    </span>
                    <span className="text-[26px] font-bold text-[#34d399] tracking-tight">
                        {stats.approved}
                    </span>
                </div>
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Pending / Logged
                    </span>
                    <span className="text-[26px] font-bold text-[#f5b358] tracking-tight">
                        {stats.pending}
                    </span>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-[#2e151b] border border-[#ff8e9a]/30 text-[#ff8e9a] text-[13px] flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-[#ff8e9a] hover:text-white font-bold ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded-lg bg-[#132a21] border border-[#22c55e]/30 text-[#22c55e] text-[13px] flex items-center justify-between">
                    <span>{success}</span>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        className="text-[#22c55e] hover:text-white font-bold ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[240px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7f8aa5] pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, search: e.target.value }));
                                setPage(1);
                            }}
                            placeholder="Search by ID, project, task, developer, notes..."
                            className={inputBaseClass}
                        />
                    </div>

                    {/* Project */}
                    <div className="w-[180px] max-sm:w-full">
                        <select
                            value={filters.project}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, project: e.target.value }));
                                setPage(1);
                            }}
                            className={`${selectBaseClass} w-full`}
                        >
                            <option value="">All Projects</option>
                            {projects.map((p) => {
                                const id = p._id || p.id;
                                const name = p.projectName || p.name || id;
                                return (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="w-[160px] max-sm:w-full">
                        <select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, status: e.target.value }));
                                setPage(1);
                            }}
                            className={`${selectBaseClass} w-full`}
                        >
                            <option value="">All Statuses</option>
                            <option value="Logged">Logged</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="h-10 px-3.5 border border-[#30364d] rounded-lg bg-[#222942] hover:bg-[#2b3454] text-[#cbd2e3] hover:text-white text-[13px] font-medium transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Content Table / Empty State */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px] bg-[#171b2e] border border-[#282e45] rounded-xl">
                    <Loader />
                </div>
            ) : filteredTimeLogs.length === 0 ? (
                <div className="p-12 text-center bg-[#171b2e] border border-[#282e45] rounded-xl">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#202742] flex items-center justify-center text-[#9fc5ff]">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#e8ebf5] mb-1">
                        No time logs found
                    </h3>
                    <p className="text-[13px] text-[#8f9ab5] max-w-sm mx-auto mb-5">
                        {timeLogs.length === 0
                            ? "No hours have been logged yet. Record your first work session."
                            : "No time logs match the selected filter criteria."}
                    </p>
                    {timeLogs.length === 0 ? (
                        <button
                            type="button"
                            onClick={() => navigate("/timelogs/create")}
                            className="inline-flex items-center gap-2 h-9 px-4 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-[13px] font-medium transition-colors"
                        >
                            Log Work Time
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 h-9 px-4 bg-[#222942] hover:bg-[#2b3454] border border-[#30364d] text-[#cbd2e3] rounded-lg text-[13px] font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                        <table className="w-full min-w-[950px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        TimeLog ID
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Project
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Task / Activity
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Work Date
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Hours
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Logged By
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
                                {paginatedTimeLogs.map((log) => {
                                    const taskDisplay =
                                        log.task?.taskTitle ||
                                        log.task?.title ||
                                        log.task?.name ||
                                        (log.sprint?.sprintName ? `Sprint: ${log.sprint.sprintName}` : "General Work");

                                    return (
                                        <tr
                                            key={log._id}
                                            className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0"
                                        >
                                            {/* TimeLog ID */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {log.timeLogId || "-"}
                                            </td>

                                            {/* Project */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                    {getProjectName(log.project)}
                                                </span>
                                            </td>

                                            {/* Task / Activity */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] max-w-[240px]">
                                                <span className="block text-white text-[14px] font-semibold truncate">
                                                    {taskDisplay}
                                                </span>
                                                {(log.description || log.Description) && (
                                                    <small className="block text-[#7f8aa5] text-[12px] truncate mt-0.5">
                                                        {log.description || log.Description}
                                                    </small>
                                                )}
                                            </td>

                                            {/* Work Date */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {formatDate(log.workDate)}
                                            </td>

                                            {/* Hours Worked */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-0.5 px-2 bg-[#20253a] border border-[#30364d] rounded text-[#cbd2e3] text-[13px] font-mono font-semibold">
                                                    {log.hoursWorked} hrs
                                                </span>
                                            </td>

                                            {/* Logged By */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-6 h-6 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {getUserName(log.user).charAt(0)}
                                                    </span>
                                                    <span className="text-[#cbd2e3] text-[13px]">
                                                        {getUserName(log.user)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-medium capitalize ${getStatusBadgeClass(log.status)}`}>
                                                    {log.status || "Logged"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-[7px]">
                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                        onClick={() => setViewLog(log)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                        onClick={() => handleEdit(log)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] font-medium hover:bg-[#522d36]"
                                                        onClick={() => handleDeletePrompt(log)}
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
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between flex-wrap gap-4 mt-5 px-1">
                            <span className="text-[13px] text-[#8f9ab5]">
                                Showing{" "}
                                <span className="font-medium text-white">
                                    {(page - 1) * PAGE_SIZE + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-white">
                                    {Math.min(page * PAGE_SIZE, filteredTimeLogs.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-white">
                                    {filteredTimeLogs.length}
                                </span>{" "}
                                records
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-8 px-3 rounded-md border border-[#30364d] bg-[#171b2e] hover:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[12px] text-[#cbd2e3] font-medium transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-[12px] text-[#8f9ab5] px-2 font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="h-8 px-3 rounded-md border border-[#30364d] bg-[#171b2e] hover:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[12px] text-[#cbd2e3] font-medium transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* View Modal */}
            {viewLog && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5 box-border"
                >
                    <div
                        className="bg-[#171b2e] border border-[#282e45] rounded-xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#282e45]">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[12px] font-mono font-bold text-[#9fc5ff] bg-[#202742] px-2 py-0.5 rounded">
                                        {viewLog.timeLogId || "TL-RECORD"}
                                    </span>
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${getStatusBadgeClass(viewLog.status)}`}>
                                        {viewLog.status || "Logged"}
                                    </span>
                                    <span className="text-[12px] font-mono text-[#cbd2e3] bg-[#222942] px-2 py-0.5 rounded">
                                        {viewLog.hoursWorked} hrs
                                    </span>
                                </div>
                                <h2 className="text-[19px] font-bold text-[#e8ebf5] leading-snug">
                                    {getProjectName(viewLog.project)}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewLog(null)}
                                className="text-[#8f9ab5] hover:text-white transition-colors p-1 rounded hover:bg-[#20253d]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 py-5 border-b border-[#282e45] text-[13px]">
                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Project</span>
                                <span className="font-semibold text-white">
                                    {getProjectName(viewLog.project)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Work Date</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {formatDate(viewLog.workDate)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Sprint</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {viewLog.sprint?.sprintName || "-"}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Task</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {viewLog.task?.taskTitle || viewLog.task?.title || "-"}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Logged By</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {getUserName(viewLog.user)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Logged At</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {formatDate(viewLog.createdAt)}
                                </span>
                            </div>
                        </div>

                        {(viewLog.description || viewLog.Description) && (
                            <div className="py-4 border-b border-[#282e45]">
                                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#8f9ab5] block mb-2">
                                    Work Notes & Summary
                                </span>
                                <p className="text-[13px] text-[#cbd2e3] whitespace-pre-wrap leading-relaxed bg-[#0f1322] p-3.5 rounded-lg border border-[#282e45]">
                                    {viewLog.description || viewLog.Description}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    const log = viewLog;
                                    setViewLog(null);
                                    handleEdit(log);
                                }}
                                className="h-10 px-4 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 text-[#f5b358]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Log
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewLog(null)}
                                className="h-10 px-5 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1100] p-5"
                >
                    <div
                        className="bg-[#171b2e] border border-[#282e45] rounded-xl max-w-[460px] w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#3d1822] text-[#ff8e9a] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[17px] font-semibold text-white">
                                    Delete Time Log
                                </h3>
                                <p className="text-[12px] text-[#8f9ab5]">
                                    TimeLog ID: {deleteTarget.timeLogId || "-"}
                                </p>
                            </div>
                        </div>

                        <p className="text-[13px] text-[#cbd2e3] leading-relaxed mb-6">
                            Are you sure you want to delete this {deleteTarget.hoursWorked} hrs work record for{" "}
                            <span className="font-semibold text-white">"{getProjectName(deleteTarget.project)}"</span>?
                            This action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-[#2e151b] border border-[#ff8e9a]/30 text-[#ff8e9a] text-[12px] rounded-lg">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                                className="h-9 px-4 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                                className="h-9 px-4 rounded-lg bg-[#e11d48] hover:bg-[#be123c] text-white text-[13px] font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Time Log"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeLog;
