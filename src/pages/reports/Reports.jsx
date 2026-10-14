import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import * as reportService from "../../services/reportService";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import TaskReportChart from "../../components/reports/TaskReportChart";
import BugReportChart from "../../components/reports/BugReportChart";
import Loader from "../../components/Loader";
import {
    FiBarChart2,
    FiFolder,
    FiCheckSquare,
    FiAlertTriangle,
    FiUsers,
    FiClock,
    FiArrowRight,
    FiShield,
    FiTrendingUp,
    FiCheckCircle,
    FiActivity,
} from "react-icons/fi";

const REPORT_MODULES = [
    {
        id: "projects",
        title: "Project Reports",
        path: "/reports/projects",
        icon: <FiFolder className="text-[#3b82f6]" size={22} />,
        accent: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
        badge: "Milestones & Sprints",
        badgeColor: "bg-blue-900/40 text-blue-300 border-blue-700/40",
        description: "Analyze project health, sprint progress, task deliveries, and logged hours per initiative.",
        features: ["Sprint burndown", "Defect density", "Progress %"],
    },
    {
        id: "tasks",
        title: "Task Velocity Reports",
        path: "/reports/tasks",
        icon: <FiCheckSquare className="text-[#10b981]" size={22} />,
        accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
        badge: "Story Points & Status",
        badgeColor: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
        description: "Visualize task status breakdowns, priority distribution, and story points velocity.",
        features: ["Completion rate", "Priority matrix", "Sprint filtering"],
    },
    {
        id: "bugs",
        title: "Bug & Defect Reports",
        path: "/reports/bugs",
        icon: <FiAlertTriangle className="text-amber-400" size={22} />,
        accent: "from-amber-500/20 to-rose-500/10 border-amber-500/30",
        badge: "Quality & Severity",
        badgeColor: "bg-amber-900/40 text-amber-300 border-amber-700/40",
        description: "Monitor software quality, track resolution velocity, and dissect defect severity classes.",
        features: ["Resolution rate", "Severity levels", "Zero-defect tracking"],
    },
    {
        id: "employees",
        title: "Employee Reports",
        path: "/reports/employees",
        icon: <FiUsers className="text-[#a855f7]" size={22} />,
        accent: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
        badge: "Workforce Output",
        badgeColor: "bg-purple-900/40 text-purple-300 border-purple-700/40",
        description: "Track individual developer workload, completion rates, resolved bugs, and logged effort.",
        features: ["Productivity index", "Overtime tracking", "Individual drill-down"],
    },
    {
        id: "timelogs",
        title: "Time Log Reports",
        path: "/reports/timelogs",
        icon: <FiClock className="text-[#38bdf8]" size={22} />,
        accent: "from-sky-500/20 to-blue-500/10 border-sky-500/30",
        badge: "Audit & Hours",
        badgeColor: "bg-sky-900/40 text-sky-300 border-sky-700/40",
        description: "Inspect total logged effort, daily working pace, overtime hours, and comprehensive audit logs.",
        features: ["Date range analytics", "Daily avg effort", "Audit trail"],
    },
];

