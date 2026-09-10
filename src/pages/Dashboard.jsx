import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as dashboardService from "../services/dashboardService";
import * as notificationService from "../services/notificationService";
import StatCard from "../components/StatCard";
import RecentProjects from "../components/RecentProjects";
import RecentTasks from "../components/RecentTasks";
import UpcomingMeetings from "../components/UpcomingMeetings";
import RecentNotifications from "../components/RecentNotifications";
import "./Dashboard.css";


const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");

    const [recentProjects, setRecentProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState("");

    const [recentTasks, setRecentTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState("");

    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [meetingsLoading, setMeetingsLoading] = useState(true);
    const [meetingsError, setMeetingsError] = useState("");

    const [recentNotifications, setRecentNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [notificationsError, setNotificationsError] = useState("");

    // Statistics Cards
    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.role) return;
            setStatsLoading(true);
            setStatsError("");
            try {
                const data = await dashboardService.getDashboardStats(user.role);
                setStats(data.dashboard || data || {});
            } catch (err) {
                const message =
                    err.response?.data?.message ||
                    "Could not load dashboard statistics.";
                setStatsError(message);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [user?.role]);

    // Recent Projects
    useEffect(() => {
        const fetchProjects = async () => {
            setProjectsLoading(true);
            setProjectsError("");
            try {
                const projects = await dashboardService.getRecentProjects(5);
                setRecentProjects(projects);
            } catch (err) {
                const message =
                    err.response?.data?.message || "Could not load recent projects.";
                setProjectsError(message);
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Recent Tasks
    useEffect(() => {
        const fetchTasks = async () => {
            setTasksLoading(true);
            setTasksError("");
            try {
                const tasks = await dashboardService.getRecentTasks(5);
                setRecentTasks(tasks);
            } catch (err) {
                const message =
                    err.response?.data?.message || "Could not load recent tasks.";
                setTasksError(message);
            } finally {
                setTasksLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Upcoming Meetings
    useEffect(() => {
        const fetchMeetings = async () => {
            setMeetingsLoading(true);
            setMeetingsError("");
            try {
                const meetings = await dashboardService.getUpcomingMeetings(5);
                setUpcomingMeetings(meetings);
            } catch (err) {
                const message =
                    err.response?.data?.message || "Could not load upcoming meetings.";
                setMeetingsError(message);
            } finally {
                setMeetingsLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    // Recent Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            setNotificationsLoading(true);
            setNotificationsError("");
            try {
                const data = await notificationService.getNotifications();
                const list = data.notifications || data || [];
                setRecentNotifications(list.slice(0, 5));
            } catch (err) {
                const message =
                    err.response?.data?.message ||
                    "Could not load recent notifications.";
                setNotificationsError(message);
            } finally {
                setNotificationsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="dashboard-top">
                <div>
                    <h1>Dashboard</h1>
                    {user && (
                        <p className="welcome-text">
                            Welcome, {user.firstName || user.email}
                        </p>
                    )}
                </div>

                {isAdmin && (
                    <button
                        className="create-user-button"
                        onClick={() => navigate("/users")}
                    >
                         Users
                    </button>
                )}
            </div>

            {/* Statistics Cards */}
            <section className="dashboard-section">
                <h2>Overview</h2>
                {statsLoading && <p>Loading statistics...</p>}
                {statsError && <p className="dashboard-error">{statsError}</p>}
                {!statsLoading && !statsError && stats && (
                    <div className="stats-grid">
                        <StatCard label="Total Projects" value={stats.totalProjects} />
                        <StatCard label="Total Tasks" value={stats.totalTasks} />
                        <StatCard label="Completed Tasks" value={stats.completedTasks} />
                        <StatCard label="Pending Tasks" value={stats.pendingTasks} />
                        <StatCard label="Total Bugs" value={stats.totalBugs} />
                        <StatCard label="Open Bugs" value={stats.openBugs} />
                    </div>
                )}
            </section>

            {/* Recent Projects */}
            <section className="dashboard-section">
                <h2>Recent Projects</h2>
                <RecentProjects
                    projects={recentProjects}
                    loading={projectsLoading}
                    error={projectsError}
                />
            </section>

            {/* Recent Tasks */}
            <section className="dashboard-section">
                <h2>Recent Tasks</h2>
                <RecentTasks
                    tasks={recentTasks}
                    loading={tasksLoading}
                    error={tasksError}
                />
            </section>

            {/* Upcoming Meetings */}
            <section className="dashboard-section">
                <h2>Upcoming Meetings</h2>
                <UpcomingMeetings
                    meetings={upcomingMeetings}
                    loading={meetingsLoading}
                    error={meetingsError}
                />
            </section>

            {/* Recent Notifications */}
            <section className="dashboard-section">
                <h2>Recent Notifications</h2>
                <RecentNotifications
                    notifications={recentNotifications}
                    loading={notificationsLoading}
                    error={notificationsError}
                />
            </section>
        </div>
    );
};

export default Dashboard;