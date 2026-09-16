import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProfileModal from "../components/ProfileModal";
import "./MainLayout.css";

const MainLayout = () => {
    const [profileOpen, setProfileOpen] = useState(false);

    const openProfile = () => setProfileOpen(true);
    const closeProfile = () => setProfileOpen(false);

    return (
        <div className="main-layout">
            <Sidebar onProfileClick={openProfile} />
            <div className="main-layout-content">
                <Header onProfileClick={openProfile} />
                <main className="main-layout-body">
                    <Outlet />
                </main>
            </div>

            <ProfileModal open={profileOpen} onClose={closeProfile} />
        </div>
    );
};

export default MainLayout;