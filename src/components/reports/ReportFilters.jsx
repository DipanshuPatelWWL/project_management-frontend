import React from "react";
import { FiFilter, FiRotateCcw, FiCalendar } from "react-icons/fi";

const selectBaseClass =
    "h-10 px-3 border border-[#2b334f] rounded-lg bg-[#0e1222] text-[#e2e8f0] text-[13px] outline-none transition-all duration-200 hover:border-[#404c72] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30 cursor-pointer min-w-[170px]";

const inputDateClass =
    "h-10 px-3 border border-[#2b334f] rounded-lg bg-[#0e1222] text-[#e2e8f0] text-[13px] outline-none transition-all duration-200 hover:border-[#404c72] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30 min-w-[140px]";

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
        <div className="bg-[#141829] border border-[#232a42] rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#94a3b8] text-[13px] font-semibold uppercase tracking-wider">
                    <FiFilter className="text-[#6366f1]" size={16} />
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
                                <option value="" className="bg-[#141829] text-[#94a3b8]">
                                    All Projects
                                 </option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id} className="bg-[#141829] text-white">
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
                                <option value="" className="bg-[#141829] text-[#94a3b8]">
                                    All Sprints
                                </option>
                                {sprints.map((s) => (
                                    <option key={s._id} value={s._id} className="bg-[#141829] text-white">
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
                                <option value="" className="bg-[#141829] text-[#94a3b8]">
                                    All Employees
                                </option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id} className="bg-[#141829] text-white">
                                        {`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date Range Filters */}
                    {showDateRange && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#0e1222] border border-[#2b334f] rounded-lg px-2.5">
                                <FiCalendar className="text-[#64748b]" size={14} />
                                <input
                                    id="report-filter-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
                                    className="h-10 bg-transparent text-[#e2e8f0] text-[13px] outline-none"
                                    disabled={loading}
                                />
                            </div>
                            <span className="text-[#64748b] text-[12px]">to</span>
                            <div className="flex items-center gap-1.5 bg-[#0e1222] border border-[#2b334f] rounded-lg px-2.5">
                                <FiCalendar className="text-[#64748b]" size={14} />
                                <input
                                    id="report-filter-end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)}
                                    className="h-10 bg-transparent text-[#e2e8f0] text-[13px] outline-none"
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
                            className="h-10 px-3.5 rounded-lg border border-[#2d3748] bg-[#1a2035] hover:bg-[#252e4b] text-[#cbd5e1] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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
