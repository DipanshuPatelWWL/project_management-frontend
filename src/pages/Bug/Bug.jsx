import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as bugService from "../../services/bugService";
import * as projectService from "../../services/projectService";
import * as sprintService from "../../services/sprintService";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const getFileUrl = (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== "string") return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return fileUrl;
    }
    const normalized = fileUrl.replace(/\\/g, "/");
    const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${API_BASE_URL}${clean}`;
};

const isImageFile = (url) => {
    if (!url || typeof url !== "string") return false;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)($|\?)/i.test(url);
};


const Bug = () => {
    const navigate = useNavigate();

    const [bugs, setBugs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        project: "",
        sprint: "",
        status: "",
        severity: "",
        priority: "",
    });

    const [page, setPage] = useState(1);

     
    const [viewBug, setViewBug] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        setError("");

        try {
            const [bugsRes, projectsRes, sprintsRes] = await Promise.all([
                bugService.getBugs(),
                projectService.getProjects().catch(() => ({ projects: [] })),
                sprintService.getSprints().catch(() => ({ sprints: [] })),
            ]);

            setBugs(bugsRes.bugs || bugsRes || []);
            setProjects(projectsRes.projects || projectsRes || []);
            setSprints(sprintsRes.sprints || sprintsRes || []);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load bugs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);
   
    const handleFiltersChange  = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    

    // Filter bugs
    const filteredBugs = useMemo(() => {
        return bugs.filter((b) => {
            const searchVal = filters.search.toLowerCase().trim();
            const idVal = (b.bugId || (b._id ? `bug-${String(b._id).slice(-4)}` : "")).toLowerCase();
            const titleVal = (b.bugTitle || "").toLowerCase();
            const descVal = (b.description || "").toLowerCase();
            const stepsVal = (b.stepsToReproduce || "").toLowerCase();

            const matchesSearch =
                !searchVal ||
                idVal.includes(searchVal) ||
                titleVal.includes(searchVal) ||
                descVal.includes(searchVal) ||
                stepsVal.includes(searchVal);
             

            const projectId =
                typeof b.project === "object" && b.project !== null
                    ? b.project._id
                    : b.project || "";
            const matchesProject = !filters.project || String(projectId) === String(filters.project);

            const sprintId =
                typeof b.sprint === "object" && b.sprint !== null
                    ? b.sprint._id
                    : b.sprint || "";
            const matchesSprint = !filters.sprint || String(sprintId) === String(filters.sprint);

            const matchesStatus =
                !filters.status ||
                (b.status || "").toLowerCase() === filters.status.toLowerCase();
            
            const matchesSeverity =
                !filters.severity ||
                (b.severity || "").toLowerCase() === filters.severity.toLowerCase();
            
            const matchesPriority =
                !filters.priority ||
                (b.priority || "").toLowerCase() === filters.priority.toLowerCase();

            return (
                matchesSearch &&
                matchesProject &&
                matchesSprint &&
                matchesStatus &&
                matchesSeverity &&
                matchesPriority
            );
        });
    }, [bugs, filters]);

    // Available sprints filtered by selected project
    const availableSprints = useMemo(() => {
        if (!filters.project) return sprints;
        return sprints.filter((s) => {
            const pId =
                typeof s.project === "object" && s.project !== null
                    ? s.project._id
                    : s.project || "";
            return String(pId) === String(filters.project);
        });
    }, [sprints, filters.project]);

    // Metrics calculations
    const totalBugs = bugs.length;
    const openBugs = bugs.filter((b) => {
        const s = (b.status || "").toLowerCase();
        return s === "open" || s === "reopened";
    }).length;
    const inProgressBugs = bugs.filter(
        (b) => (b.status || "").toLowerCase() === "in-progress"
    ).length;
    const resolvedBugs = bugs.filter((b) => {
        const s = (b.status || "").toLowerCase();
        return s === "resolved" || s === "closed";
    }).length;

    // Pagination
    const totalPages = Math.ceil(filteredBugs.length / PAGE_SIZE) || 1;
    const paginatedBugs = filteredBugs.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    // Helpers
    const getProjectName = (proj) => {
        if (!proj) return "-";
        if (typeof proj === "string") return proj;
        return proj.projectName || proj.name || "-";
    };

    const getSprintName = (sprint) => {
        if (!sprint) return "-";
        if (typeof sprint === "string") return sprint;
        return sprint.sprintName || sprint.name || "-";
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

    // Badge styling helpers
    const getStatusBadgeClass = (status = "open") => {
        const s = status.toLowerCase();
        if (s === "resolved") return "bg-[#1c3a2e] text-[#7fe3a8] border border-[#265340]";
        if (s === "closed") return "bg-[#252a42] text-[#cbd2e3] border border-[#353d5e]";
        if (s === "in-progress") return "bg-[#3d2f1d] text-[#f5b358] border border-[#5a4325]";
        if (s === "reopened") return "bg-[#40252c] text-[#ff9da9] border border-[#5d303b]";
        return "bg-[#1f3554] text-[#9fc5ff] border border-[#2b4c7e]"; // open
    };

    const getSeverityBadgeClass = (severity = "medium") => {
        const s = severity.toLowerCase();
        if (s === "critical") return "bg-[#40252c] text-[#ff9da9] border border-[#5d303b]";
        if (s === "high") return "bg-[#3d271d] text-[#ffb076] border border-[#5c3722]";
        if (s === "low") return "bg-[#1c3a2e] text-[#7fe3a8] border border-[#265340]";
        return "bg-[#1f3554] text-[#9fc5ff] border border-[#2b4c7e]"; // medium
    };

    const getPriorityBadgeClass = (priority = "medium") => {
        const p = priority.toLowerCase();
        if (p === "critical") return "bg-[#40252c] text-[#ff9da9]";
        if (p === "high") return "bg-[#3d271d] text-[#ffb076]";
        if (p === "low") return "bg-[#1c3a2e] text-[#7fe3a8]";
        return "bg-[#1f3554] text-[#9fc5ff]"; // medium
    };

    // Quick workflow status change
    const handleQuickStatusChange = async (bugId, newStatus) => {
        try {
            setError("");
            await bugService.changeBugStatus(bugId, newStatus);
            setBugs((prev) =>
                prev.map((b) => (b._id === bugId ? { ...b, status: newStatus } : b))
            );
            if (viewBug && viewBug._id === bugId) {
                setViewBug((prev) => ({ ...prev, status: newStatus }));
            }
            setSuccess(`Bug status updated to ${newStatus}!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update bug status.");
        }
    };

    // Delete bug
    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await bugService.deleteBug(deleteTarget._id);
            setBugs((prev) => prev.filter((b) => b._id !== deleteTarget._id));
            setDeleteTarget(null);
            setSuccess("Bug ticket deleted successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to delete bug.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Bugs</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                        Track defect lifecycle, severity triage, reproduction steps, and resolutions.
                    </p>
                </div>

                <button
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                    onClick={() => navigate("/bugs/create")}
                >
                    + Add Bug
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-[18px] mb-[25px]">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Bugs</span>
                    <strong className="text-white text-[26px] font-bold">{totalBugs}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Open / Reopened</span>
                    <strong className="text-white text-[26px] font-bold">{openBugs}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">In Progress</span>
                    <strong className="text-white text-[26px] font-bold">{inProgressBugs}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Resolved / Closed</span>
                    <strong className="text-white text-[26px] font-bold">{resolvedBugs}</strong>
                </div>
            </div>


            {/* Filters Bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap max-md:flex-col max-md:items-stretch">
                <input
                    type="text"
                    className="flex-1 min-w-[220px] h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                    placeholder="Search by bug title, ID, project, description..."
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
                            sprint: "",
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
                    value={filters.sprint}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            sprint: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[150px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Sprints</option>
                    {availableSprints.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.sprintName}
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
                    className="h-[42px] min-w-[130px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="reopened">Reopened</option>
                </select>

                <select
                    value={filters.severity}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            severity: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[130px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            priority: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[130px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                {(filters.search || filters.project || filters.sprint || filters.status || filters.severity || filters.priority) && (
                    <button
                        onClick={() =>
                            handleFiltersChange({
                                search: "",
                                project: "",
                                sprint: "",
                                status: "",
                                severity: "",
                                priority: "",
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
            ) : filteredBugs.length === 0 ? (
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-[50px] text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-2xl font-bold">
                        🐛
                    </div>
                    <h3 className="m-0 text-white text-[18px] font-semibold mb-2">No Bugs Found</h3>
                    <p className="m-0 text-[#8f9bb3] text-[14px] max-w-[420px] mx-auto mb-5">
                        No defect tickets match your search or filter criteria. Report any bugs you encounter to keep track of quality.
                    </p>
                    <button
                        onClick={() => navigate("/bugs/create")}
                        className="border-none rounded-lg py-2.5 px-5 bg-[#5865f2] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#4752c4] transition-colors"
                    >
                        + Report New Bug
                    </button>
                </div>
            ) : (
                <>
                    <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                        <table className="w-full min-w-[950px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Bug ID
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Bug Title
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Project
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Sprint
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Reported By
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Assigned To
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Severity
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Priority
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
                                {paginatedBugs.map((bug) => {
                                    const status = (bug.status || "open").toLowerCase();
                                    const severity = (bug.severity || "medium").toLowerCase();
                                    const priority = (bug.priority || "medium").toLowerCase();
                                    const attCount = bug.attachments?.length || 0;

                                    // Next workflow status helper
                                    let nextStatus = null;
                                    let nextStatusLabel = "";
                                    if (status === "open") {
                                        nextStatus = "in-progress";
                                        nextStatusLabel = "Start Progress";
                                    } else if (status === "in-progress") {
                                        nextStatus = "resolved";
                                        nextStatusLabel = "Mark Resolved";
                                    } else if (status === "resolved") {
                                        nextStatus = "closed";
                                        nextStatusLabel = "Close Bug";
                                    }
    
                                    return (
                                        <tr
                                            key={bug._id}
                                            className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0"
                                        >
                                            {/* Bug ID */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {bug.bugId || "-"}
                                            </td>

                                            {/* Bug Title */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] max-w-[260px]">
                                                <span className="block text-white text-[14px] font-semibold truncate">
                                                    {bug.bugTitle}
                                                </span>
                                                <small className="block text-[#7f8aa5] text-[12px] truncate mt-0.5 max-w-[240px]">
                                                    {bug.description || "No description provided"}
                                                </small>
                                            </td>

                                            {/* Project */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                    {getProjectName(bug.project)}
                                                </span>
                                            </td>

                                            {/* Sprint */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                    {getSprintName(bug.sprint)}
                                                </span>
                                            </td>

                                            {/* Reported By */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-6 h-6 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {getUserName(bug.reportedBy).charAt(0)}
                                                    </span>
                                                    <span className="text-[#cbd2e3] text-[13px]">
                                                        {getUserName(bug.reportedBy)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Assigned To */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {bug.assignedTo ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-6 h-6 rounded-full bg-[#1c3a2e] text-[#7fe3a8] flex items-center justify-center text-[10px] font-bold uppercase">
                                                            {getUserName(bug.assignedTo).charAt(0)}
                                                        </span>
                                                        <span className="text-[#cbd2e3] text-[13px]">
                                                            {getUserName(bug.assignedTo)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#7f8aa5] text-[12px] italic">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            {/* Severity */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-semibold capitalize ${getSeverityBadgeClass(severity)}`}>
                                                    {severity}
                                                </span>
                                            </td>

                                            {/* Priority */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-semibold capitalize ${getPriorityBadgeClass(priority)}`}>
                                                    {priority}
                                                </span>
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
                                                            onClick={() => handleQuickStatusChange(bug._id, nextStatus)}
                                                            title={`Advance workflow to ${nextStatus}`}
                                                        >
                                                            ➔ {nextStatusLabel}
                                                        </button>
                                                    )}

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                        onClick={() => setViewBug(bug)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                        onClick={() => navigate(`/bugs/${bug._id}/edit`)}
                                                    >
                                                        Edit
                                                    </button> 

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] font-medium hover:bg-[#522d36]"
                                                        onClick={() => setDeleteTarget(bug)}
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
                    {filteredBugs.length > 0 && (
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

            {/* View Bug Details Modal Popup (Exact pattern as Task & Sprint) */}
            {viewBug && (
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">
                    <div className="w-full max-w-[700px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">
                                Bug Details #{viewBug.bugId || viewBug._id.slice(-6).toUpperCase()}
                            </h2>
                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() => setViewBug(null)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Workflow Lifecycle Transition Bar */}
                        <div className="p-4 bg-[#0f1322] border-b border-[#282e45]">
                            <span className="text-[#8f9bb3] text-[11px] font-semibold uppercase tracking-wider block mb-2">
                                Lifecycle Workflow Stages
                            </span>
                            <div className="grid grid-cols-4 max-[600px]:grid-cols-2 gap-2">
                                {[
                                    { key: "open", label: "Open" },
                                    { key: "in-progress", label: "In Progress" },
                                    { key: "resolved", label: "Resolved" },
                                    { key: "closed", label: "Closed" },
                                ].map((stage, idx) => {
                                    const current = (viewBug.status || "open").toLowerCase();
                                    const isCurrent = current === stage.key;
                                    return (
                                        <button
                                            key={stage.key}
                                            onClick={() => handleQuickStatusChange(viewBug._id, stage.key)}
                                            className={`py-1.5 px-2 rounded-lg text-[12px] font-medium border text-center transition-colors cursor-pointer ${
                                                isCurrent
                                                    ? "bg-[#5865f2] text-white border-[#5865f2] font-bold"
                                                    : "bg-[#171b2e] text-[#8f9bb3] border-[#282e45] hover:text-white hover:border-[#4a5475]"
                                            }`}
                                        >
                                            <span className="block text-[10px] opacity-70">Step {idx + 1}</span>
                                            {stage.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-[1px] grid grid-cols-2 max-[900px]:grid-cols-1 gap-[1px] bg-[#282e45]">
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Bug ID</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewBug.bugId || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Bug Title</strong>
                                <span className="text-[#eef1f8] text-[14px] font-semibold break-words">
                                    {viewBug.bugTitle}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Project</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getProjectName(viewBug.project)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Sprint</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getSprintName(viewBug.sprint)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Associated Task</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewBug.task?.taskTitle || (typeof viewBug.task === "string" ? viewBug.task : "-")}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Reported By</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getUserName(viewBug.reportedBy)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Assigned To</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getUserName(viewBug.assignedTo)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Severity</strong>
                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-semibold capitalize w-fit ${getSeverityBadgeClass(viewBug.severity || "medium")}`}>
                                    {viewBug.severity || "medium"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Priority</strong>
                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-semibold capitalize w-fit ${getPriorityBadgeClass(viewBug.priority || "medium")}`}>
                                    {viewBug.priority || "medium"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Status</strong>
                                <span className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize w-fit ${getStatusBadgeClass(viewBug.status || "open")}`}>
                                    {viewBug.status || "open"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Created At</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {formatDate(viewBug.createdAt)}
                                </span>
                            </div>

                            {viewBug.resolvedDate && (
                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                    <strong className="text-[#7fe3a8] text-[12px]">Resolved Date</strong>
                                    <span className="text-[#7fe3a8] text-[14px] font-medium">
                                        {formatDate(viewBug.resolvedDate)}
                                    </span>
                                </div>
                            )}

                            {/* Description */}
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                <strong className="text-[#7f8aa5] text-[12px]">Description</strong>
                                <p className="text-[#eef1f8] text-[13px] leading-[1.6] m-0 whitespace-pre-line">
                                    {viewBug.description || "No description provided."}
                                </p>
                            </div>

                            {/* Steps to Reproduce */}
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                <strong className="text-[#7f8aa5] text-[12px]">Steps to Reproduce</strong>
                                <p className="text-[#eef1f8] text-[13px] leading-[1.6] m-0 whitespace-pre-line font-mono bg-[#0f1322] p-3 rounded border border-[#282e45]">
                                    {viewBug.stepsToReproduce || "No reproduction steps provided."}
                                </p>
                            </div>

                            {/* Expected Result */}
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7fe3a8] text-[12px]">Expected Result</strong>
                                <p className="text-[#eef1f8] text-[13px] leading-[1.6] m-0 whitespace-pre-line bg-[#0f1322] p-3 rounded border border-[#1c3a2e]">
                                    {viewBug.expectedResult || "Not specified."}
                                </p>
                            </div>

                            {/* Actual Result */}
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#ff9da9] text-[12px]">Actual Result</strong>
                                <p className="text-[#eef1f8] text-[13px] leading-[1.6] m-0 whitespace-pre-line bg-[#0f1322] p-3 rounded border border-[#40252c]">
                                    {viewBug.actualResult || "Not specified."}
                                </p>
                            </div>

                            {/* Attachments */}
                            {viewBug.attachments && viewBug.attachments.length > 0 && (
                                <div className="flex flex-col gap-2 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                    <strong className="text-[#7f8aa5] text-[12px]">
                                        Attachments ({viewBug.attachments.length})
                                    </strong>
                                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2.5 mt-1">
                                        {viewBug.attachments.map((fileUrl, i) => {
                                            const fullUrl = getFileUrl(fileUrl);
                                            const fileName = fileUrl.replace(/\\/g, "/").split("/").pop() || `Attachment ${i + 1}`;
                                            const isImg = isImageFile(fileUrl);

                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2.5 p-2 bg-[#0f1322] border border-[#282e45] rounded-[6px]"
                                                >
                                                    {isImg ? (
                                                        <div
                                                            className="w-10 h-10 rounded bg-[#171b2e] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                                                            onClick={() => setPreviewImage(fullUrl)}
                                                        >
                                                            <img
                                                                src={fullUrl}
                                                                alt={fileName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[20px] shrink-0">📄</span>
                                                    )}
                                                    <span className="text-[#eef1f8] text-[12px] truncate flex-1" title={fileName}>
                                                        {fileName}
                                                    </span>
                                                    <a
                                                        href={fullUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[#9fc5ff] text-[12px] no-underline hover:underline shrink-0"
                                                    >
                                                        Open
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-4"
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-[#171b2e] p-2">
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center border-none cursor-pointer text-lg"
                        >
                            ✕
                        </button>
                        <img
                            src={previewImage}
                            alt="Full preview"
                            className="max-w-full max-h-[85vh] object-contain rounded"
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">
                    <div className="w-full max-w-[440px] bg-[#171b2e] border border-[#30364d] rounded-xl p-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                        <h2 className="m-0 mb-3 text-white text-[18px] font-semibold">
                            Delete Bug
                        </h2>
                        <p className="m-0 mb-6 text-[#8f9bb3] text-[14px] leading-[1.5]">
                            Are you sure you want to delete <strong className="text-white font-semibold">"{deleteTarget.bugTitle}"</strong>? This action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="p-3 mb-4 rounded-md bg-[#40252c] border border-[#5d303b] text-[#ff9da9] text-[13px]">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-2.5">
                            <button
                                className="py-2.5 px-4 border border-[#30364d] rounded-lg bg-transparent text-[#cbd2e3] text-[13px] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#222942]"
                                onClick={() => {
                                    setDeleteTarget(null);
                                    setDeleteError("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-2.5 px-4 border-none rounded-lg bg-[#e11d48] text-white text-[13px] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#be123c] disabled:opacity-50"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete Bug"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bug;
