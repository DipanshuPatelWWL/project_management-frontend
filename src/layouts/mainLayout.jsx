import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./MainLayout.css";

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-layout-content">
            <Header />
                <main className="main-layout-body">
            <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;