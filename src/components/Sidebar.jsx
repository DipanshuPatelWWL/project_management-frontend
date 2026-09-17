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
import "./Sidebar.css";

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
                path: "/projects",
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
        <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
            <div className="sidebar-top">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        PM
                    </div>

                    <span className="sidebar-logo-text">
                        PM System
                    </span>
                </div>

                <button
                    className="sidebar-toggle"
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

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                    title={collapsed ? "Dashboard" : ""}
                >
                    <FiGrid className="icon" />

                    <span className="sidebar-link-text">
                        Dashboard
                    </span>
                </NavLink>

                {NAV_SECTIONS.map((section) => {
                    const visibleItems = section.items.filter((item) =>
                        item.roles.includes(role)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div
                            className="sidebar-section"
                            key={section.section}
                        >
                            <p className="sidebar-section-title">
                                {section.section}
                            </p>

                            {visibleItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "sidebar-link active"
                                                : "sidebar-link"
                                        }
                                        title={collapsed ? item.label : ""}
                                    >
                                        <Icon className="icon" />

                                        <span className="sidebar-link-text">
                                            {item.label}
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                <button
                    className="sidebar-profile"
                    onClick={onProfileClick}
                    title={collapsed ? "Profile" : ""}
                >
                    <FiUser />
                    <span>Profile</span>
                </button>

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                    title={collapsed ? "Logout" : ""}
                >
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;