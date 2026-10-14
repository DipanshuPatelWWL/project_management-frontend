import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as bugService from "../../services/bugService";
import * as projectService from "../../services/projectService";
import * as sprintService from "../../services/sprintService";
import * as taskService from "../../services/taskService";
import  * as userService from "../../services/userService";
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

const textareaBaseClass =
    "w-full p-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5] resize-y min-h-[95px]";

const readonlyClass = "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";

const getInputClass = (hasError, isReadonly = false) => {
    let cls = inputBaseClass;
    if (isReadonly) cls += ` ${readonlyClass}`;
    if (hasError) cls += " field-error !border-[#ef4444] !ring-1 !ring-[#ef4444]";
    return cls;
};


const getTextareaClass = (hasError) => {
    let cls = textareaBaseClass;
    if (hasError) cls += " field-error !border-[#ef4444] !ring-1 !ring-[#ef4444]";
    return cls;
};

const initialBugState = {
    bugId: "",
    bugTitle: "",
    description: "",
    project: "",
    sprint: "",
    task: "",
    reportedBy: "",
    assignedTo: "",
    severity: "medium",
    priority: "medium",
    status: "open",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
};

const CreateBug = () => {
    const navigate = useNavigate();
    const { bugId } = useParams();
    const { user: currentUser } = useAuth();

    const isEditMode = Boolean(bugId);

    const [formData, setFormData] = useState({
        ...initialBugState,
        reportedBy: currentUser?._id || "",
    });
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [auditInfo, setAuditInfo] = useState(null);

    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);

    // Load initial dropdown data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [projRes, sprintRes, taskRes, userRes] = await Promise.all([
                    projectService.getProjects().catch(() => ({ projects: [] })),
                    sprintService.getSprints().catch(() => ({ sprints: [] })),
                    taskService.getTasks().catch(() => ({ tasks: [] })),
                    userService.getUsers().catch(() => ({ users: [] })),
                ]);

                setProjects(projRes.projects || projRes || []);
                setSprints(sprintRes.sprints || sprintRes || []);
                setTasks(taskRes.tasks || taskRes || []);
                setUsers(userRes.users || userRes || []);
            } catch (err) {
                console.error("Failed to load prerequisite data:", err);
            }
        };


        fetchInitialData();
    }, []);

    // Load existing bug data if in edit mode
    useEffect(() => {
        if (!isEditMode) {
            if (currentUser?._id && !formData.reportedBy) {
                setFormData((prev) => ({ ...prev, reportedBy: currentUser._id }));
            }
            const loadNextId = async () => {
                try {
                    const res = await bugService.getNextBugId();
                    if (res?.nextBugId) {
                        setFormData((prev) => ({ ...prev, bugId: res.nextBugId }));
                    }
                } catch (e) {
                    console.error("Failed to load next Bug ID:", e);
                }
            };
            loadNextId();
            return;
        }

        const fetchBug = async () => {
            setPageLoading(true);
            try {
                const res = await bugService.getBugById(bugId);
                const bug = res.bug || res;

                if (bug) {
                    setFormData({
                        bugId: bug.bugId || "",
                        bugTitle: bug.bugTitle || "",
                        description: bug.description || "",
                        project: (typeof bug.project === "object" && bug.project !== null ? bug.project._id : bug.project) || "",
                        sprint: (typeof bug.sprint === "object" && bug.sprint !== null ? bug.sprint._id : bug.sprint) || "",
                        task: (typeof bug.task === "object" && bug.task !== null ? bug.task._id : bug.task) || "",
                        reportedBy: (typeof bug.reportedBy === "object" && bug.reportedBy !== null ? bug.reportedBy._id : bug.reportedBy) || "",
                        assignedTo: (typeof bug.assignedTo === "object" && bug.assignedTo !== null ? bug.assignedTo._id : bug.assignedTo) || "",
                        severity: bug.severity || "medium",
                        priority: bug.priority || "medium",
                        status: bug.status || "open",
                        stepsToReproduce: bug.stepsToReproduce || "",
                        expectedResult: bug.expectedResult || "",
                        actualResult: bug.actualResult || "",
                    });
                    setExistingAttachments(bug.attachments || []);
                    setAuditInfo({
                        createdBy: bug.createdBy,
                        createdAt: bug.createdAt,
                        updatedBy: bug.updatedBy,
                        updatedAt: bug.updatedAt,
                        resolvedDate: bug.resolvedDate,
                    });
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load bug details.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchBug();
    }, [isEditMode, bugId, currentUser]);

    // Available sprints filtered by selected project
    const availableSprints = useMemo(() => {
        if (!formData.project) return sprints;
        return sprints.filter((s) => {
            const pId = typeof s.project === "object" && s.project !== null ? s.project._id : s.project || "";
            return String(pId) === String(formData.project);
        });
    }, [sprints, formData.project]);



    // Available tasks filtered by selected project / sprint
    const availableTasks = useMemo(() => {
        return tasks.filter((t) => {
            if (formData.sprint) {
                const sId = typeof t.sprint === "object" && t.sprint !== null ? t.sprint._id : t.sprint || "";
                if (String(sId) !== String(formData.sprint)) return false;
            }
            if (formData.project) {
                const pId = typeof t.project === "object" && t.project !== null ? t.project._id : t.project || "";
                return String(pId) === String(formData.project);
            }
            return true;
        });
    }, [tasks, formData.project, formData.sprint]);

    // Input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "project") {
                updated.sprint = "";
                updated.task = "";
            } else if (name === "sprint") {
                updated.task = "";
            }
            return updated;
        });
    
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
            setError("");
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
        e.target.value = "";
    };

    const removeNewFile = (index) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };
    

    
    const removeExistingAttachment = (index) => {
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    };
     

    // Format helper
    const getUserDisplayName = (u) => {
        if (!u) return "";
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        return name ? `${name} (${u.email || ""})` : u.email || "User";
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
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "-";
        }
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const errors = {};

        if (!formData.bugTitle || !formData.bugTitle.trim()) {
            errors.bugTitle = true;
        }
        if (!formData.project) {
            errors.project = true;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please fill all required fields");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
 
        
        setSubmitting(true);

        try {
            let payload;
            if (newFiles.length > 0) {
                const fd = new FormData();
                Object.entries(formData).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        fd.append(key, val);
                    }
                });
                if (isEditMode) {
                    fd.append("attachments", JSON.stringify(existingAttachments));
                }
                newFiles.forEach((file) => {
                    fd.append("attachments", file);
                });
                payload = fd;
            } else {
                payload = {
                    ...formData,
                    ...(isEditMode ? { attachments: existingAttachments } : {}),
                };
            }

            if (isEditMode) {
             await bugService.updateBug(bugId, payload);
                setSuccess("Bug updated successfully!");
            } else {
                await bugService.createBug(payload);
                setSuccess("Bug reported successfully!");
            }
                       
            setTimeout(() => {
                navigate("/bugs");
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} bug.`);
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
            <div className="w-full max-w-[1000px] mx-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] overflow-hidden">
                {/* Topbar */}
                <div className="flex items-center justify-between p-[22px_28px] max-sm:p-5 bg-[#171b2e] border-b border-[#30364d] max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
                    <h1 className="m-0 text-[22px] font-semibold text-white">
                        {isEditMode ? "Edit Bug" : "Create Bug"}
                    </h1>

                    <button
                        type="button"
                        className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
                        onClick={() => navigate("/bugs")}
                    >
                        Back to Bugs
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-7 max-sm:p-5">
                    {/* Error & Success Messages */}
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

                    {/* Audit Info in Edit Mode */}
                    {isEditMode && auditInfo && (
                        <div className="flex items-center gap-4 flex-wrap bg-[#101424] border border-[#282e45] rounded-lg p-3 text-[12px] text-[#8f9bb3] mb-6">
                            <div>
                                <strong className="text-[#cbd2e3]">Created:</strong> {formatDate(auditInfo.createdAt)}
                            </div>
                            {auditInfo.updatedAt && (
                                <div>
                                    <strong className="text-[#cbd2e3]">Last Updated:</strong> {formatDate(auditInfo.updatedAt)}
                                </div>
                            )}
                            {auditInfo.resolvedDate && (
                                <div>
                                    <strong className="text-[#7fe3a8]">Resolved Date:</strong> {formatDate(auditInfo.resolvedDate)}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                        {/* Bug ID */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="bugId" className="text-[13px] font-medium text-[#cbd2e3]">
                                Bug ID
                            </label>
                            <input
                                id="bugId"
                                name="bugId"
                                value={formData.bugId}
                                readOnly
                                className={getInputClass(false, true)}
                            />
                        </div>

                        {/* Bug Title */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="bugTitle" className="text-[13px] font-medium text-[#cbd2e3]">
                                Bug Title <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="bugTitle"
                                type="text"
                                name="bugTitle"
                                value={formData.bugTitle || ""}
                                onChange={handleChange}
                                placeholder="e.g. Cannot complete order checkout on mobile browser"
                                className={getInputClass(fieldErrors.bugTitle)}
                            />
                            {fieldErrors.bugTitle && (
                                <span className="text-[#ff9da9] text-[12px]">
                                    Bug Title is required
                                </span>
                            )}
                        </div>

                        {/* Project */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="project" className="text-[13px] font-medium text-[#cbd2e3]">
                                Project <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <select
                                id="project"
                                name="project"
                                value={formData.project || ""}
                                onChange={handleChange}
                                className={getInputClass(fieldErrors.project)}
                            >
                                <option value="" className="bg-[#171b2e] text-white">-- Select Project --</option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id} className="bg-[#171b2e] text-white">
                                        {p.projectId ? `[${p.projectId}] ` : ""}{p.projectName}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.project && (
                                <span className="text-[#ff9da9] text-[12px]">
                                    Project is required
                                </span>
                            )}
                        </div>

                        {/* Sprint */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="sprint" className="text-[13px] font-medium text-[#cbd2e3]">
                                Sprint (Optional)
                            </label>
                            <select
                                id="sprint"
                                name="sprint"
                                value={formData.sprint || ""}
                                onChange={handleChange}
                                className={getInputClass(false, !formData.project)}
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

                        {/* Associated Task */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="task" className="text-[13px] font-medium text-[#cbd2e3]">
                                Associated Task (Optional)
                            </label>
                            <select
                                id="task"
                                name="task"
                                value={formData.task || ""}
                                onChange={handleChange}
                                className={getInputClass(false, !formData.project)}
                                disabled={!formData.project}
                            >
                                <option value="" className="bg-[#171b2e] text-white">
                                    {!formData.project ? "Select project first" : "-- Select Task --"}
                                </option>
                                {availableTasks.map((t) => (
                                    <option key={t._id} value={t._id} className="bg-[#171b2e] text-white">
                                        {t.taskTitle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reported By */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="reportedBy" className="text-[13px] font-medium text-[#cbd2e3]">
                                Reported By
                            </label>
                            <select
                                id="reportedBy"
                                name="reportedBy"
                                value={formData.reportedBy || ""}
                                onChange={handleChange}
                                className={getInputClass(false)}
                            >
                                <option value="" className="bg-[#171b2e] text-white">-- Select Reporter --</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id} className="bg-[#171b2e] text-white">
                                        {getUserDisplayName(u)}
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
                                value={formData.assignedTo || ""}
                                onChange={handleChange}
                                className={getInputClass(false)}
                            >
                                <option value="" className="bg-[#171b2e] text-white">-- Unassigned --</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id} className="bg-[#171b2e] text-white">
                                        {getUserDisplayName(u)}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Severity */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="severity" className="text-[13px] font-medium text-[#cbd2e3]">
                                Severity
                            </label>
                            <select
                                id="severity"
                                name="severity"
                                value={formData.severity || "medium"}
                                onChange={handleChange}
                                className={getInputClass(false)}
                            >
                                <option value="low" className="bg-[#171b2e] text-white">Low - Minor cosmetic / typo</option>
                                <option value="medium" className="bg-[#171b2e] text-white">Medium - Defect in non-critical flow</option>
                                <option value="high" className="bg-[#171b2e] text-white">High - Key feature malfunctioning</option>
                                <option value="critical" className="bg-[#171b2e] text-white">Critical - System blocker / crash</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="priority" className="text-[13px] font-medium text-[#cbd2e3]">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority || "medium"}
                                onChange={handleChange}
                                className={getInputClass(false)}
                            >
                                <option value="low" className="bg-[#171b2e] text-white">Low</option>
                                <option value="medium" className="bg-[#171b2e] text-white">Medium</option>
                                <option value="high" className="bg-[#171b2e] text-white">High</option>
                                <option value="critical" className="bg-[#171b2e] text-white">Critical (Immediate)</option>
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
                                value={formData.status || "open"}
                                onChange={handleChange}
                                className={getInputClass(false)}
                            >
                                <option value="open" className="bg-[#171b2e] text-white">Open</option>
                                <option value="in-progress" className="bg-[#171b2e] text-white">In Progress</option>
                                <option value="resolved" className="bg-[#171b2e] text-white">Resolved</option>
                                <option value="closed" className="bg-[#171b2e] text-white">Closed</option>
                                <option value="reopened" className="bg-[#171b2e] text-white">Reopened</option>
                            </select>
                        </div>

                        {/* Expected Result */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="expectedResult" className="text-[13px] font-medium text-[#cbd2e3]">
                                Expected Result
                            </label>
                            <textarea
                                id="expectedResult"
                                name="expectedResult"
                                value={formData.expectedResult || ""}
                                onChange={handleChange}
                                rows={3}
                                placeholder="What behavior was expected to happen..."
                                className={textareaBaseClass}
                            />
                        </div>

                        {/* Actual Result */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="actualResult" className="text-[13px] font-medium text-[#cbd2e3]">
                                Actual Result
                            </label>
                            <textarea
                                id="actualResult"
                                name="actualResult"
                                value={formData.actualResult || ""}
                                onChange={handleChange}
                                rows={3}
                                placeholder="What actually occurred instead..."
                                className={textareaBaseClass}
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
                                value={formData.description || ""}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Provide a summary of the problem, background, or impact..."
                                className={textareaBaseClass}
                            />
                        </div>

                        {/* Steps to Reproduce */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="stepsToReproduce" className="text-[13px] font-medium text-[#cbd2e3]">
                                Steps to Reproduce
                            </label>
                            <textarea
                                id="stepsToReproduce"
                                name="stepsToReproduce"
                                value={formData.stepsToReproduce || ""}
                                onChange={handleChange}
                                rows={3}
                                placeholder="1. Navigate to /checkout&#10;2. Click on 'Place Order' with Apple Pay&#10;3. Observe HTTP 500 error on network tab"
                                className={textareaBaseClass}
                            />
                        </div>
                
                        {/* Attachments & Screenshots */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label className="text-[13px] font-medium text-[#cbd2e3]">
                                Attachments & Screenshots
                            </label>

                            <div className="border-2 border-dashed border-[#30364d] rounded-xl p-6 text-center bg-[#0f1322]/50 hover:border-[#5865f2] transition-colors cursor-pointer relative mb-2">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                                />
                                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                                    <div className="w-12 h-12 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-xl font-bold">
                                        +
                                    </div>
                                    <p className="text-white text-[14px] font-medium m-0">
                                        Click or drag files to upload defect screenshots or logs
                                    </p>
                                    <span className="text-[#7f8aa5] text-[12px]">
                                        Supports PNG, JPG, GIF, PDF, ZIP (Max 5 files total)
                                    </span>
                                </div>
                            </div>

                            {/* Existing Attachments */}
                            {existingAttachments.length > 0 && (
                                <div className="mb-3">
                                    <h4 className="text-[#8f9bb3] text-[13px] font-medium uppercase tracking-wider mb-2">
                                        Current Attachments ({existingAttachments.length})
                                    </h4>
                                    <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1 gap-3">
                                        {existingAttachments.map((att, index) => {
                                            const fullUrl = getFileUrl(att);
                                            const isImg = isImageFile(att);
                                            const fileName = att.split(/[/\\]/).pop();

                                            return (
                                                <div
                                                    key={`existing-${index}`}
                                                    className="bg-[#0f1322] border border-[#30364d] rounded-lg p-2 flex flex-col group overflow-hidden"
                                                >
                                                    {isImg ? (
                                                        <div
                                                            className="w-full h-24 rounded bg-[#171b2e] flex items-center justify-center overflow-hidden cursor-pointer"
                                                            onClick={() => setPreviewImage(fullUrl)}
                                                        >
                                                            <img
                                                                src={fullUrl}
                                                                alt={fileName}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={fullUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="w-full h-24 rounded bg-[#171b2e] flex flex-col items-center justify-center text-[#9fc5ff] no-underline hover:text-white"
                                                        >
                                                            <span className="text-2xl font-bold">📄</span>
                                                            <span className="text-[11px] truncate max-w-[90%] px-1">
                                                                {fileName}
                                                            </span>
                                                        </a>
                                                    )}
                                                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#202742]">
                                                        <span className="text-[11px] text-[#7f8aa5] truncate max-w-[120px]" title={fileName}>
                                                            {fileName}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingAttachment(index)}
                                                            className="text-[#ff9da9] hover:text-[#ff5c5c] text-[11px] bg-transparent border-none cursor-pointer font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* New Files */}
                            {newFiles.length > 0 && (
                                <div>
                                    <h4 className="text-[#8f9bb3] text-[13px] font-medium uppercase tracking-wider mb-2">
                                        New Files to Upload ({newFiles.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {newFiles.map((file, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="flex items-center gap-2 py-1.5 px-3 bg-[#202742] border border-[#313d66] rounded-md text-[13px] text-[#9fc5ff]"
                                            >
                                                <span className="truncate max-w-[180px]">{file.name}</span>
                                                <span className="text-[#7f8aa5] text-[11px]">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(index)}
                                                    className="text-[#ff9da9] hover:text-[#ff5c5c] bg-transparent border-none cursor-pointer font-bold ml-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-[#30364d] col-span-2 max-md:col-span-1 max-sm:flex-col-reverse">
                            <button
                                type="button"
                                className="py-2.5 px-5 border border-[#30364d] rounded-lg bg-transparent text-[#cbd2e3] text-[14px] font-medium cursor-pointer hover:bg-[#20253a] hover:text-white transition-colors max-sm:w-full"
                                onClick={() => navigate("/bugs")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="py-2.5 px-6 border-none rounded-lg bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#4752c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                        {isEditMode ? "Updating..." : "Saving..."}
                                    </>
                                ) : isEditMode ? (
                                    "Update Bug"
                                ) : (
                                    "Create Bug"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
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
                            alt="Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateBug;
