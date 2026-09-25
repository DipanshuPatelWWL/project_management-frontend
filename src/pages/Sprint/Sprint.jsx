import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as sprintService from "../../services/sprintService";
import * as projectService from "../../services/projectService";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const Sprint = () => {
    const navigate = useNavigate();

    const [sprints, setSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        project: "",
        status: "",
    });

    const [page, setPage] = useState(1);

    // Popup modal states (same pattern as Client & Project)
    const [viewSprint, setViewSprint] = useState(null);
    const [deleteSprint, setDeleteSprint] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        setError("");

        try {
            const [sprintData, projectData] = await Promise.all([
                sprintService.getSprints(),
                projectService.getProjects().catch(() => ({ projects: [] })),
            ]);

            setSprints(sprintData.sprints || sprintData || []);
            setProjects(projectData.projects || projectData || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not load sprints."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Filter sprints based on search, project, and status
    const filteredSprints = useMemo(() => {
        return sprints.filter((sprint) => {
            const searchValue = filters.search.toLowerCase().trim();
            const sprintIdValue = (sprint.sprintId || "").toLowerCase();
            const sprintName = (sprint.sprintName || "").toLowerCase();
            const sprintGoal = (sprint.sprintgoal || "").toLowerCase();

            const matchesSearch =
                !searchValue ||
                sprintIdValue.includes(searchValue) ||
                sprintName.includes(searchValue) ||
                sprintGoal.includes(searchValue);

            const projectIdValue =
                typeof sprint.project === "object" && sprint.project !== null
                    ? sprint.project._id
                    : sprint.project || "";

            const matchesProject =
                !filters.project || projectIdValue === filters.project;

            const sprintStatus = (sprint.status || "planning").toLowerCase();
            const matchesStatus =
                !filters.status || sprintStatus === filters.status.toLowerCase();

            return matchesSearch && matchesProject && matchesStatus;
        });
    }, [sprints, filters]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredSprints.length / PAGE_SIZE));
    const paginatedSprints = filteredSprints.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    // Statistics metrics
    const totalSprints = sprints.length;
    const activeSprints = sprints.filter(
        (s) => s.status?.toLowerCase() === "active"
    ).length;
    const completedSprints = sprints.filter(
        (s) => s.status?.toLowerCase() === "completed"
    ).length;

    const totalStoryPoints = sprints.reduce(
        (sum, s) => sum + (Number(s.totalStoryPoints) || 0),
        0
    );
    const completedStoryPoints = sprints.reduce(
        (sum, s) => sum + (Number(s.completedStoryPoints) || 0),
        0
    );

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    // Quick Start Sprint
    const handleStartSprint = async (sprintItem) => {
        try {
            setError("");
            const res = await sprintService.startSprint(sprintItem._id);
            const updated = res.sprint || res;

            setSprints((prev) =>
                prev.map((s) => (s._id === sprintItem._id ? updated : s))
            );
            setSuccess(`Sprint "${sprintItem.sprintName}" is now active!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to start sprint."
            );
        }
    };

    // Quick Complete Sprint
    const handleCompleteSprint = async (sprintItem) => {
        try {
            setError("");
            const res = await sprintService.completeSprint(sprintItem._id);
            const updated = res.sprint || res;

            setSprints((prev) =>
                prev.map((s) => (s._id === sprintItem._id ? updated : s))
            );
            setSuccess(`Sprint "${sprintItem.sprintName}" completed!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to complete sprint."
            );
        }
    };

    // Confirm Delete
    const handleDelete = async () => {
        if (!deleteSprint) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await sprintService.deleteSprint(deleteSprint._id);

            setSprints((prev) =>
                prev.filter((s) => s._id !== deleteSprint._id)
            );

            if (viewSprint?._id === deleteSprint._id) {
                setViewSprint(null);
            }

            setDeleteSprint(null);
            setSuccess("Sprint deleted successfully.");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message || "Could not delete sprint."
            );
        } finally {
            setDeleting(false);
        }
    };

    // Helpers
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

    const getProjectName = (proj) => {
        if (!proj) return "-";
        if (typeof proj === "string") return proj;
        return proj.projectName || "-";
    };

    const getUserName = (user) => {
        if (!user) return "System";
        if (typeof user === "string") return user;
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return name || user.name || user.email || "User";
    };

    const getSprintStatusBadgeClass = (status = "planning") => {
        const s = status.toLowerCase();
        if (s === "active" || s === "completed") {
            return "bg-[#1c3a2e] text-[#7fe3a8]";
        }
        if (s === "cancelled") {
            return "bg-[#40252c] text-[#ff9da9]";
        }
        return "bg-[#3d3520] text-[#f2c96d]";
    };

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Sprints</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">Manage sprints, objectives, timeline, and deliverables.</p>
                </div>

                <button
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                    onClick={() => navigate("/sprints/create")}
                >
                    + Add Sprint
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-[18px] mb-[25px]">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Sprints</span>
                    <strong className="text-white text-[26px] font-bold">{totalSprints}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Active Sprints</span>
                    <strong className="text-white text-[26px] font-bold">{activeSprints}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Completed Sprints</span>
                    <strong className="text-white text-[26px] font-bold">{completedSprints}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Story Points</span>
                    <strong className="text-white text-[26px] font-bold">
                        {completedStoryPoints} / {totalStoryPoints} SP
                    </strong>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap max-md:flex-col max-md:items-stretch">
                <input
                    type="text"
                    className="flex-1 min-w-[220px] h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                    placeholder="Search sprint name, goal..."
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
                    className="h-[42px] min-w-[160px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {(filters.search || filters.project || filters.status) && (
                    <button
                        className="h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-[#8f9bb3] text-[13px] cursor-pointer transition-all duration-200 hover:bg-[#222942] hover:text-white hover:border-[#454d6e]"
                        onClick={() =>
                            handleFiltersChange({
                                search: "",
                                project: "",
                                status: "",
                            })
                        }
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Error & Success Messages */}
            {error && <p className="text-[#ff8e9a] bg-[#2a1518] border border-[#7f1d1d] rounded-lg py-3 px-4 mb-5 text-[14px]">{error}</p>}
            {success && <p className="text-[#86efac] bg-[#14251b] border border-[#166534] rounded-lg py-3 px-4 mb-5 text-[14px]">{success}</p>}

            {/* Loading */}
            {loading && <Loader />}

            {/* Table */}
            {!loading && !error && (
                <>
                    {paginatedSprints.length === 0 ? (
                        <p className="text-[#8f9bb3] text-[15px] py-[30px] text-center">No sprints found.</p>
                    ) : (
                        <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Sprint ID</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Sprint Name</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Project</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Status</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Progress</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Tasks</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Story Points</th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedSprints.map((sprint) => {
                                        const progress = Number(sprint.progress) || 0;
                                        const status = (sprint.status || "planning").toLowerCase();

                                        return (
                                            <tr key={sprint._id} className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0">
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span className="inline-block py-1 px-[9px] bg-[#202742] border border-[#313d66] rounded-[6px] text-[#9fc5ff] text-[12px] font-semibold tracking-[0.03em]">
                                                        {sprint.sprintId || "-"}
                                                    </span>
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap capitalize">
                                                    <strong className="block text-white text-[14px] mb-[3px]">{sprint.sprintName}</strong>
                                                    <small className="block text-[#7f8aa5] text-[12px] max-w-[260px] truncate">{sprint.sprintgoal || "No goal specified"}</small>
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                        {getProjectName(sprint.project)}
                                                    </span>
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getSprintStatusBadgeClass(status)}`}>
                                                        {sprint.status || "planning"}
                                                    </span>
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <div className="min-w-[100px]">
                                                        <div className="flex justify-between text-[11px] font-semibold text-[#8f9bb3] mb-1">
                                                            <span>{progress}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-[#0f1322] border border-[#30364d] rounded-[4px] overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-[4px] transition-[width] duration-300 ${progress >= 100 ? "bg-[#7fe3a8]" : "bg-[#5865f2]"}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    {Number(sprint.completedTasks) || 0} / {Number(sprint.totalTasks) || 0}
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    {Number(sprint.completedStoryPoints) || 0} / {Number(sprint.totalStoryPoints) || 0} SP
                                                </td>

                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <div className="flex items-center gap-[7px] whitespace-nowrap">
                                                        <button
                                                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                            onClick={() => setViewSprint(sprint)}
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                            onClick={() =>
                                                                navigate(`/sprints/${sprint._id}/edit`)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        {status === "planning" && (
                                                            <button
                                                                className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#1c3a2e] text-[#7fe3a8] font-medium hover:bg-[#275241]"
                                                                onClick={() => handleStartSprint(sprint)}
                                                            >
                                                                Start
                                                            </button>
                                                        )}

                                                        {status === "active" && (
                                                            <button
                                                                className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#253150] text-[#9fc5ff] font-medium hover:bg-[#33436d]"
                                                                onClick={() => handleCompleteSprint(sprint)}
                                                            >
                                                                Complete
                                                            </button>
                                                        )}

                                                        <button
                                                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] hover:bg-[#563039]"
                                                            onClick={() => {
                                                                setDeleteSprint(sprint);
                                                                setDeleteError("");
                                                            }}
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
                    )}

                    {/* Pagination */}
                    {filteredSprints.length > 0 && (
                        <div className="flex items-center justify-center gap-[18px] mt-5">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer transition-colors duration-200 hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                            >
                                Previous
                            </button>

                            <span className="text-[13px] font-medium !text-[#8f9bb3]">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer transition-colors duration-200 hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* View Sprint Details Modal Popup */}
            {viewSprint && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5"
                    onClick={() => setViewSprint(null)}
                >
                    <div
                        className="w-full max-w-[650px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">Sprint Details</h2>
                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() => setViewSprint(null)}
                            >
                                ×
                            </button>
                        </div>
             
                        <div className="p-[1px] grid grid-cols-2 max-[900px]:grid-cols-1 gap-[1px] bg-[#282e45]">
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Sprint ID</strong>
                                <span className="inline-block py-1 px-[9px] bg-[#202742] border border-[#313d66] rounded-[6px] text-[#9fc5ff] text-[12px] font-semibold tracking-[0.03em] w-fit">{viewSprint.sprintId || "-"}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Project</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">{getProjectName(viewSprint.project)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                <strong className="text-[#7f8aa5] text-[12px]">Sprint Name</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">{viewSprint.sprintName}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                <strong className="text-[#7f8aa5] text-[12px]">Sprint Goal</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">{viewSprint.sprintgoal || "No goal specified"}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Status</strong>
                                <span>
                                    <span
                                        className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getSprintStatusBadgeClass(viewSprint.status)}`}
                                    >
                                        {viewSprint.status || "planning"}
                                    </span>
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Start Date</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">{formatDate(viewSprint.startDate)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">End Date</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">{formatDate(viewSprint.endDate)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Progress</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">{Number(viewSprint.progress) || 0}%</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Tasks</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {Number(viewSprint.completedTasks) || 0} completed / {Number(viewSprint.totalTasks) || 0} total
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Story Points</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {Number(viewSprint.completedStoryPoints) || 0} / {Number(viewSprint.totalStoryPoints) || 0} SP
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Created By</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">{getUserName(viewSprint.createdBy)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Created At</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewSprint.createdAt
                                        ? new Date(viewSprint.createdAt).toLocaleString()
                                        : "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Last Updated By</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">{getUserName(viewSprint.updatedBy || viewSprint.createdBy)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Last Updated At</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewSprint.updatedAt
                                        ? new Date(viewSprint.updatedAt).toLocaleString()
                                        : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Sprint Modal Popup */}
            {deleteSprint && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5"
                    onClick={() => setDeleteSprint(null)}
                >
                    <div
                        className="w-full max-w-[450px] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-y-visible"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">Delete Sprint</h2>
                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() => setDeleteSprint(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[22px]">
                            <p className="text-[#dfe3ee] text-[14px] leading-[1.6] m-0">
                                Are you sure you want to delete{" "}
                                <strong className="text-white font-semibold">"{deleteSprint.sprintName}"</strong>?
                            </p>
                            <p className="!text-[#ff9da9] text-[13px] !mt-2.5">
                                This action cannot be undone.
                            </p>

                            {deleteError && (
                                <p className="!text-[#ff8e9a] text-[13px] !mt-3">{deleteError}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">
                            <button
                                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#282e45] text-[#dfe3ee] hover:bg-[#343b55] transition-colors duration-200"
                                onClick={() => setDeleteSprint(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#a83d4c] text-white hover:bg-[#c04b5b] transition-colors duration-200"
                                onClick={handleDelete}
                                disabled={deleting}
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

export default Sprint;
