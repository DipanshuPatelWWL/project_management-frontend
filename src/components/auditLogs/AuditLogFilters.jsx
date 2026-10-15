import React from "react";

const AuditLogFilters = ({ filters, onFilterChange, onReset }) => {
    const hasActiveFilters = Boolean(
        filters.search ||
        filters.action ||
        filters.entityType ||
        filters.startDate ||
        filters.endDate
    );

    return (
        <div className="flex items-center gap-3 mb-5 flex-wrap max-md:flex-col max-md:items-stretch">
            {/* Search Input */}
            <input
                type="text"
                className="flex-1 min-w-[220px] h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                placeholder="Search description, user, IP, module..."
                value={filters.search || ""}
                onChange={(e) => onFilterChange("search", e.target.value)}
            />

            {/* Action Select */}
            <select
                value={filters.action || ""}
                onChange={(e) => onFilterChange("action", e.target.value)}
                className="h-[42px] min-w-[160px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
            >
                <option value="">All Events</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGIN_FAILED">LOGIN FAILED</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="STATUS_CHANGE">STATUS CHANGE</option>
                <option value="ROLE_CHANGE">ROLE CHANGE</option>
                <option value="PASSWORD_CHANGE">PASSWORD CHANGE</option>
            </select>

            {/* Module / Entity Type Select */}
            <select
                value={filters.entityType || ""}
                onChange={(e) => onFilterChange("entityType", e.target.value)}
                className="h-[42px] min-w-[150px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
            >
                <option value="">All Modules</option>
                <option value="Auth">Auth</option>
                <option value="User">User</option>
                <option value="Project">Project</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
            </select>

            {/* Date From */}
            <div className="flex items-center gap-2 max-md:w-full">
                <span className="text-[13px] text-[#8f9bb3]">From:</span>
                <input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => onFilterChange("startDate", e.target.value)}
                    className="h-[42px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-2 max-md:w-full">
                <span className="text-[13px] text-[#8f9bb3]">To:</span>
                <input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => onFilterChange("endDate", e.target.value)}
                    className="h-[42px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={onReset}
                    className="h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-[#8f9bb3] text-[13px] cursor-pointer transition-all duration-200 hover:bg-[#222942] hover:text-white hover:border-[#454d6e]"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};

export default AuditLogFilters;
