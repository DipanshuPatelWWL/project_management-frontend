import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as taskService from "../../services/taskService";
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


const Task = () => {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
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
        priority: "",
    });

    const [page, setPage] = useState(1);

    // Popup modal states (same pattern as Sprint, Project & Client)
    const [viewTask, setViewTask] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        setError("");

        try {
            const [tasksRes, projectsRes, sprintsRes] = await Promise.all([
                taskService.getTasks(),
                projectService.getProjects().catch(() => ({ projects: [] })),
                sprintService.getSprints().catch(() => ({ sprints: [] })),
            ]);

            setTasks(tasksRes.tasks || tasksRes || []);
            setProjects(projectsRes.projects || projectsRes || []);
            setSprints(sprintsRes.sprints || sprintsRes || []);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load tasks.");
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

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const searchVal = filters.search.toLowerCase().trim();
            const titleVal = (t.taskTitle || "").toLowerCase();
            const descVal = (t.description || "").toLowerCase();

            const matchesSearch =
                !searchVal ||
                titleVal.includes(searchVal) ||
                descVal.includes(searchVal);

            const projectId =
                typeof t.project === "object" && t.project !== null
                    ? t.project._id
                    : t.project || "";
            const matchesProject = !filters.project || projectId === filters.project;

            const sprintId =
                typeof t.sprint === "object" && t.sprint !== null
                    ? t.sprint._id
                    : t.sprint || "";
            const matchesSprint = !filters.sprint || sprintId === filters.sprint;

            const matchesStatus =
                !filters.status ||
                (t.status || "").toLowerCase() === filters.status.toLowerCase();

            const matchesPriority =
                !filters.priority ||
                (t.priority || "").toLowerCase() === filters.priority.toLowerCase();

            return (
                matchesSearch &&
                matchesProject &&
                matchesSprint &&
                matchesStatus &&
                matchesPriority
            );
        });
    }, [tasks, filters]);

    // Available sprints filtered by selected project
    const availableSprints = useMemo(() => {
        if (!filters.project) return sprints;
        return sprints.filter((s) => {
            const pId =
                typeof s.project === "object" && s.project !== null
                    ? s.project._id
                    : s.project || "";
            return pId === filters.project;
        });
    }, [sprints, filters.project]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
    const paginatedTasks = filteredTasks.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    // Statistics metrics (same style as Sprint / Project)
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter((t) => (t.status || "to-do").toLowerCase() === "to-do").length;
    const inProgressTasks = tasks.filter((t) => (t.status || "").toLowerCase() === "in-progress").length;
    const completedTasks = tasks.filter((t) => (t.status || "").toLowerCase() === "completed").length;

    // Helpers
    const getProjectName = (proj) => {
        if (!proj) return "-";
        if (typeof proj === "string") return proj;
        return proj.projectName || "-";
    };

    const getSprintName = (spr) => {
        if (!spr) return "-";
        if (typeof spr === "string") return spr;
        return spr.sprintName || "-";
    };

    const getUserName = (user) => {
        if (!user) return "Unassigned";
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

    const getStatusBadgeClass = (status = "to-do") => {
        const s = status.toLowerCase();
        if (s === "completed") return "bg-[#1c3a2e] text-[#7fe3a8]";
        if (s === "in-progress") return "bg-[#1f3554] text-[#9fc5ff]";
        if (s === "on-hold") return "bg-[#3d3520] text-[#f2c96d]";
        return "bg-[#252a42] text-[#cbd2e3]"; // to-do
    };

    const getPriorityBadgeClass = (priority = "medium") => {
        const p = priority.toLowerCase();
        if (p === "critical") return "bg-[#40252c] text-[#ff9da9]";
        if (p === "high") return "bg-[#3d271d] text-[#ffb076]";
        if (p === "low") return "bg-[#1c3a2e] text-[#7fe3a8]";
        return "bg-[#1f3554] text-[#9fc5ff]"; // medium
    };

    // Quick Status change
    const handleQuickStatusChange = async (taskId, newStatus) => {
        try {
            setError("");
            await taskService.changeTaskStatus(taskId, newStatus);
            setTasks((prev) =>
                prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
            );
            if (viewTask && viewTask._id === taskId) {
                setViewTask((prev) => ({ ...prev, status: newStatus }));
            }
            setSuccess("Task status updated!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status.");
        }
    };

    // Delete task
    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await taskService.deleteTask(deleteTarget._id);
            setTasks((prev) => prev.filter((t) => t._id !== deleteTarget._id));
            setDeleteTarget(null);
            setSuccess("Task deleted successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Failed to delete task.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Tasks</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                        Manage tasks, deliverables, timeline, and assignments.
                    </p>
                </div>

                <button
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                    onClick={() => navigate("/tasks/create")}
                >
                    + Add Task
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-[18px] mb-[25px]">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Tasks</span>
                    <strong className="text-white text-[26px] font-bold">{totalTasks}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">To-Do</span>
                    <strong className="text-white text-[26px] font-bold">{todoTasks}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">In Progress</span>
                    <strong className="text-white text-[26px] font-bold">{inProgressTasks}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Completed</span>
                    <strong className="text-white text-[26px] font-bold">{completedTasks}</strong>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap max-md:flex-col max-md:items-stretch">
                <input
                    type="text"
                    className="flex-1 min-w-[220px] h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                    placeholder="Search task title, description..."
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
                    className="h-[42px] min-w-[140px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Status</option>
                    <option value="to-do">To-Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            priority: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[140px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                {(filters.search ||
                    filters.project ||
                    filters.sprint ||
                    filters.status ||
                    filters.priority) && (
                    <button
                        className="h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-[#8f9bb3] text-[13px] cursor-pointer transition-all duration-200 hover:bg-[#222942] hover:text-white hover:border-[#454d6e]"
                        onClick={() =>
                            handleFiltersChange({
                                search: "",
                                project: "",
                                sprint: "",
                                status: "",
                                priority: "",
                            })
                        }
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Error & Success Messages */}
            {error && (
                <p className="text-[#ff8e9a] bg-[#2a1518] border border-[#7f1d1d] rounded-lg py-3 px-4 mb-5 text-[14px]">
                    {error}
                </p>
            )}
            {success && (
                <p className="text-[#86efac] bg-[#14251b] border border-[#166534] rounded-lg py-3 px-4 mb-5 text-[14px]">
                    {success}
                </p>
            )}

            {/* Loading */}
            {loading && <Loader />}

            {/* Table */}
            {!loading && !error && (
                <>
                    {paginatedTasks.length === 0 ? (
                        <p className="text-[#8f9bb3] text-[15px] py-[30px] text-center">
                            No tasks found.
                        </p>
                    ) : (
                        <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                            <table className="w-full min-w-[950px] border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Task Title
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Project
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Sprint
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Assigned To
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Priority
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Due Date
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Points / Hrs
                                        </th>
                                        <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedTasks.map((task) => {
                                        const status = (task.status || "to-do").toLowerCase();
                                        const priority = (task.priority || "medium").toLowerCase();

                                        return (
                                            <tr
                                                key={task._id}
                                                className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0"
                                            >
                                                {/* Task Title */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap capitalize">
                                                    <strong className="block text-white text-[14px] mb-[3px]">
                                                        {task.taskTitle}
                                                    </strong>
                                                    <small className="block text-[#7f8aa5] text-[12px] max-w-[240px] truncate">
                                                        {task.description || "No description specified"}
                                                    </small>
                                                </td>

                                                {/* Project */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                        {getProjectName(task.project)}
                                                    </span>
                                                </td>

                                                {/* Sprint */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span className="inline-block py-[3px] px-2 bg-[#202742] border border-[#313d66] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                        {getSprintName(task.sprint)}
                                                    </span>
                                                </td>

                                                {/* Assigned To */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    {getUserName(task.assignedTo)}
                                                </td>

                                                {/* Priority */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span
                                                        className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getPriorityBadgeClass(
                                                            priority
                                                        )}`}
                                                    >
                                                        {task.priority || "medium"}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span
                                                        className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getStatusBadgeClass(
                                                            status
                                                        )}`}
                                                    >
                                                        {task.status || "to-do"}
                                                    </span>
                                                </td>

                                                {/* Due Date */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    {formatDate(task.dueDate)}
                                                </td>

                                                {/* Story Points / Hours */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <span className="text-white font-medium">
                                                        {Number(task.storyPoints) || 0} SP
                                                    </span>
                                                    <small className="block text-[#7f8aa5] text-[11px] mt-0.5">
                                                        {Number(task.actualHours) || 0}h / {Number(task.estimatedHours) || 0}h
                                                    </small>
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                    <div className="flex items-center gap-[7px] whitespace-nowrap">
                                                        <button
                                                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                            onClick={() => setViewTask(task)}
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                            onClick={() =>
                                                                navigate(`/tasks/${task._id}/edit`)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] font-medium hover:bg-[#522d36]"
                                                            onClick={() => setDeleteTarget(task)}
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

                    {/* Pagination (Same as Sprint / Project) */}
                    {filteredTasks.length > 0 && (
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

            {/* View Task Details Modal Popup (Exact match to View Sprint Modal) */}
            {viewTask && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5"
                >
                    <div
                        className="w-full max-w-[650px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                    >
                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">
                                Task Details
                            </h2>
                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() => setViewTask(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[1px] grid grid-cols-2 max-[900px]:grid-cols-1 gap-[1px] bg-[#282e45]">
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Task Title</strong>
                                <span className="text-[#eef1f8] text-[14px] font-semibold break-words">
                                    {viewTask.taskTitle}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Project</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getProjectName(viewTask.project)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Sprint</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getSprintName(viewTask.sprint)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Assigned To</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getUserName(viewTask.assignedTo)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Assigned By</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {getUserName(viewTask.assignedBy || viewTask.createdBy)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Priority</strong>
                                <span
                                    className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize w-fit ${getPriorityBadgeClass(
                                        viewTask.priority
                                    )}`}
                                >
                                    {viewTask.priority || "medium"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Status</strong>
                                <span
                                    className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize w-fit ${getStatusBadgeClass(
                                        viewTask.status
                                    )}`}
                                >
                                    {viewTask.status || "to-do"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Story Points</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {Number(viewTask.storyPoints) || 0} SP
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Hours (Actual / Estimated)</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {Number(viewTask.actualHours) || 0}h / {Number(viewTask.estimatedHours) || 0}h
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Start Date</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {formatDate(viewTask.startDate)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Due Date</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {formatDate(viewTask.dueDate)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Completed Date</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {formatDate(viewTask.compltedDate)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                <strong className="text-[#7f8aa5] text-[12px]">Description</strong>
                                <p className="text-[#eef1f8] text-[13px] leading-[1.6] m-0 whitespace-pre-line">
                                    {viewTask.description || "No description provided."}
                                </p>
                            </div>

                            {viewTask.attachments && viewTask.attachments.length > 0 && (
                                <div className="flex flex-col gap-2 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                                    <strong className="text-[#7f8aa5] text-[12px]">
                                        Attachments ({viewTask.attachments.length})
                                    </strong>
                                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2.5 mt-1">
                                        {viewTask.attachments.map((fileUrl, i) => {
                                            const fullUrl = getFileUrl(fileUrl);
                                            const fileName = fileUrl.replace(/\\/g, "/").split("/").pop() || `Attachment ${i + 1}`;
                                            const isImg = isImageFile(fileUrl);

                                            return (
                                                <div
                                                    key={i}
                                                    className="bg-[#202742] border border-[#313d66] rounded-[8px] p-2.5 flex flex-col gap-2"
                                                >
                                                    {isImg && (
                                                        <div
                                                            onClick={() => setPreviewImage({ url: fullUrl, name: fileName })}
                                                            className="block overflow-hidden rounded-[6px] bg-[#0f1322] border border-[#282e45] group cursor-pointer relative"
                                                            title="Click to preview image"
                                                        >
                                                            <img
                                                                src={fullUrl}
                                                                alt={fileName}
                                                                className="w-full h-32 object-contain rounded-[6px] transition-transform duration-200 group-hover:scale-105"
                                                                onError={(e) => {
                                                                    e.target.style.display = "none";
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[12px] font-medium gap-1">
                                                                <span>🔍 Click to View</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className="text-[12px] text-[#e8ebf5] truncate max-w-[150px]"
                                                            title={fileName}
                                                        >
                                                            {fileName}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            {isImg && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewImage({ url: fullUrl, name: fileName })}
                                                                    className="py-1 px-2.5 bg-[#1f2b3e] border border-[#2d4261] rounded-[5px] text-[#82b4ff] text-[11px] font-medium hover:bg-[#2b3d58] hover:text-white transition-colors cursor-pointer"
                                                                >
                                                                    Preview
                                                                </button>
                                                            )}
                                                            <a
                                                                href={fullUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="py-1 px-2.5 bg-[#26354a] border border-[#30445f] rounded-[5px] text-[#9fc5ff] text-[11px] font-medium hover:bg-[#30445f] hover:text-white transition-colors whitespace-nowrap"
                                                            >
                                                                {isImg ? "Open ↗" : "Download ↗"}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Created At</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewTask.createdAt ? new Date(viewTask.createdAt).toLocaleString() : "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Last Updated At</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewTask.updatedAt ? new Date(viewTask.updatedAt).toLocaleString() : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Lightbox Modal - Only closes when clicking the × close button */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-[#05070f]/90 flex items-center justify-center z-[1100] p-5"
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                    >
                        <div className="flex justify-between items-center py-3.5 px-5 border-b border-[#282e45] bg-[#171b2e] gap-4">
                            <span className="text-[#eef1f8] text-[14px] font-medium truncate max-w-[500px]">
                                {previewImage.name}
                            </span>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewImage.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="py-1 px-3 bg-[#26354a] border border-[#30445f] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium hover:bg-[#30445f] hover:text-white transition-colors whitespace-nowrap"
                                >
                                    Open Full Size ↗
                                </a>
                                <button
                                    className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                    onClick={() => setPreviewImage(null)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-4 flex items-center justify-center bg-[#0d101d] overflow-auto max-h-[80vh]">
                            <img
                                src={previewImage.url}
                                alt={previewImage.name}
                                className="max-w-full max-h-[75vh] object-contain rounded-[6px]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Task Modal Popup (Exact match to Delete Sprint Modal) */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5"
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="w-full max-w-[450px] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-y-visible"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">Delete Task</h2>
                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() => setDeleteTarget(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[22px]">
                            <p className="text-[#dfe3ee] text-[14px] leading-[1.6] m-0">
                                Are you sure you want to delete{" "}
                                <strong className="text-white font-semibold">
                                    "{deleteTarget.taskTitle}"
                                </strong>
                                ?
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
                                onClick={() => setDeleteTarget(null)}
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

export default Task;
