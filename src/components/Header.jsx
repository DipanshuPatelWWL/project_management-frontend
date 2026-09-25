import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

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
    "/bugs": "Bugs",
    "/timelogs": "Time Logs",
    "/meetings": "Meetings",
    "/documents": "Documents",
    "/reports": "Reports",
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
        } else {
            pageTitle = "Project Management";
        }
    }

    return (
        <header className="flex justify-between items-center py-3 px-6 border-b border-[#282e45] bg-[#171b2e]">
            <h2 className="text-[18px] font-bold m-0 text-white">{pageTitle}</h2>

            <div className="flex items-center gap-5">
                <NotificationBell />

                {user && (
                    <button
                        className="flex items-center gap-2 bg-transparent border-0 cursor-pointer py-1 px-1.5 rounded-[6px] hover:bg-[#222942] transition-colors"
                        onClick={onProfileClick}
                    >
                        <span className="w-8 h-8 rounded-full bg-[#5865f2] text-white flex items-center justify-center text-[13px] font-bold uppercase overflow-hidden shrink-0">
                            {user.profileImage ? (
                                <img
                                    src={`http://localhost:5000${user.profileImage}`}
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