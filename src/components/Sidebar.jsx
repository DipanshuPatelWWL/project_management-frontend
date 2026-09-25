import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FiChevronLeft,
    FiChevronRight,
    FiGrid,
    FiUsers,
    FiBriefcase,
    FiUser,
    FiFolder,
    FiLayers,
    FiCheckSquare,
    FiAlertCircle,
    FiClock,
    FiCalendar,
    FiFileText,
    FiBarChart2,
    FiLogOut
} from "react-icons/fi";

const NAV_SECTIONS = [
    {
        section: "Management",
        items: [
            {
                label: "Users",
                path: "/users",
                icon: FiUsers,
                roles: ["SuperAdmin", "Admin"]
            },
            {
                label: "Companies",
                path: "/companies",
                icon: FiBriefcase,
                roles: ["SuperAdmin", "Admin"]
            },
            {
                label: "Clients",
                path: "/clients",
                icon: FiUser,
                roles: ["SuperAdmin", "Admin", "ProjectManager"]
            }
        ]
    },
    {
        section: "Projects",
        items: [
            {
                label: "Projects",
                path: "/project",
                icon: FiFolder,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA",
                    "Client"
                ]
            },
            {
                label: "Sprints",
                path: "/sprints",
                icon: FiLayers,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA"
                ]
            },
            {
                label: "Tasks",
                path: "/tasks",
                icon: FiCheckSquare,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA"
                ]
            }
        ]
    },
    {
        section: "Work",
        items: [
            {
                label: "Bugs",
                path: "/bugs",
                icon: FiAlertCircle,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA"
                ]
            },
            {
                label: "Time Logs",
                path: "/timelogs",
                icon: FiClock,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA"
                ]
            },
            {
                label: "Meetings",
                path: "/meetings",
                icon: FiCalendar,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA",
                    "Client"
                ]
            }
        ]
    },
    {
        section: "Resources",
        items: [
            {
                label: "Documents",
                path: "/documents",
                icon: FiFileText,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA",
                    "Client"
                ]
            },
            {
                label: "Reports",
                path: "/reports",
                icon: FiBarChart2,
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "QA"
                ]
            }
        ]
    }
];

