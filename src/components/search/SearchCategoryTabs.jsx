import React from "react";
import {
    FiLayers,
    FiFolder,
    FiCheckSquare,
    FiAlertCircle,
    FiUsers,
    FiBriefcase,
    FiUserCheck,
} from "react-icons/fi";

const CATEGORIES = [
    { key: "all", label: "All", icon: FiLayers },
    { key: "tasks", label: "Tasks", icon: FiCheckSquare },
    { key: "bugs", label: "Bugs", icon: FiAlertCircle },
    { key: "projects", label: "Projects", icon: FiFolder },
    { key: "users", label: "People", icon: FiUsers },
    { key: "clients", label: "Clients", icon: FiUserCheck },
    { key: "companies", label: "Companies", icon: FiBriefcase },
];

const SearchCategoryTabs = ({ activeCategory, onSelectCategory, counts = {} }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#282e45] pb-4">
            {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = cat.key === "all" ? counts.total ?? 0 : counts[cat.key] ?? 0;
                const isActive = activeCategory === cat.key;

                return (
                    <button
                        key={cat.key}
                        onClick={() => onSelectCategory(cat.key)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                            isActive
                                ? "bg-[#5865f2] text-white shadow-sm"
                                : "bg-[#171b2e] text-[#8f9bb3] hover:text-white hover:bg-[#222942] border border-[#30364d]"
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                        <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? "bg-white/20 text-white" : "bg-[#282e45] text-[#8f9bb3]"
                            }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default SearchCategoryTabs;
