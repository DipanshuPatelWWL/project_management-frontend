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
import Task from "../pages/Task/Task";
import CreateTask from "../pages/Task/CreateTask";
import Bug from "../pages/Bug/Bug";
import CreateBug from "../pages/Bug/CreateBug";
import Meeting from "../pages/Meeting/Meeting";
import CreateMeeting from "../pages/Meeting/CreateMeeting";
import Document from "../pages/Document/Document";
import CreateDocument from "../pages/Document/CreateDocument";
import TimeLog from "../pages/TimeLog/TimeLog";
import CreateTimeLog from "../pages/TimeLog/CreateTimeLog";
import Notifications from "../pages/notifications/Notifications";
import Reports from "../pages/reports/Reports";
import ProjectReports from "../pages/reports/ProjectReports";
import TaskReports from "../pages/reports/TaskReports";
import BugReports from "../pages/reports/BugReports";
import EmployeeReports from "../pages/reports/EmployeeReports";
import TimeLogReports from "../pages/reports/TimeLogReports";
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

                {/* Root redirect to Dashboard */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

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
                    element={<Task />}
                />

                <Route
                    path="/tasks/create"
                    element={<CreateTask />}
                />

                <Route
                    path="/tasks/:taskId/edit"
                    element={<CreateTask />}
                />

                <Route
                    path="/tasks/edit/:taskId"
                    element={<CreateTask />}
                />


                <Route
                    path="/bugs"
                    element={<Bug />}
                />

                <Route
                    path="/bugs/create"
                    element={<CreateBug />}
                />

                <Route
                    path="/bugs/:bugId/edit"
                    element={<CreateBug />}
                />

                <Route
                    path="/bugs/edit/:bugId"
                    element={<CreateBug />}
                />


                <Route
                    path="/timelogs"
                    element={<TimeLog />}
                />

                <Route
                    path="/timelogs/create"
                    element={<CreateTimeLog />}
                />

                <Route
                    path="/timelogs/:timeLogId/edit"
                    element={<CreateTimeLog />}
                />

                <Route
                    path="/timelogs/edit/:timeLogId"
                    element={<CreateTimeLog />}
                />


                
                <Route
                    path="/meetings"
                    element={<Meeting />}
                />

                <Route
                    path="/meetings/create"
                    element={<CreateMeeting />}
                />

                <Route
                    path="/meetings/:meetingId/edit"
                    element={<CreateMeeting />}
                />

                <Route
                    path="/meetings/edit/:meetingId"
                    element={<CreateMeeting />}
                />


              
                <Route
                    path="/documents"
                    element={<Document />}
                />

                <Route
                    path="/documents/create"
                    element={<CreateDocument />}
                />

                <Route
                    path="/documents/upload"
                    element={<CreateDocument />}
                />

                <Route
                    path="/documents/:documentId/edit"
                    element={<CreateDocument />}
                />

                <Route
                    path="/documents/edit/:documentId"
                    element={<CreateDocument />}
                />


                
                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

                <Route
                    path="/notification"
                    element={<Notifications />}
                />

                <Route
                    path="/reports"
                    element={<Reports />}
                />
                <Route
                    path="/reports/projects"
                    element={<ProjectReports />}
                />
                <Route
                    path="/reports/tasks"
                    element={<TaskReports />}
                />
                <Route
                    path="/reports/bugs"
                    element={<BugReports />}
                />
                <Route
                    path="/reports/employees"
                    element={<EmployeeReports />}
                />
                <Route
                    path="/reports/timelogs"
                    element={<TimeLogReports />}
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