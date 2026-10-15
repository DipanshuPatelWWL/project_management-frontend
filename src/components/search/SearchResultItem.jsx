import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FiFolder,
    FiCheckSquare,
    FiAlertCircle,
    FiUser,
    FiBriefcase,
    FiUserCheck,
    FiArrowRight,
} from "react-icons/fi";

const getCategoryConfig = (category) => {
    switch (category) {
        case "tasks":
            return {
                icon: FiCheckSquare,
                color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                badgeLabel: "TASK",
                badgeClass: "bg-emerald-500/20 text-emerald-300",
                getPath: () => "/tasks",
            };
        case "bugs":
            return {
                icon: FiAlertCircle,
                color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                badgeLabel: "BUG",
                badgeClass: "bg-rose-500/20 text-rose-300",
                getPath: () => "/bugs",
            };
        case "projects":
            return {
                icon: FiFolder,
                color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
                badgeLabel: "PROJECT",
                badgeClass: "bg-indigo-500/20 text-indigo-300",
                getPath: () => "/project",
            };
        case "users":
            return {
                icon: FiUser,
                color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                badgeLabel: "PEOPLE",
                badgeClass: "bg-purple-500/20 text-purple-300",
                getPath: () => "/users",
            };
        case "clients":
            return {
                icon: FiUserCheck,
                color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                badgeLabel: "CLIENT",
                badgeClass: "bg-cyan-500/20 text-cyan-300",
                getPath: () => "/clients",
            };
        case "companies":
            return {
                icon: FiBriefcase,
                color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                badgeLabel: "COMPANY",
                badgeClass: "bg-amber-500/20 text-amber-300",
                getPath: () => "/companies",
            };
        default:
            return {
                icon: FiFolder,
                color: "text-gray-400 bg-gray-500/10 border-gray-500/20",
                badgeLabel: "ITEM",
                badgeClass: "bg-gray-500/20 text-gray-300",
                getPath: () => "/dashboard",
            };
    }
};

const SearchResultItem = ({ item, category, onSelect, compact = false }) => {
    const navigate = useNavigate();
    const config = getCategoryConfig(category);
    const Icon = config.icon;

    const handleClick = () => {
        if (onSelect) onSelect(item);
        navigate(config.getPath(item));
    };

    // Extract title, subtitle, and extra badge based on category
    let title = "";
    let subtitle = "";
    let statusBadge = null;

    if (category === "tasks") {
        title = item.taskTitle || "Untitled Task";
        subtitle = item.project?.projectName
            ? `Project: ${item.project.projectName}`
            : item.description || "Task";
        if (item.status) {
            statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1e253e] text-gray-300 uppercase">
                    {item.status}
                </span>
            );
        }
    } else if (category === "bugs") {
        title = item.bugTitle || "Untitled Bug";
        subtitle = [item.bugId, item.project?.projectName ? `Project: ${item.project.projectName}` : ""]
            .filter(Boolean)
            .join(" • ");
        if (item.severity) {
            statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 uppercase">
                    {item.severity}
                </span>
            );
        }
    } else if (category === "projects") {
        title = item.projectName || "Untitled Project";
        subtitle = [item.projectId, item.client?.firstName ? `Client: ${item.client.firstName} ${item.client.lastName || ""}` : ""]
            .filter(Boolean)
            .join(" • ");
    } else if (category === "users") {
        title = `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email;
        subtitle = [item.email, item.employeeId].filter(Boolean).join(" • ");
        if (item.role) {
            statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                    {item.role}
                </span>
            );
        }
    } else if (category === "clients") {
        title = `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.companyName;
        subtitle = [item.email, item.companyName].filter(Boolean).join(" • ");
    } else if (category === "companies") {
        title = item.companyName || "Untitled Company";
        subtitle = item.email || "Company";
    }

    if (compact) {
        return (
            <div
                onClick={handleClick}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#1f243d] cursor-pointer transition group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${config.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[13px] font-medium text-white truncate group-hover:text-[#818cf8] transition">
                            {title}
                        </div>
                        {subtitle && <div className="text-[11px] text-[#8f9bb3] truncate">{subtitle}</div>}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                    {statusBadge}
                    <FiArrowRight className="w-3 h-3 text-[#8f9bb3] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-4 hover:border-[#5865f2]/60 hover:bg-[#1f243d] transition-all duration-200 cursor-pointer group shadow-sm flex items-center justify-between gap-4"
        >
            <div className="flex items-start gap-3.5 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${config.color} mt-0.5`}>
                    <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.badgeClass}`}>
                            {config.badgeLabel}
                        </span>
                        {statusBadge}
                    </div>

                    <h4 className="text-[14px] font-semibold text-white group-hover:text-[#818cf8] transition truncate">
                        {title}
                    </h4>

                    {subtitle && (
                        <p className="text-[12px] text-[#8f9bb3] mt-0.5 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#8f9bb3] group-hover:text-white shrink-0 font-medium transition">
                <span>View</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};

export default SearchResultItem;
