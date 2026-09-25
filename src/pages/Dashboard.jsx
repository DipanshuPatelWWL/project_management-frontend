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
import Loader from "../components/Loader";

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
        <div className="w-full min-w-0 p-4 sm:p-[22px] md:p-[28px] box-border bg-[#0d0f1a] text-white min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-[30px]">
                <div>
                    <h1 className="m-0 text-[23px] md:text-[28px] font-[750] tracking-[-0.6px] text-white">
                        Dashboard
                    </h1>
                    {user && (
                        <p className="mt-2 mb-0 text-[#8f9bb3] text-[14px] leading-[1.5]">
                            Welcome, {user.firstName || user.email}
                        </p>
                    )}
                </div>

                {isAdmin && (
                    <button
                        className="relative overflow-hidden h-[42px] px-[17px] rounded-lg text-[13px] font-[650] cursor-pointer transition-all duration-200 bg-[#5865f2] text-white border border-[#5865f2] shadow-[0_4px_12px_rgba(37,99,235,0.18)] hover:bg-[#4752c4] hover:border-[#4752c4] hover:shadow-[0_7px_18px_rgba(37,99,235,0.25)] hover:-translate-y-px active:translate-y-px"
                        onClick={() => navigate("/users")}
                    >
                        Users
                    </button>
                )}
            </div>

            {/* Statistics Cards */}
            <section className="mb-[30px]">
                <h2 className="m-0 mb-[15px] text-white text-[17px] font-bold tracking-[-0.2px]">
                    Overview
                </h2>
                {statsLoading && <Loader size="sm" />}
                {statsError && (
                    <p className="flex items-center gap-2.5 mb-[22px] py-3.5 px-4 border border-[rgba(220,38,38,0.35)] rounded-[9px] bg-[rgba(220,38,38,0.12)] text-[#ff9da9] text-[13px] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                        {statsError}
                    </p>
                )}
                {!statsLoading && !statsError && stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
            <section className="mb-[30px]">
                <h2 className="m-0 mb-[15px] text-white text-[17px] font-bold tracking-[-0.2px]">
                    Recent Projects
                </h2>
                <RecentProjects
                    projects={recentProjects}
                    loading={projectsLoading}
                    error={projectsError}
                />
            </section>

            {/* Recent Tasks */}
            <section className="mb-[30px]">
                <h2 className="m-0 mb-[15px] text-white text-[17px] font-bold tracking-[-0.2px]">
                    Recent Tasks
                </h2>
                <RecentTasks
                    tasks={recentTasks}
                    loading={tasksLoading}
                    error={tasksError}
                />
            </section>

            {/* Upcoming Meetings */}
            <section className="mb-[30px]">
                <h2 className="m-0 mb-[15px] text-white text-[17px] font-bold tracking-[-0.2px]">
                    Upcoming Meetings
                </h2>
                <UpcomingMeetings
                    meetings={upcomingMeetings}
                    loading={meetingsLoading}
                    error={meetingsError}
                />
            </section>

            {/* Recent Notifications */}
            <section className="mb-[30px]">
                <h2 className="m-0 mb-[15px] text-white text-[17px] font-bold tracking-[-0.2px]">
                    Recent Notifications
                </h2>
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