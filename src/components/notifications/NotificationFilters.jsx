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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#252c48]">
            {FILTER_OPTIONS.map((opt) => {
                const isActive = activeFilter === opt.key;
                const count = counts[opt.key] ?? 0;

                return (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => onFilterChange(opt.key)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all shrink-0 cursor-pointer ${
                            isActive
                                ? "bg-[#5865f2] text-white shadow-md shadow-[#5865f2]/20"
                                : "bg-[#171b2e] text-[#8f9bb5] hover:text-[#dbe1f2] hover:bg-[#1f253d] border border-[#262c45]"
                        }`}
                    >
                        <span>{opt.label}</span>
                        {count > 0 && (
                            <span
                                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-[#232942] text-[#9fc5ff]"
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
