import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./MainLayout.css";

const MainLayout = () => {
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const openProfile = () => {
        navigate("/profile");
    };

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="main-layout">

            <Sidebar
                onProfileClick={openProfile}
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <div className="main-layout-content">

                <Header onProfileClick={openProfile} />

                <main className="main-layout-body">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default MainLayout;