const Sidebar = ({ onProfileClick, collapsed, onToggle }) => {
    const { user, logout } = useAuth();
    const role = user?.role;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside
            className={`min-h-screen h-screen shrink-0 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#151a2d] via-[#111629] to-[#0d1222] border-r border-[#252c45] text-[#d7dbea] shadow-[6px_0_25px_rgba(0,0,0,0.25)] z-10 transition-[width,padding] duration-[280ms] ease-in-out ${
                collapsed
                    ? "w-[92px] px-2 py-5"
                    : "w-[270px] max-[900px]:w-[250px] max-[700px]:w-[230px] max-[500px]:w-[220px] px-3.5 py-5"
            }`}
        >
            <div className="flex items-center min-h-[58px] mb-[18px] pb-[18px] border-b border-[#252c45]">
                <div className={`flex items-center min-w-0 shrink-0 ${collapsed ? "pl-0" : "pl-1.5"}`}>
                    <div className="w-[38px] h-[38px] shrink-0 flex items-center justify-center rounded-[9px] bg-[#4f46e5] text-white text-[12px] font-extrabold tracking-[0.5px] shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:bg-[#6366f1] hover:-translate-y-0.5 transition-all">
                        PM
                    </div>

                    <span
                        className={`ml-[11px] text-[#f1f5f9] text-[17px] font-semibold whitespace-nowrap transition-all duration-200 ${
                            collapsed
                                ? "w-0 ml-0 opacity-0 -translate-x-2 overflow-hidden"
                                : "opacity-100 translate-x-0"
                        }`}
                    >
                        PM System
                    </span>
                </div>

                <button
                    className="ml-auto w-[34px] h-[34px] border border-[#2e3758] bg-[#1c233c] text-[#cbd5e1] rounded-[9px] flex items-center justify-center cursor-pointer hover:bg-[#273154] hover:border-[#4f46e5] hover:text-white transition-all"
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <FiChevronRight />
                    ) : (
                        <FiChevronLeft />
                    )}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 pr-1">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `group w-full min-h-[46px] my-1 px-3.5 relative flex items-center text-[14px] font-medium border border-transparent rounded-[9px] box-border transition-all duration-200 ${
                            collapsed ? "justify-center !px-0 hover:translate-x-0" : "hover:translate-x-[3px]"
                        } ${
                            isActive
                                ? "text-white font-semibold bg-gradient-to-r from-[#3730a3] to-[#4f46e5] border-[#5b5ff0] shadow-[0_6px_18px_rgba(79,70,229,0.22)] before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[#a5b4fc] before:rounded-r"
                                : "text-[#aeb6ca] hover:text-white hover:bg-[#1e263d] hover:border-[#2b3552]"
                        }`
                    }
                    title={collapsed ? "Dashboard" : ""}
                >
                    {({ isActive }) => (
                        <>
                            <FiGrid
                                className={`w-[19px] h-[19px] shrink-0 transition-all duration-200 group-hover:scale-105 ${
                                    isActive ? "text-white" : "text-[#7c86a3] group-hover:text-[#818cf8]"
                                }`}
                            />
                            <span
                                className={`ml-[13px] whitespace-nowrap transition-all duration-200 ${
                                    collapsed
                                        ? "w-0 ml-0 opacity-0 -translate-x-2 overflow-hidden"
                                        : "opacity-100 translate-x-0"
                                }`}
                            >
                                Dashboard
                            </span>
                        </>
                    )}
                </NavLink>

                {NAV_SECTIONS.map((section) => {
                    const visibleItems = section.items.filter((item) =>
                        item.roles.includes(role)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div
                            className="mt-4 flex flex-col gap-1"
                            key={section.section}
                        >
                            <p
                                className={`text-[11px] uppercase tracking-[1px] text-[#64748b] font-bold ${
                                    collapsed ? "text-center mx-0 text-[10px]" : "my-1.5 ml-3"
                                }`}
                            >
                                {section.section}
                            </p>

                            {visibleItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `group w-full min-h-[46px] my-1 px-3.5 relative flex items-center text-[14px] font-medium border border-transparent rounded-[9px] box-border transition-all duration-200 ${
                                                collapsed ? "justify-center !px-0 hover:translate-x-0" : "hover:translate-x-[3px]"
                                            } ${
                                                isActive
                                                    ? "text-white font-semibold bg-gradient-to-r from-[#3730a3] to-[#4f46e5] border-[#5b5ff0] shadow-[0_6px_18px_rgba(79,70,229,0.22)] before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[#a5b4fc] before:rounded-r"
                                                    : "text-[#aeb6ca] hover:text-white hover:bg-[#1e263d] hover:border-[#2b3552]"
                                            }`
                                        }
                                        title={collapsed ? item.label : ""}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    className={`w-[19px] h-[19px] shrink-0 transition-all duration-200 group-hover:scale-105 ${
                                                        isActive ? "text-white" : "text-[#7c86a3] group-hover:text-[#818cf8]"
                                                    }`}
                                                />
                                                <span
                                                    className={`ml-[13px] whitespace-nowrap transition-all duration-200 ${
                                                        collapsed
                                                            ? "w-0 ml-0 opacity-0 -translate-x-2 overflow-hidden"
                                                            : "opacity-100 translate-x-0"
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            <div className="relative mt-[15px] pt-4 border-t border-[#252c45]">
                <button
                    className={`w-full min-h-[44px] flex items-center px-3.5 rounded-[9px] cursor-pointer text-[14px] font-semibold transition-all duration-200 mb-2 bg-[#1a2135] text-[#aeb6ca] border border-[#293149] hover:bg-[#252e48] hover:text-white hover:border-[#3a4665] hover:-translate-y-0.5 ${
                        collapsed ? "justify-center !px-0" : ""
                    }`}
                    onClick={onProfileClick}
                    title={collapsed ? "Profile" : ""}
                >
                    <FiUser className="w-[18px] h-[18px] shrink-0" />
                    <span
                        className={`ml-2.5 whitespace-nowrap transition-all duration-200 ${
                            collapsed ? "w-0 ml-0 opacity-0 overflow-hidden" : "opacity-100"
                        }`}
                    >
                        Profile
                    </span>
                </button>

                <button
                    className={`w-full min-h-[44px] flex items-center px-3.5 rounded-[9px] cursor-pointer text-[14px] font-semibold transition-all duration-200 bg-[#151b2d] text-[#aeb6ca] border border-[#293149] hover:bg-[#9f1239] hover:border-[#be123c] hover:text-white hover:-translate-y-0.5 ${
                        collapsed ? "justify-center !px-0" : ""
                    }`}
                    onClick={handleLogout}
                    title={collapsed ? "Logout" : ""}
                >
                    <FiLogOut className="w-[18px] h-[18px] shrink-0" />
                    <span
                        className={`ml-2.5 whitespace-nowrap transition-all duration-200 ${
                            collapsed ? "w-0 ml-0 opacity-0 overflow-hidden" : "opacity-100"
                        }`}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;