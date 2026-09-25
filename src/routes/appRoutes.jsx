import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import Users from "../pages/users/Users";
import CreateUser from "../pages/users/CreateUser";

import Companies from "../pages/company/Company";
import CreateCompany from "../pages/company/CreateCompany";

import ComingSoon from "../pages/ComingSoon";
import MainLayout from "../layouts/MainLayout";
import Profile from "../pages/Profile";

import Clients from "../pages/Client/Client";
import CreateClient from "../pages/Client/CreateClient";

import Project from "../pages/Project/Project";
import CreateProject from "../pages/Project/CreateProject";

import Sprint from "../pages/Sprint/Sprint";
import CreateSprint from "../pages/Sprint/CreateSprint";
import Loader from "../components/Loader";


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader fullScreen size="lg" />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};


const AppRoutes = () => {
    return (
        <Routes>

            {/* Login */}
            <Route
                path="/login"
                element={<Login />}
            />


            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />



                <Route
                    path="/users"
                    element={<Users />}
                />

                <Route
                    path="/users/create"
                    element={<CreateUser />}
                />

                <Route
                    path="/users/:userId/edit"
                    element={<CreateUser />}
                />

                <Route
                    path="/companies"
                    element={<Companies />}
                />

                <Route
                    path="/companies/create"
                    element={<CreateCompany />}
                />

                <Route
                    path="/companies/edit/:companyId"
                    element={<CreateCompany />}
                />



                <Route
                    path="/profile"
                    element={<Profile />}
                />


                <Route
                    path="/clients"
                    element={<Clients />}
                />

                <Route
                    path="/clients/create"
                    element={<CreateClient />}
                />

                <Route
                    path="/clients/:clientId/edit"
                    element={<CreateClient />}
                />

                <Route
                    path="/project"
                    element={<Project />}
                />

                <Route
                    path="/project/create"
                    element={<CreateProject />}
                />

                <Route
                    path="/project/edit/:projectId"
                    element={<CreateProject />}
                />



                <Route
                    path="/projects"
                    element={<ComingSoon label="Projects" />}
                />


                <Route
                    path="/sprints"
                    element={<Sprint />}
                />

                <Route
                    path="/sprints/create"
                    element={<CreateSprint />}
                />

                <Route
                    path="/sprints/:sprintId/edit"
                    element={<CreateSprint />}
                />


             
                <Route
                    path="/tasks"
                    element={<ComingSoon label="Tasks" />}
                />


                <Route
                    path="/bugs"
                    element={<ComingSoon label="Bugs" />}
                />


                <Route
                    path="/timelogs"
                    element={<ComingSoon label="Time Logs" />}
                />


                
                <Route
                    path="/meetings"
                    element={<ComingSoon label="Meetings" />}
                />


              
                <Route
                    path="/documents"
                    element={<ComingSoon label="Documents" />}
                />


                
                <Route
                    path="/reports"
                    element={<ComingSoon label="Reports" />}
                />

            </Route>


           

            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />

        </Routes>
    );
};


export default AppRoutes;