const Reports = () => {
    const [taskReport, setTaskReport] = useState(null);
    const [bugReport, setBugReport] = useState(null);
    const [timeLogReport, setTimeLogReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewTab, setPreviewTab] = useState("tasks");

    useEffect(() => {
        const fetchExecutiveData = async () => {
            try {
                setLoading(true);
                const startDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");
                const endDate = dayjs().format("YYYY-MM-DD");

                const [tRes, bRes, tlRes] = await Promise.allSettled([
                    reportService.getTaskReport(),
                    reportService.getBugReport(),
                    reportService.getTimeLogReport({ startDate, endDate }),
                ]);

                if (tRes.status === "fulfilled") setTaskReport(tRes.value?.report || null);
                if (bRes.status === "fulfilled") setBugReport(bRes.value?.report || null);
                if (tlRes.status === "fulfilled") setTimeLogReport(tlRes.value?.report || null);
            } catch (err) {
                console.error("Failed to load executive reports summary:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchExecutiveData();
    }, []);

    const executiveCards = [
        {
            title: "Task Completion",
            value: taskReport ? `${taskReport.completionRate || 0}%` : "0%",
            subtext: taskReport
                ? `${taskReport.completedTasks || 0} of ${taskReport.totalTasks || 0} tasks done`
                : "No task data",
            icon: <FiCheckCircle />,
            color: "blue",
            progress: taskReport?.completionRate || 0,
        },
        {
            title: "Quality Health Score",
            value: bugReport ? `${bugReport.resolutionRate || 0}%` : "0%",
            subtext: bugReport
                ? `${bugReport.resolvedBugs || 0} of ${bugReport.totalBugs || 0} bugs resolved`
                : "No defect data",
            icon: <FiShield />,
            color: "green",
            progress: bugReport?.resolutionRate || 0,
        },
        {
            title: "30-Day Logged Effort",
            value: timeLogReport ? `${timeLogReport.totalLoggedHours || 0} hrs` : "0 hrs",
            subtext: timeLogReport
                ? `Avg ${timeLogReport.averageHoursPerDay || 0} hrs / active day`
                : "No timelog data",
            icon: <FiClock />,
            color: "cyan",
        },
        {
            title: "Active Open Defects",
            value: bugReport ? bugReport.openBugs || 0 : 0,
            subtext: (bugReport?.openBugs || 0) === 0 ? "Zero defects active" : "Requires triage & fix",
            icon: <FiAlertTriangle />,
            color: (bugReport?.openBugs || 0) > 0 ? "red" : "green",
            badge: (bugReport?.openBugs || 0) === 0 ? "Clean" : "Attention",
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#171d36] via-[#141829] to-[#121626] border border-[#232a42] p-8 shadow-xl">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2746] text-[#60a5fa] border border-[#2c3963] text-[12px] font-semibold mb-3">
                            <FiBarChart2 /> Enterprise Intelligence & Telemetry
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Reports & Analytics Hub
                        </h1>
                        <p className="text-[#94a3b8] text-[14px] mt-2 leading-relaxed">
                            Comprehensive reporting suite for engineering leadership. Drill down into milestone
                            delivery, sprint velocity, defect health, workforce productivity, and billable hours.
                        </p>
                    </div>

                    {/* Quick navigation pill links */}
                    <div className="flex flex-wrap items-center gap-2">
                        {REPORT_MODULES.map((mod) => (
                            <Link
                                key={mod.id}
                                to={mod.path}
                                className="px-3.5 py-2 rounded-xl bg-[#0f1322] hover:bg-[#1c223c] border border-[#232a42] hover:border-[#3b476e] text-white text-[12px] font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
                            >
                                <span className="scale-90">{mod.icon}</span>
                                <span>{mod.title.replace(" Reports", "")}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Executive High-Level KPI Overview */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FiActivity className="text-[#6366f1]" /> Executive Overview (Last 30 Days)
                    </h2>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <Loader />
                    </div>
                ) : (
                    <ReportSummaryCards cards={executiveCards} />
                )}
            </div>

            {/* Report Modules Launchpad Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiTrendingUp className="text-[#10b981]" /> Dedicated Report Suites
                        </h2>
                        <p className="text-[#94a3b8] text-[13px] mt-0.5">
                            Select a dedicated module to configure filters, generate custom views, and inspect metrics.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {REPORT_MODULES.map((mod) => (
                        <div
                            key={mod.id}
                            className={`rounded-2xl bg-gradient-to-br ${mod.accent} bg-[#141829] border border-[#232a42] p-6 flex flex-col justify-between hover:border-[#3d4872] hover:shadow-lg transition-all duration-200 group`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#0f1322] border border-[#232a42] flex items-center justify-center group-hover:scale-105 transition-transform">
                                        {mod.icon}
                                    </div>
                                    <span
                                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${mod.badgeColor}`}
                                    >
                                        {mod.badge}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">
                                    {mod.title}
                                </h3>
                                <p className="text-[#94a3b8] text-[13px] mt-2 leading-relaxed">
                                    {mod.description}
                                </p>

                                <div className="mt-4 pt-4 border-t border-[#232a42]/60 flex flex-wrap gap-1.5">
                                    {mod.features.map((f, i) => (
                                        <span
                                            key={i}
                                            className="text-[11px] text-[#cbd5e1] bg-[#0f1322]/80 px-2 py-0.5 rounded-md border border-[#202742]"
                                        >
                                            • {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Link
                                to={mod.path}
                                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#1e253d] hover:bg-[#252e4d] text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 group-hover:bg-[#2c375c]"
                            >
                                <span>Launch {mod.title.replace(" Reports", "")} Suite</span>
                                <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Preview Switcher */}
            <div className="bg-[#141829] border border-[#232a42] rounded-2xl p-6 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#232a42]">
                    <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <FiBarChart2 className="text-[#38bdf8]" /> Live Telemetry Preview
                        </h3>
                        <p className="text-[#94a3b8] text-[12px] mt-0.5">
                            Instant glance at current operational metrics across all workspace initiatives.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0e1222] border border-[#232a42]">
                        <button
                            onClick={() => setPreviewTab("tasks")}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                                previewTab === "tasks"
                                    ? "bg-[#6366f1] text-white shadow-sm"
                                    : "text-[#94a3b8] hover:text-white"
                            }`}
                        >
                            Task Velocity
                        </button>
                        <button
                            onClick={() => setPreviewTab("bugs")}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                                previewTab === "bugs"
                                    ? "bg-[#6366f1] text-white shadow-sm"
                                    : "text-[#94a3b8] hover:text-white"
                            }`}
                        >
                            Defects & Quality
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Loader />
                    </div>
                ) : previewTab === "tasks" ? (
                    <TaskReportChart report={taskReport} />
                ) : (
                    <BugReportChart report={bugReport} />
                )}
            </div>
        </div>
    );
};

export default Reports;
