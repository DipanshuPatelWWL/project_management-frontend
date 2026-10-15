import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "./search/GlobalSearch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const PAGE_TITLES = {
    "/dashboard": "Dashboard",
    "/users": "Users",
    "/users/create": "Create User",
    "/companies": "Companies",
    "/companies/create": "Create Company",
    "/clients": "Clients",
    "/projects": "Projects",
    "/sprints": "Sprints",
    "/sprints/create": "Create Sprint",
    "/tasks": "Tasks",
    "/tasks/create": "Create Task",
    "/bugs": "Bugs",
    "/bugs/create": "Report Bug",
    "/timelogs": "Time Logs",
    "/meetings": "Meetings",
    "/documents": "Documents",
    "/notifications": "Notifications",
    "/notification": "Notifications",
    "/reports": "Reports",
    "/audit-logs": "Audit Logs",
    "/search": "Search Results",
};

const Header = ({ onProfileClick }) => {
    const { user } = useAuth();
    const location = useLocation();

    let pageTitle = PAGE_TITLES[location.pathname];
    if (!pageTitle) {
        if (location.pathname.startsWith("/sprints/edit")) {
            pageTitle = "Edit Sprint";
        } else if (location.pathname.startsWith("/sprints/")) {
            pageTitle = "Sprint Details";
        } else if (location.pathname.startsWith("/tasks/edit")) {
            pageTitle = "Edit Task";
        } else if (location.pathname.startsWith("/bugs/edit") || (location.pathname.startsWith("/bugs/") && location.pathname.endsWith("/edit"))) {
            pageTitle = "Edit Bug";
        } else if (location.pathname.startsWith("/bugs/")) {
            pageTitle = "Bug Details";
        } else {
            pageTitle = "Project Management";
        }
    }

    return (
        <header className="flex justify-between items-center py-3 px-6 border-b border-[#282e45] bg-[#171b2e] gap-4">
            <h2 className="text-[18px] font-bold m-0 text-white shrink-0 hidden md:block">{pageTitle}</h2>

            <GlobalSearch />

            <div className="flex items-center gap-5 shrink-0">
                <NotificationBell />

                {user && (
                    <button
                        className="flex items-center gap-2 bg-transparent border-0 cursor-pointer py-1 px-1.5 rounded-[6px] hover:bg-[#222942] transition-colors"
                        onClick={onProfileClick}
                    >
                        <span className="w-8 h-8 rounded-full bg-[#5865f2] text-white flex items-center justify-center text-[13px] font-bold uppercase overflow-hidden shrink-0">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage.startsWith("http") ? user.profileImage : `${API_BASE_URL}${user.profileImage}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
                            )}
                        </span>
                        <span className="text-[14px] font-medium text-[#dfe3ee]">{user.firstName}</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;