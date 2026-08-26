import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";

// Ye component check karega — user logged in hai ya nahi
// Agar nahi hai, use Login page pe bhej dega
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
            {/* Public routes — bina login ke bhi khul sakte hain */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected route — sirf login ke baad */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <div>Dashboard (abhi khaali hai)</div>
                    </ProtectedRoute>
                }
            />

            {/* Agar koi bhi galat URL kholi, login pe bhej do */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;