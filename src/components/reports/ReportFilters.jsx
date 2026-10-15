import React from "react";
import { FiFilter, FiRotateCcw, FiCalendar } from "react-icons/fi";

const selectBaseClass =
    "h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#111422] text-white text-[14px] outline-none transition-colors focus:border-[#5865f2] cursor-pointer min-w-[170px]";

const inputDateClass =
    "h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#111422] text-white text-[14px] outline-none transition-colors focus:border-[#5865f2] min-w-[140px]";

const ReportFilters = ({
    showProject = false,
    projects = [],
    selectedProject = "",
    onProjectChange,

    showSprint = false,
    sprints = [],
    selectedSprint = "",
    onSprintChange,

    showUser = false,
    users = [],
    selectedUser = "",
    onUserChange,

    showDateRange = false,
    startDate = "",
    endDate = "",
    onStartDateChange,
    onEndDateChange,

    onReset,
    loading = false,
}) => {
    return (
        <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#8f9bb3] text-[13px] font-semibold uppercase tracking-wider">
                    <FiFilter className="text-[#5865f2]" size={16} />
                    <span>Report Filters</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Project Filter */}
                    {showProject && (
                        <div className="flex flex-col min-w-0">
                            <select
                                id="report-filter-project"
                                value={selectedProject}
                                onChange={(e) => onProjectChange && onProjectChange(e.target.value)}
                                className={selectBaseClass}
                                disabled={loading}
                            >
                                <option value="" className="bg-[#171b2e] text-[#8f9bb3]">
                                    All Projects
                                </option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id} className="bg-[#171b2e] text-white">
                                        {p.projectName || p.projectId || "Untitled Project"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sprint Filter */}
                    {showSprint && (
                        <div className="flex flex-col min-w-0">
                            <select
                                id="report-filter-sprint"
                                value={selectedSprint}
                                onChange={(e) => onSprintChange && onSprintChange(e.target.value)}
                                className={selectBaseClass}
                                disabled={loading}
                            >
                                <option value="" className="bg-[#171b2e] text-[#8f9bb3]">
                                    All Sprints
                                </option>
                                {sprints.map((s) => (
                                    <option key={s._id} value={s._id} className="bg-[#171b2e] text-white">
                                        {s.sprintName || "Sprint"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* User / Employee Filter */}
                    {showUser && (
                        <div className="flex flex-col min-w-0">
                            <select
                                id="report-filter-user"
                                value={selectedUser}
                                onChange={(e) => onUserChange && onUserChange(e.target.value)}
                                className={selectBaseClass}
                                disabled={loading}
                            >
                                <option value="" className="bg-[#171b2e] text-[#8f9bb3]">
                                    All Employees
                                </option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id} className="bg-[#171b2e] text-white">
                                        {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date Range Filters */}
                    {showDateRange && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#111422] border border-[#30364d] rounded-lg px-3">
                                <FiCalendar className="text-[#8f9bb3]" size={14} />
                                <input
                                    id="report-filter-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
                                    className="h-[42px] bg-transparent text-white text-[14px] outline-none cursor-pointer"
                                    disabled={loading}
                                />
                            </div>
                            <span className="text-[#8f9bb3] text-[12px]">to</span>
                            <div className="flex items-center gap-1.5 bg-[#111422] border border-[#30364d] rounded-lg px-3">
                                <FiCalendar className="text-[#8f9bb3]" size={14} />
                                <input
                                    id="report-filter-end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)}
                                    className="h-[42px] bg-transparent text-white text-[14px] outline-none cursor-pointer"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {/* Reset Button */}
                    {onReset && (
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={loading}
                            className="h-[42px] px-4 rounded-lg border border-[#30364d] bg-[#171b2e] hover:bg-[#222942] text-[#8f9bb3] hover:text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <FiRotateCcw size={14} />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;
