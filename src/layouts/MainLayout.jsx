import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

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
        <div className="flex w-full h-screen overflow-hidden bg-[#0d0f1a]">

            <Sidebar
                onProfileClick={openProfile}
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <div className="flex-1 min-w-0 min-h-0 h-screen flex flex-col overflow-hidden transition-[width] duration-[280ms] ease-in-out">

                <Header onProfileClick={openProfile} />

                <main className="p-6 flex-1 min-w-0 min-h-0 bg-[#0d0f1a] overflow-y-auto overflow-x-hidden box-border">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default MainLayout;