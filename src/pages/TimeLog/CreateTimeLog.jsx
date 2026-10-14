import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as timeLogService from "../../services/timeLogService";
import * as projectService from "../../services/projectService";
import * as sprintService from "../../services/sprintService";
import * as taskService from "../../services/taskService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";

const inputBaseClass =
    "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";

const textareaBaseClass =
    "w-full p-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5] resize-y min-h-[95px]";

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

const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
};


const initialTimeLogState = {
    timeLogId: "",
    project: "",
    sprint: "",
    task: "",
    workDate: getTodayDate(),
    hoursWorked: "",
    description: "",
    status: "Logged",
};

const CreateTimeLog = () => {
    const navigate = useNavigate();
    const { timeLogId } = useParams();
    const { user: currentUser } = useAuth();

    const isEditMode = Boolean(timeLogId);

    const [formData, setFormData] = useState(initialTimeLogState);
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setPageLoading(true);

                const [projRes, sprintRes, taskRes] = await Promise.all([
                    projectService.getProjects().catch(() => ({ projects: [] })),
                    sprintService.getSprints().catch(() => ({ sprints: [] })),
                    taskService.getTasks().catch(() => ({ tasks: [] })),
                ]);

                if (!isMounted) return;

                const projectList = Array.isArray(projRes?.projects)
                    ? projRes.projects
                    : Array.isArray(projRes)
                    ? projRes
                    : [];

                const sprintList = Array.isArray(sprintRes?.sprints)
                    ? sprintRes.sprints
                    : Array.isArray(sprintRes)
                    ? sprintRes
                    : [];

                const taskList = Array.isArray(taskRes?.tasks)
                    ? taskRes.tasks
                    : Array.isArray(taskRes)
                    ? taskRes
                    : [];

                setProjects(projectList);
                setSprints(sprintList);
                setTasks(taskList);

                if (isEditMode) {
                    const logRes = await timeLogService.getTimeLogById(timeLogId);
                    if (!isMounted) return;

                    const log = logRes?.timeLog || logRes;
                    if (!log) {
                        setError("Time log not found.");
                        return;
                    }

                    const formattedDate = log.workDate
                        ? new Date(log.workDate).toISOString().split("T")[0]
                        : getTodayDate();

                    setFormData({
                        timeLogId: log.timeLogId || "",
                        project: log.project?._id || (typeof log.project === "string" ? log.project : ""),
                        sprint: log.sprint?._id || (typeof log.sprint === "string" ? log.sprint : ""),
                        task: log.task?._id || (typeof log.task === "string" ? log.task : ""),
                        workDate: formattedDate,
                        hoursWorked: log.hoursWorked !== undefined ? String(log.hoursWorked) : "",
                        description: log.description || log.Description || "",
                        status: log.status || "Logged",
                    });
                } else {
                    const nextIdRes = await timeLogService.getNextTimeLogId().catch(() => ({
                        nextTimeLogId: "TL001",
                    }));
                    if (!isMounted) return;

                    const nextId = nextIdRes?.nextTimeLogId || "TL001";
                    setFormData((prev) => ({
                        ...prev,
                        timeLogId: nextId,
                    }));
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load form information."
                    );
                }
            } finally {
                if (isMounted) setPageLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [timeLogId, isEditMode]);

    // Filter sprints and tasks by selected project
    const availableSprints = useMemo(() => {
        if (!formData.project) return sprints;
        return sprints.filter((s) => {
            const pId = s.project?._id || s.project;
            return pId === formData.project;
        });
    }, [sprints, formData.project]);

    const availableTasks = useMemo(() => {
        if (!formData.project) return tasks;
        return tasks.filter((t) => {
            const pId = t.project?._id || t.project;
            return pId === formData.project;
        });
    }, [tasks, formData.project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.project) {
            errors.project = "Project is required.";
        }
        if (!formData.workDate) {
            errors.workDate = "Work date is required.";
        }
        if (!formData.hoursWorked || Number(formData.hoursWorked) <= 0) {
            errors.hoursWorked = "Hours worked must be greater than 0.";
        } else if (Number(formData.hoursWorked) > 24) {
            errors.hoursWorked = "Hours worked cannot exceed 24 in a single day.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validate()) {
            setError("Please fill in all required fields correctly.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                timeLogId: formData.timeLogId,
                project: formData.project,
                sprint: formData.sprint || undefined,
                task: formData.task || undefined,
                user: currentUser?._id,
                workDate: formData.workDate,
                hoursWorked: Number(formData.hoursWorked),
                description: formData.description?.trim() || "",
                Description: formData.description?.trim() || "",
                status: formData.status || "Logged",
            };

            if (isEditMode) {
                await timeLogService.updateTimeLog(timeLogId, payload);
                setSuccess("Time log updated successfully!");
            } else {
                await timeLogService.createTimeLog(payload);
                setSuccess("Time log created successfully!");
            }

            setTimeout(() => {
                navigate("/timelogs");
            }, 800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                (isEditMode ? "Failed to update time log." : "Failed to create time log.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="max-w-[1020px] mx-auto p-6 max-sm:p-4 text-white">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/timelogs")}
                    className="flex items-center gap-2 text-[13px] text-[#8f9ab5] hover:text-[#5969a8] transition-colors w-fit group"
                >
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    Back to Time Logs
                </button>
                <h1 className="text-[24px] font-semibold text-[#e8ebf5] tracking-tight">
                    {isEditMode ? "Edit Time Log" : "Log Work Time"}
                </h1>
                <p className="text-[13px] text-[#8f9ab5]">
                    {isEditMode
                        ? `Editing record ${formData.timeLogId}`
                        : "Record hours worked on projects, sprints, and development tasks."}
                </p>
            </div>

            {/* Error / Success Notifications */}
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
                </div>
            )}

            {/* Form Card */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-xl shadow-xl overflow-hidden">
                <form className="p-7 max-sm:p-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                        {/* TimeLog ID */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="timeLogId" className="text-[13px] font-medium text-[#cbd2e3]">
                                TimeLog ID
                            </label>
                            <input
                                id="timeLogId"
                                name="timeLogId"
                                value={formData.timeLogId || ""}
                                readOnly
                                className={getInputClass(false, true)}
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
                                value={formData.project || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Project</option>
                                {projects.map((proj) => {
                                    const id = proj._id || proj.id;
                                    const name = proj.projectName || proj.name || id;
                                    return (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </select>
                            {fieldErrors.project && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.project}</span>
                            )}
                        </div>

                        {/* Sprint (Optional) */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="sprint" className="text-[13px] font-medium text-[#cbd2e3]">
                                Sprint (Optional)
                            </label>
                            <select
                                id="sprint"
                                name="sprint"
                                className={getInputClass(false)}
                                value={formData.sprint || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Sprint (Optional)</option>
                                {availableSprints.map((sp) => {
                                    const id = sp._id || sp.id;
                                    const name = sp.sprintName || sp.name || id;
                                    return (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Task (Optional) */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="task" className="text-[13px] font-medium text-[#cbd2e3]">
                                Task (Optional)
                            </label>
                            <select
                                id="task"
                                name="task"
                                className={getInputClass(false)}
                                value={formData.task || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Task (Optional)</option>
                                {availableTasks.map((t) => {
                                    const id = t._id || t.id;
                                    const name = t.taskTitle || t.title || t.name || id;
                                    return (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Work Date */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="workDate" className="text-[13px] font-medium text-[#cbd2e3]">
                                Work Date <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="workDate"
                                name="workDate"
                                type="date"
                                className={getInputClass(fieldErrors.workDate)}
                                value={formData.workDate || ""}
                                onChange={handleChange}
                            />
                            {fieldErrors.workDate && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.workDate}</span>
                            )}
                        </div>

                        {/* Hours Worked */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="hoursWorked" className="text-[13px] font-medium text-[#cbd2e3]">
                                Hours Worked <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="hoursWorked"
                                name="hoursWorked"
                                type="number"
                                step="0.25"
                                min="0.25"
                                max="24"
                                placeholder="e.g. 7.5"
                                className={getInputClass(fieldErrors.hoursWorked)}
                                value={formData.hoursWorked || ""}
                                onChange={handleChange}
                            />
                            {fieldErrors.hoursWorked && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.hoursWorked}</span>
                            )}
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
                                value={formData.status || "Logged"}
                                onChange={handleChange}
                            >
                                <option value="Logged">Logged</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Description / Work Done */}
                        <div className="col-span-2 max-md:col-span-1 flex flex-col gap-2">
                            <label htmlFor="description" className="text-[13px] font-medium text-[#cbd2e3]">
                                Description / Notes
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className={getTextareaClass(false)}
                                value={formData.description || ""}
                                onChange={handleChange}
                                placeholder="Briefly summarize activities, modules built, or bug fixes completed..."
                            />
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-[#282e45]">
                        <button
                            type="button"
                            onClick={() => navigate("/timelogs")}
                            className="h-11 px-6 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-11 px-7 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-[13px] font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{isEditMode ? "Saving..." : "Logging Time..."}</span>
                                </>
                            ) : (
                                <span>{isEditMode ? "Save Changes" : "Log Work Time"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTimeLog;
