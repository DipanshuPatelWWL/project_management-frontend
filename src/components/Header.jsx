import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import "./Header.css";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/users/create": "CreateUser",
  "/companies": "Companies",
  "/clients": "Clients",
  "/projects": "Projects",
  "/sprints": "Sprints",
  "/tasks": "Tasks",
  "/bugs": "Bugs",
  "/timelogs": "Time Logs",
  "/meetings": "Meetings",
  "/documents": "Documents",
  "/reports": "Reports",
  "/users": "Users",
};

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || "Project Management";

  return (
    <header className="app-header">
      <h2 className="app-header-title">{pageTitle}</h2>

      <div className="app-header-actions">
        <div className="app-header-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." />
        </div>

        <NotificationBell />

        {user && (
          <div className="app-header-user">
            <span className="app-header-avatar">
              {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
            </span>
            <span className="app-header-username">{user.firstName}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
