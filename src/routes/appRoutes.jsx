import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/users/Users";
import ComingSoon from "../pages/ComingSoon";
import MainLayout from "../layouts/MainLayout";
import CreateUser from "../pages/users/CreateUser";


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users/create" element={<CreateUser />} />
                <Route path="/users" element={<Users />} />

                {/* Stub routes so Sidebar links don't break - replace each
                    with a real page as it gets built */}
                <Route path="/companies" element={<ComingSoon label="Companies" />} />
                <Route path="/clients" element={<ComingSoon label="Clients" />} />
                <Route path="/projects" element={<ComingSoon label="Projects" />} />
                <Route path="/sprints" element={<ComingSoon label="Sprints" />} />
                <Route path="/tasks" element={<ComingSoon label="Tasks" />} />
                <Route path="/bugs" element={<ComingSoon label="Bugs" />} />
                <Route path="/timelogs" element={<ComingSoon label="Time Logs" />} />
                <Route path="/meetings" element={<ComingSoon label="Meetings" />} />
                <Route path="/documents" element={<ComingSoon label="Documents" />} />
                <Route path="/reports" element={<ComingSoon label="Reports" />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;