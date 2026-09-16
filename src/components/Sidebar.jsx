import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

// IMPORTANT: This role-based filtering is a UX convenience only.
// The backend does NOT enforce role restrictions on most of these
// resources - only Users, Companies, and Reports are actually
// role-restricted server-side.
const NAV_SECTIONS = [
    {
        section: "Management",
        items: [
            { label: "Users", path: "/users", roles: ["SuperAdmin", "Admin"] },
            { label: "Companies", path: "/companies", roles: ["SuperAdmin", "Admin"] },
            {
                label: "Clients",
                path: "/clients",
                roles: ["SuperAdmin", "Admin", "ProjectManager"],
            },
        ],
    },
    {
        section: "Projects",
        items: [
            {
                label: "Projects",
                path: "/projects",
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA",
                    "Client",
                ],
            },
            {
                label: "Sprints",
                path: "/sprints",
                roles: ["SuperAdmin", "Admin", "ProjectManager", "TeamLead", "Developer", "QA"],
            },
            {
                label: "Tasks",
                path: "/tasks",
                roles: ["SuperAdmin", "Admin", "ProjectManager", "TeamLead", "Developer", "QA"],
            },
        ],
    },
    {
        section: "Work",
        items: [
            {
                label: "Bugs",
                path: "/bugs",
                roles: ["SuperAdmin", "Admin", "ProjectManager", "TeamLead", "Developer", "QA"],
            },
            {
                label: "Time Logs",
                path: "/timelogs",
                roles: ["SuperAdmin", "Admin", "ProjectManager", "TeamLead", "Developer", "QA"],
            },
            {
                label: "Meetings",
                path: "/meetings",
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA",
                    "Client",
                ],
            },
        ],
    },
    {
        section: "Resources",
        items: [
            {
                label: "Documents",
                path: "/documents",
                roles: [
                    "SuperAdmin",
                    "Admin",
                    "ProjectManager",
                    "TeamLead",
                    "Developer",
                    "QA",
                    "Client",
                ],
            },
            {
                label: "Reports",
                path: "/reports",
                roles: ["SuperAdmin", "Admin", "ProjectManager", "TeamLead", "QA"],
            },
        ],
    },
];

const Sidebar = ({ onProfileClick }) => {
    const { user, logout } = useAuth();
    const role = user?.role;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">PM System</div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Dashboard
                </NavLink>

                {NAV_SECTIONS.map((section) => {
                    const visibleItems = section.items.filter((item) =>
                        item.roles.includes(role)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div className="sidebar-section" key={section.section}>
                            <p className="sidebar-section-title">{section.section}</p>
                            {visibleItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        isActive ? "sidebar-link active" : "sidebar-link"
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>

            <button className="sidebar-profile" onClick={onProfileClick}>
                Profile
            </button>

            <button className="sidebar-logout" onClick={handleLogout}>
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;