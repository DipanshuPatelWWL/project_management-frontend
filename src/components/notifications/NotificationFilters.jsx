import React from "react";

const FILTER_OPTIONS = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
    { key: "task", label: "Tasks" },
    { key: "bug", label: "Bugs" },
    { key: "meeting", label: "Meetings" },
    { key: "project", label: "Projects" },
    { key: "general", label: "General" },
];

const NotificationFilters = ({ activeFilter = "all", onFilterChange, counts = {} }) => {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#282e45]">
            {FILTER_OPTIONS.map((opt) => {
                const isActive = activeFilter === opt.key;
                const count = counts[opt.key] ?? 0;

                return (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => onFilterChange(opt.key)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${
                            isActive
                                ? "bg-[#5865f2] text-white shadow-sm"
                                : "bg-[#171b2e] text-[#8f9bb3] hover:text-white hover:bg-[#222942] border border-[#30364d]"
                        }`}
                    >
                        <span>{opt.label}</span>
                        {count > 0 && (
                            <span
                                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-[#282e45] text-[#8f9bb3]"
                                }`}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default NotificationFilters;
