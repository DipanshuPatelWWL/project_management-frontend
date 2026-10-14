import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as taskService from "../../services/taskService";
import * as projectService from "../../services/projectService";
import * as sprintService from "../../services/sprintService";
import * as userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

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


const inputBaseClass =
    "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";
const readonlyClass = "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";

const getInputClass = (hasError, isReadonly = false) => {
    let cls = inputBaseClass;   
    if (isReadonly) cls += ` ${readonlyClass}`;
    if (hasError) cls += " field-error";
    return cls;
};

const initialFormState = {
    taskTitle: "",
    description: "",
    project: "",
    sprint: "",
    assignedTo: "",
    priority: "medium",
    status: "to-do",
    storyPoints: 0,
    estimatedHours: 0,
    actualHours: 0,
    startDate: "",
    dueDate: "",
    compltedDate: "",
};

const CreateTask = () => {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const { user: currentUser } = useAuth();

    const isEditMode = Boolean(taskId);

    const [formData, setFormData] = useState(initialFormState);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [auditInfo, setAuditInfo] = useState(null);

    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    

    const [sprints, setSprints] = useState([]);
    const [users, setUsers] = useState([]);

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // Helper: format date to YYYY-MM-DD
    const formatDateForInput = (dateVal) => {
        if (!dateVal) return "";
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split("T")[0];
        } catch {
            return "";
        }
    };

    // Load initial dropdown data (Projects, Sprints, Users)
    useEffect(() => {
        const fetchInitialData = async () => {
            setProjectsLoading(true);
            try {
                const [projRes, sprintRes, userRes] = await Promise.all([
                    projectService.getProjects().catch(() => ({ projects: [] })),
                    sprintService.getSprints().catch(() => ({ sprints: [] })),
                    userService.getUsers().catch(() => ({ users: [] })),
                ]);

                setProjects(projRes.projects || projRes || []);
                setSprints(sprintRes.sprints || sprintRes || []);
                setUsers(userRes.users || userRes || []);
            } catch (err) {
                console.error("Failed to load select data:", err);
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Load existing task data when in edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const fetchTask = async () => {
            setPageLoading(true);
            try {
                const res = await taskService.getTaskById(taskId);
                const task = res.task || res;

                if (task) {
                    setFormData({
                        taskTitle: task.taskTitle || "",
                        description: task.description || "",
                        project: task.project?._id || task.project || "",
                        sprint: task.sprint?._id || task.sprint || "",
                        assignedTo: task.assignedTo?._id || task.assignedTo || "",
                        priority: task.priority || "medium",
                        status: task.status || "to-do",
                        storyPoints: task.storyPoints ?? 0,
                        estimatedHours: task.estimatedHours ?? 0,
                        actualHours: task.actualHours ?? 0,
                        startDate: formatDateForInput(task.startDate),
                        dueDate: formatDateForInput(task.dueDate),
                        compltedDate: formatDateForInput(task.compltedDate),
                    });
                    setExistingAttachments(task.attachments || []);
                    setAuditInfo({
                        createdBy: task.createdBy,
                        createdAt: task.createdAt,
                        updatedBy: task.updatedBy,
                        updatedAt: task.updatedAt,
                    });
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load task details.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchTask();
    }, [isEditMode, taskId]);

    // Available sprints filtered by selected project
    const availableSprints = useMemo(() => {
        if (!formData.project) return sprints;
        return sprints.filter((s) => {
            const pId = typeof s.project === "object" && s.project !== null ? s.project._id : s.project || "";
            return pId === formData.project;
        });
    }, [sprints, formData.project]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            if (name === "status" && value === "completed" && !prev.compltedDate) {
                updated.compltedDate = new Date().toISOString().split("T")[0];
            }

            if (name === "project") {
                updated.sprint = "";
            }

            return updated;
        });

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    };

    // File selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const total = existingAttachments.length + newFiles.length + files.length;
        if (total > 5) {
            setError("You can attach a maximum of 5 files.");
            return;
        }
        setNewFiles((prev) => [...prev, ...files]);
        setError("");
    };

    const removeNewFile = (index) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index) => {
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    };
    
    // Validation
    const validate = () => {
        const requiredFields = ["taskTitle", "project", "startDate", "dueDate", "compltedDate"];
        const errors = {};
        requiredFields.forEach((field) => {
            if (!formData[field] || !String(formData[field]).trim()) {
                errors[field] = true;
            }
        });

        if (formData.startDate && formData.dueDate) {
            if (new Date(formData.dueDate) < new Date(formData.startDate)) {
                errors.startDate = true;
                errors.dueDate = true;
                setError("Due Date cannot be before Start Date.");
                setFieldErrors(errors);
                return false;
            }
        }

        if (formData.startDate && formData.compltedDate) {
            if (new Date(formData.compltedDate) < new Date(formData.startDate)) {
                errors.startDate = true;
                errors.compltedDate = true;
                setError("Completed Date cannot be before Start Date.");
                setFieldErrors(errors);
                return false;
            }
        }

        if (Number(formData.storyPoints) < 0) {
            errors.storyPoints = true;
            setError("Story points cannot be negative.");
            setFieldErrors(errors);
            return false;
        }
        if (Number(formData.estimatedHours) < 0) {
            errors.estimatedHours = true;
            setError("Estimated hours cannot be negative.");
            setFieldErrors(errors);
            return false;
        }
        if (Number(formData.actualHours) < 0) {
            errors.actualHours = true;
            setError("Actual hours cannot be negative.");
            setFieldErrors(errors);
            return false;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please fill all required fields");
            return false;
        }

        setFieldErrors({});
        return true;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validate()) {
            return;
        }

        setSubmitting(true);
        try {
            const submission = new FormData();
            submission.append("taskTitle", formData.taskTitle.trim());
            submission.append("description", formData.description.trim());
            submission.append("project", formData.project);
            if (formData.sprint) submission.append("sprint", formData.sprint);
            if (formData.assignedTo) submission.append("assignedTo", formData.assignedTo);
            submission.append("priority", formData.priority);
            submission.append("status", formData.status);
            submission.append("storyPoints", Number(formData.storyPoints) || 0);
            submission.append("estimatedHours", Number(formData.estimatedHours) || 0);
            submission.append("actualHours", Number(formData.actualHours) || 0);

            if (formData.startDate) submission.append("startDate", formData.startDate);
            if (formData.dueDate) submission.append("dueDate", formData.dueDate);
            if (formData.compltedDate) submission.append("compltedDate", formData.compltedDate);

            newFiles.forEach((file) => {
                submission.append("attachments", file);
            });

            if (isEditMode) {
                submission.append("existingAttachments", JSON.stringify(existingAttachments));
                await taskService.updateTask(taskId, submission);
                setSuccess("Task updated successfully!");
            } else {
                await taskService.createTask(submission);
                setSuccess("Task created successfully!");
            }

            setTimeout(() => {
                navigate("/tasks");
            }, 800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                `Failed to ${isEditMode ? "update" : "create"} task.`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getUserName = (user) => {
        if (!user) return "System";
        if (typeof user === "string") return user;
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return name || user.name || user.email || "User";
    };

    if (pageLoading) {
        return (
            <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
                <div className="text-[#8f9bb3] py-10 text-center">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
            <div className="w-full max-w-[1000px] mx-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] overflow-hidden">
                {/* Topbar */}
                <div className="flex items-center justify-between p-[22px_28px] max-sm:p-5 bg-[#171b2e] border-b border-[#30364d] max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
                    <h1 className="m-0 text-[22px] font-semibold text-white">
                        {isEditMode ? "Edit Task" : "Create Task"}
                    </h1>

                    <button
                        type="button"
                        className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
                        onClick={() => navigate("/tasks")}
                    >
                        Back to Tasks
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-7 max-sm:p-5">
                    {error && (
                        <div className="mb-5 p-[12px_14px] border border-[#7f1d1d] rounded-[7px] bg-[#2a1518] text-[#fca5a5] text-[13px]">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 p-[12px_14px] border border-[#166534] rounded-[7px] bg-[#14251b] text-[#86efac] text-[13px]">
                            {success}
                        </div>
                    )}

                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                        {/* Task Title */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="taskTitle" className="text-[13px] font-medium text-[#cbd2e3]">
                                Task Title <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="taskTitle"
                                type="text"
                                name="taskTitle"
                                className={getInputClass(fieldErrors.taskTitle)}
                                placeholder="e.g. Implement user authentication and login flow"
                                value={formData.taskTitle}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Project */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="project" className="text-[13px] font-medium text-[#cbd2e3]">
                                Project <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <select
                                id="project"
                                name="project"
                                className={getInputClass(fieldErrors.project)}
                                value={formData.project}
                                onChange={handleChange}
                                disabled={projectsLoading}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    {projectsLoading ? "Loading projects..." : "-- Select Project --"}
                                </option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id} className="bg-[#171b2e] text-white">
                                        {p.projectId ? `[${p.projectId}] ` : ""}{p.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sprint */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="sprint" className="text-[13px] font-medium text-[#cbd2e3]">
                                Sprint (Optional)
                            </label>
                            <select
                                id="sprint"
                                name="sprint"
                                className={getInputClass(false, !formData.project)}
                                value={formData.sprint}
                                onChange={handleChange}
                                disabled={!formData.project}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    {!formData.project ? "Select project first" : "-- Select Sprint --"}
                                </option>
                                {availableSprints.map((s) => (
                                    <option key={s._id} value={s._id} className="bg-[#171b2e] text-white">
                                        {s.sprintId ? `[${s.sprintId}] ` : ""}{s.sprintName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assigned To */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="assignedTo" className="text-[13px] font-medium text-[#cbd2e3]">
                                Assigned To
                            </label>
                            <select
                                id="assignedTo"
                                name="assignedTo"
                                className={getInputClass(false)}
                                value={formData.assignedTo}
                                onChange={handleChange}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    -- Unassigned --
                                </option>
                                {users.map((u) => {
                                    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                                    return (
                                        <option key={u._id} value={u._id} className="bg-[#171b2e] text-white">
                                            {name} ({u.role || u.email})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Assigned By (Readonly) */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="assignedBy" className="text-[13px] font-medium text-[#cbd2e3]">
                                Assigned By
                            </label>
                            <input
                                id="assignedBy"
                                type="text"
                                className={getInputClass(false, true)}
                                value={
                                    currentUser
                                        ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() +
                                          ` (${currentUser.role || "Admin"})`
                                        : "Current User"
                                }
                                readOnly
                                disabled
                            />
                        </div>

                        {/* Priority */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="priority" className="text-[13px] font-medium text-[#cbd2e3]">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                className={getInputClass(false)}
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="low" className="bg-[#171b2e] text-white">Low</option>
                                <option value="medium" className="bg-[#171b2e] text-white">Medium</option>
                                <option value="high" className="bg-[#171b2e] text-white">High</option>
                                <option value="critical" className="bg-[#171b2e] text-white">Critical</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="status" className="text-[13px] font-medium text-[#cbd2e3]">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                className={getInputClass(false)}
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="to-do" className="bg-[#171b2e] text-white">To-Do</option>
                                <option value="in-progress" className="bg-[#171b2e] text-white">In Progress</option>
                                <option value="completed" className="bg-[#171b2e] text-white">Completed</option>
                                <option value="on-hold" className="bg-[#171b2e] text-white">On Hold</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="description" className="text-[13px] font-medium text-[#cbd2e3]">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="w-full h-auto min-h-[90px] py-2.5 px-[13px] resize-y border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]"
                                placeholder="Describe task deliverables, acceptance criteria, or technical details..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Story Points */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="storyPoints" className="text-[13px] font-medium text-[#cbd2e3]">
                                Story Points
                            </label>
                            <input
                                id="storyPoints"
                                type="number"
                                name="storyPoints"
                                min="0"
                                className={getInputClass(fieldErrors.storyPoints)}
                                value={formData.storyPoints}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Estimated Hours */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="estimatedHours" className="text-[13px] font-medium text-[#cbd2e3]">
                                Estimated Hours
                            </label>
                            <input
                                id="estimatedHours"
                                type="number"
                                name="estimatedHours"
                                min="0"
                                className={getInputClass(fieldErrors.estimatedHours)}
                                value={formData.estimatedHours}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Actual Hours */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="actualHours" className="text-[13px] font-medium text-[#cbd2e3]">
                                Actual Hours
                            </label>
                            <input
                                id="actualHours"
                                type="number"
                                name="actualHours"
                                min="0"
                                className={getInputClass(fieldErrors.actualHours)}
                                value={formData.actualHours}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Start Date */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="startDate" className="text-[13px] font-medium text-[#cbd2e3]">
                                Start Date <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                name="startDate"
                                className={getInputClass(fieldErrors.startDate)}
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Due Date */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="dueDate" className="text-[13px] font-medium text-[#cbd2e3]">
                                Due Date <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="dueDate"
                                type="date"
                                name="dueDate"
                                className={getInputClass(fieldErrors.dueDate)}
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Completed Date */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="compltedDate" className="text-[13px] font-medium text-[#cbd2e3]">
                                Completed Date <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="compltedDate"
                                type="date"
                                name="compltedDate"
                                className={getInputClass(fieldErrors.compltedDate)}
                                value={formData.compltedDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* File Attachments */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label className="text-[13px] font-medium text-[#cbd2e3]">
                                Attachments (Max 5 files)
                            </label>

                            {/* Existing files */}
                            {existingAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mb-2">
                                    {existingAttachments.map((url, i) => {
                                        const fullUrl = getFileUrl(url);
                                        const fileName = url.replace(/\\/g, "/").split("/").pop() || `Attachment ${i + 1}`;
                                        const isImg = isImageFile(url);

                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 py-1.5 px-3 bg-[#202742] border border-[#313d66] rounded-[6px] text-[#9fc5ff] text-[12px]"
                                            >
                                                {isImg && (
                                                    <img
                                                        src={fullUrl}
                                                        alt={fileName}
                                                        className="w-6 h-6 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                        }}
                                                    />
                                                )}
                                                <span className="truncate max-w-[180px]" title={fileName}>
                                                    {fileName}
                                                </span>
                                                <a
                                                    href={fullUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-[#719cd6] hover:text-white underline ml-1"
                                                >
                                                    View
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingAttachment(i)}
                                                    className="border-none bg-transparent text-[#ff9da9] cursor-pointer text-[14px] hover:text-white ml-1 leading-none"
                                                    title="Remove attachment"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* New files */}
                            {newFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mb-2">
                                    {newFiles.map((f, i) => {
                                        const isImg = f.type?.startsWith("image/");
                                        const objectUrl = isImg ? URL.createObjectURL(f) : null;

                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 py-1.5 px-3 bg-[#1c2e25] border border-[#2b5941] rounded-[6px] text-[#86efac] text-[12px]"
                                            >
                                                {isImg && objectUrl && (
                                                    <img
                                                        src={objectUrl}
                                                        alt={f.name}
                                                        className="w-6 h-6 object-cover rounded"
                                                    />
                                                )}
                                                <span className="truncate max-w-[180px]" title={f.name}>
                                                    {f.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(i)}
                                                    className="border-none bg-transparent text-[#ff9da9] cursor-pointer text-[14px] hover:text-white ml-1 leading-none"
                                                    title="Remove file"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {existingAttachments.length + newFiles.length < 5 && (
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full py-2 px-3 border border-[#30364d] rounded-[7px] bg-[#0f1322] text-[#8f9bb3] text-[13px] cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-[5px] file:border-none file:text-[12px] file:font-semibold file:bg-[#20253a] file:text-[#9fc5ff] hover:file:bg-[#2c3450]"
                                />
                            )}
                        </div>
                    </div>

                    {/* Audit Information in Edit Mode */}
                    {isEditMode && auditInfo && (
                        <div className="mt-7 pt-5 border-t border-[#282e45] flex items-center justify-between text-[#7f8aa5] text-[12px] flex-wrap gap-3">
                            <span>
                                Created By:{" "}
                                <strong className="text-[#cbd2e3]">
                                    {getUserName(auditInfo.createdBy)}
                                </strong>{" "}
                                ({auditInfo.createdAt ? new Date(auditInfo.createdAt).toLocaleDateString() : "-"})
                            </span>
                            <span>
                                Last Updated:{" "}
                                <strong className="text-[#cbd2e3]">
                                    {auditInfo.updatedAt ? new Date(auditInfo.updatedAt).toLocaleString() : "-"}
                                </strong>
                            </span>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3.5 mt-8 max-sm:flex-col-reverse">
                        <button
                            type="button"
                            className="flex items-center justify-center py-[11px] px-6 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[14px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
                            onClick={() => navigate("/tasks")}
                            disabled={submitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="border-none rounded-lg py-[11px] px-6 bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4] disabled:opacity-50 max-sm:w-full"
                            disabled={submitting}
                        >
                            {submitting
                                ? isEditMode
                                    ? "Updating..."
                                    : "Creating..."
                                : isEditMode
                                ? "Update Task"
                                : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
