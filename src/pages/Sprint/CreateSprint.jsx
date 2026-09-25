import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as sprintService from "../../services/sprintService";
import * as projectService from "../../services/projectService";
import Loader from "../../components/Loader";

const inputBaseClass = "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";
const readonlyClass = "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";
const getInputClass = (hasError, isReadonly = false) => {
    let cls = inputBaseClass;
    if (isReadonly) cls += ` ${readonlyClass}`;
    if (hasError) cls += " field-error";
    return cls;
};

const initialFormState = {
    sprintId: "",
    sprintName: "",
    sprintgoal: "",
    project: "",
    startDate: "",
    endDate: "",
    status: "planning",
    progress: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
};

const CreateSprint = () => {
    const navigate = useNavigate();
    const { sprintId } = useParams();

    const isEditMode = Boolean(sprintId);

    const [formData, setFormData] = useState(initialFormState);
    const [auditInfo, setAuditInfo] = useState(null);

    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // Load projects list for project dropdown
    useEffect(() => {
        const fetchProjects = async () => {
            setProjectsLoading(true);
            try {
                const res = await projectService.getProjects();
                setProjects(res.projects || res || []);
            } catch (err) {
                console.error("Failed to load projects:", err);
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Load preview of next Sprint ID for create mode (same logic as Client & Project)
    const loadNextSprintId = async () => {
        try {
            const data = await sprintService.getSprints();
            if (data?.nextSprintId) {
                setFormData((prev) => ({
                    ...prev,
                    sprintId: data.nextSprintId,
                }));
            }
        } catch (err) {
            console.error("Failed to load next Sprint ID:", err);
        }
    };

    useEffect(() => {
        if (isEditMode) return;
        loadNextSprintId();
    }, [isEditMode]);

    // Helper: format ISO date to YYYY-MM-DD
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

    // Load existing sprint data when in edit mode
    useEffect(() => {
        if (!isEditMode) return;

        const fetchSprint = async () => {
            setPageLoading(true);
            setError("");

            try {
                const data = await sprintService.getSprintById(sprintId);
                const sprint = data.sprint || data;

                setFormData({
                    sprintId: sprint.sprintId || "",
                    sprintName: sprint.sprintName || "",
                    sprintgoal: sprint.sprintgoal || "",
                    project:
                        typeof sprint.project === "object" && sprint.project !== null
                            ? sprint.project._id || ""
                            : sprint.project || "",
                    startDate: formatDateForInput(sprint.startDate),
                    endDate: formatDateForInput(sprint.endDate),
                    status: sprint.status || "planning",
                    progress: Number(sprint.progress) || 0,
                    totalTasks: Number(sprint.totalTasks) || 0,
                    completedTasks: Number(sprint.completedTasks) || 0,
                    totalStoryPoints: Number(sprint.totalStoryPoints) || 0,
                    completedStoryPoints: Number(sprint.completedStoryPoints) || 0,
                });

                setAuditInfo({
                    createdBy: sprint.createdBy,
                    createdAt: sprint.createdAt,
                    updatedBy: sprint.updatedBy,
                    updatedAt: sprint.updatedAt,
                });
            } catch (err) {
                setError(
                    err.response?.data?.message || "Could not load sprint details."
                );
            } finally {
                setPageLoading(false);
            }
        };

        fetchSprint();
    }, [sprintId, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
        if (fieldErrors[name] || fieldErrors.startDate || fieldErrors.endDate || fieldErrors.totalTasks || fieldErrors.completedTasks || fieldErrors.totalStoryPoints || fieldErrors.completedStoryPoints) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                if (name === "startDate" || name === "endDate") {
                    delete next.startDate;
                    delete next.endDate;
                }
                if (name === "totalTasks" || name === "completedTasks") {
                    delete next.totalTasks;
                    delete next.completedTasks;
                }
                if (name === "totalStoryPoints" || name === "completedStoryPoints") {
                    delete next.totalStoryPoints;
                    delete next.completedStoryPoints;
                }
                return next;
            });
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const requiredFields = ["sprintName", "project", "startDate", "endDate"];
        const errors = {};
        requiredFields.forEach((field) => {
            if (!formData[field] || !String(formData[field]).trim()) {
                errors[field] = true;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please fill all required fields");
            return;
        }

        setFieldErrors({});

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) < new Date(formData.startDate)) {
                setFieldErrors({ startDate: true, endDate: true });
                setError("End Date cannot be before Start Date.");
                return;
            }
        }

        const totalTasks = Number(formData.totalTasks) || 0;
        const completedTasks = Number(formData.completedTasks) || 0;
        if (completedTasks > totalTasks) {
            setFieldErrors({ totalTasks: true, completedTasks: true });
            setError("Total tasks must be greater than or equal to completed tasks");
            return;
        }

        const totalStoryPoints = Number(formData.totalStoryPoints) || 0;
        const completedStoryPoints = Number(formData.completedStoryPoints) || 0;
        if (completedStoryPoints > totalStoryPoints) {
            setFieldErrors({ totalStoryPoints: true, completedStoryPoints: true });
            setError("Total story points must be greater than or equal to completed story points");
            return;
        }

        const payload = {
            ...formData,
            progress: Number(formData.progress) || 0,
            totalTasks: Number(formData.totalTasks) || 0,
            completedTasks: Number(formData.completedTasks) || 0,
            totalStoryPoints: Number(formData.totalStoryPoints) || 0,
            completedStoryPoints: Number(formData.completedStoryPoints) || 0,
        };

        setSubmitting(true);

        try {
            if (isEditMode) {
                await sprintService.updateSprint(sprintId, payload);
                setSuccess("Sprint updated successfully!");
            } else {
                await sprintService.createSprint(payload);
                setSuccess("Sprint created successfully!");
            }

            setTimeout(() => {
                navigate("/sprints");
            }, 800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                `Failed to ${isEditMode ? "update" : "create"} sprint.`
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
                    <h1 className="m-0 text-[22px] font-semibold text-white">{isEditMode ? "Edit Sprint" : "Create Sprint"}</h1>

                    <button
                        type="button"
                        className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
                        onClick={() => navigate("/sprints")}
                    >
                        Back to Sprints
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-7 max-sm:p-5">
                    {error && <div className="mb-5 p-[12px_14px] border border-[#7f1d1d] rounded-[7px] bg-[#2a1518] text-[#fca5a5] text-[13px]">{error}</div>}
                    {success && <div className="mb-5 p-[12px_14px] border border-[#166534] rounded-[7px] bg-[#14251b] text-[#86efac] text-[13px]">{success}</div>}

                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                        {/* Sprint ID */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="sprintId" className="text-[13px] font-medium text-[#cbd2e3]">Sprint ID</label>
                            <input
                                id="sprintId"
                                type="text"
                                name="sprintId"
                                className={getInputClass(false, true)}
                                value={formData.sprintId || "Auto-generated"}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* Sprint Name */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="sprintName" className="text-[13px] font-medium text-[#cbd2e3]">
                                Sprint Name <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="sprintName"
                                type="text"
                                name="sprintName"
                                className={getInputClass(fieldErrors.sprintName)}
                                placeholder="e.g. Sprint 1 - Core Authentication"
                                value={formData.sprintName}
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

                        {/* Status */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="status" className="text-[13px] font-medium text-[#cbd2e3]">Status</label>
                            <select
                                id="status"
                                name="status"
                                className={getInputClass(false)}
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="planning" className="bg-[#171b2e] text-white">Planning</option>
                                <option value="active" className="bg-[#171b2e] text-white">Active</option>
                                <option value="completed" className="bg-[#171b2e] text-white">Completed</option>
                                <option value="cancelled" className="bg-[#171b2e] text-white">Cancelled</option>
                            </select>
                        </div>

                        {/* Sprint Goal */}
                        <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                            <label htmlFor="sprintgoal" className="text-[13px] font-medium text-[#cbd2e3]">Sprint Goal</label>
                            <textarea
                                id="sprintgoal"
                                name="sprintgoal"
                                className="w-full h-auto min-h-[80px] py-2.5 px-[13px] resize-y border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]"
                                placeholder="Describe the goal and core deliverables for this sprint..."
                                value={formData.sprintgoal}
                                onChange={handleChange}
                            />
                            <span className="text-[12px] text-[#7f8aa5]">
                                Main business outcome or user value expected from this sprint.
                            </span>
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

                        {/* End Date */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="endDate" className="text-[13px] font-medium text-[#cbd2e3]">
                                End Date <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                name="endDate"
                                className={getInputClass(fieldErrors.endDate)}
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="progress" className="text-[13px] font-medium text-[#cbd2e3]">Progress (%)</label>
                            <input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                name="progress"
                                className={getInputClass(false)}
                                value={formData.progress}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Total Tasks */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="totalTasks" className="text-[13px] font-medium text-[#cbd2e3]">Total Tasks</label>
                            <input
                                id="totalTasks"
                                type="number"
                                min="0"
                                name="totalTasks"
                                className={getInputClass(fieldErrors.totalTasks)}
                                value={formData.totalTasks}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Completed Tasks */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="completedTasks" className="text-[13px] font-medium text-[#cbd2e3]">Completed Tasks</label>
                            <input
                                id="completedTasks"
                                type="number"
                                min="0"
                                name="completedTasks"
                                className={getInputClass(fieldErrors.completedTasks)}
                                value={formData.completedTasks}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Total Story Points */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="totalStoryPoints" className="text-[13px] font-medium text-[#cbd2e3]">Total Story Points</label>
                            <input
                                id="totalStoryPoints"
                                type="number"
                                min="0"
                                name="totalStoryPoints"
                                className={getInputClass(fieldErrors.totalStoryPoints)}
                                value={formData.totalStoryPoints}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Completed Story Points */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="completedStoryPoints" className="text-[13px] font-medium text-[#cbd2e3]">Completed Story Points</label>
                            <input
                                id="completedStoryPoints"
                                type="number"
                                min="0"
                                name="completedStoryPoints"
                                className={getInputClass(fieldErrors.completedStoryPoints)}
                                value={formData.completedStoryPoints}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Audit Information in Edit Mode */}
                    {isEditMode && auditInfo && (
                        <div className="mt-7 pt-5 border-t border-[#30364d]">
                            <h3 className="m-0 mb-4 text-white text-[15px] font-semibold">Audit & History</h3>
                            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                                <div className="flex flex-col gap-1 bg-[#141829] border border-[#282e45] rounded-md p-[10px_14px]">
                                    <span className="text-[11px] text-[#7f8aa5] uppercase tracking-[0.04em]">Created By</span>
                                    <strong className="text-[13px] text-[#e2e8f0]">{getUserName(auditInfo.createdBy)}</strong>
                                </div>

                                <div className="flex flex-col gap-1 bg-[#141829] border border-[#282e45] rounded-md p-[10px_14px]">
                                    <span className="text-[11px] text-[#7f8aa5] uppercase tracking-[0.04em]">Created At</span>
                                    <strong className="text-[13px] text-[#e2e8f0]">
                                        {auditInfo.createdAt
                                            ? new Date(auditInfo.createdAt).toLocaleString()
                                            : "-"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1 bg-[#141829] border border-[#282e45] rounded-md p-[10px_14px]">
                                    <span className="text-[11px] text-[#7f8aa5] uppercase tracking-[0.04em]">Last Updated By</span>
                                    <strong className="text-[13px] text-[#e2e8f0]">
                                        {getUserName(auditInfo.updatedBy || auditInfo.createdBy)}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1 bg-[#141829] border border-[#282e45] rounded-md p-[10px_14px]">
                                    <span className="text-[11px] text-[#7f8aa5] uppercase tracking-[0.04em]">Last Updated At</span>
                                    <strong className="text-[13px] text-[#e2e8f0]">
                                        {auditInfo.updatedAt
                                            ? new Date(auditInfo.updatedAt).toLocaleString()
                                            : "-"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end items-center max-sm:flex-col gap-3 mt-7 pt-5 border-t border-[#282e45]">
                        <button
                            type="button"
                            className="py-2.5 px-5 max-sm:w-full border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[14px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => navigate("/sprints")}
                            disabled={submitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="py-2.5 px-6 max-sm:w-full border-none rounded-[7px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#4752c4] disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Saving..."
                                : isEditMode
                                ? "Update Sprint"
                                : "Create Sprint"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSprint;
