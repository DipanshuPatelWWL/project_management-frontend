import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import * as reportService from "../../services/reportService";
import * as userService from "../../services/userService";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import EmployeeReportTable from "../../components/reports/EmployeeReportTable";
import Loader from "../../components/Loader";
import {
    FiUsers,
    FiUserCheck,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiArrowLeft,
    FiAward,
} from "react-icons/fi";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const getProfileImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${cleanPath}`;
};

const EmployeeReports = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [employeeReportsMap, setEmployeeReportsMap] = useState({});
    const [singleReport, setSingleReport] = useState(null);
    const [avatarError, setAvatarError] = useState(false);

    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState("");

    // Load users list and their individual reports for the index table
    useEffect(() => {
        const loadUsersAndReports = async () => {
            try {
                setLoading(true);
                setError("");
                const userRes = await userService.getUsers();
                const list = Array.isArray(userRes?.users)
                    ? userRes.users
                    : Array.isArray(userRes)
                    ? userRes
                    : [];
                setUsers(list);

                if (list.length > 0) {
                    setTableLoading(true);
                    // Fetch lightweight report summaries for up to first 20 employees
                    const map = {};
                    const fetchPromises = list.slice(0, 20).map(async (u) => {
                        try {
                            const rep = await reportService.getEmployeeReport(u._id);
                            if (rep?.report) {
                                map[u._id] = rep.report;
                            }
                        } catch (e) {
                            // Non-blocking per user
                        }
                    });

                    await Promise.allSettled(fetchPromises);
                    setEmployeeReportsMap(map);
                    setTableLoading(false);
                }
            } catch (err) {
                console.error("Failed to load users:", err);
                setError(err.response?.data?.message || "Failed to load employees list");
            } finally {
                setLoading(false);
            }
        };

        loadUsersAndReports();
    }, []);

    // When an employee is specifically chosen, fetch their detailed report
    useEffect(() => {
        if (!selectedUser) {
            setSingleReport(null);
            return;
        }

        const fetchSingleEmployee = async () => {
            try {
                setError("");
                const res = await reportService.getEmployeeReport(selectedUser);
                setSingleReport(res || null);
            } catch (err) {
                console.error("Failed to fetch employee report:", err);
                setError(err.response?.data?.message || "Failed to generate report for employee");
                setSingleReport(null);
            }
        };

        fetchSingleEmployee();
    }, [selectedUser]);

    // Build records for EmployeeReportTable
    const tableRecords = useMemo(() => {
        return users.map((u) => {
            const rep = employeeReportsMap[u._id] || {
                totalAssignedTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                totalAssignedBugs: 0,
                resolvedBugs: 0,
                totalWorkingHours: 0,
                overtime: 0,
                taskCompletionRate: 0,
            };
            return {
                employee: u,
                report: rep,
            };
        });
    }, [users, employeeReportsMap]);

    // Aggregate metrics across all loaded employees
    const aggregateMetrics = useMemo(() => {
        let totalAssigned = 0;
        let totalCompleted = 0;
        let totalBugsResolved = 0;
        let totalHours = 0;

        Object.values(employeeReportsMap).forEach((r) => {
            totalAssigned += Number(r.totalAssignedTasks || 0);
            totalCompleted += Number(r.completedTasks || 0);
            totalBugsResolved += Number(r.resolvedBugs || 0);
            totalHours += Number(r.totalWorkingHours || 0);
        });

        const avgCompletion =
            totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

        return {
            totalAssigned,
            totalCompleted,
            totalBugsResolved,
            totalHours: Number(totalHours.toFixed(1)),
            avgCompletion,
        };
    }, [employeeReportsMap]);

    // Summary Cards (either for selected user or team aggregate)
    const summaryCards = useMemo(() => {
        if (selectedUser && singleReport) {
            const rep = singleReport.report || {};
            const emp = singleReport.employee || {};
            const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Employee";

            return [
                {
                    title: "Assigned Tasks",
                    value: rep.totalAssignedTasks || 0,
                    subtext: `${rep.completedTasks || 0} completed`,
                    icon: <FiCheckCircle />,
                    color: "blue",
                    progress: rep.taskCompletionRate || 0,
                },
                {
                    title: "Completion Rate",
                    value: `${rep.taskCompletionRate || 0}%`,
                    subtext: `${rep.pendingTasks || 0} tasks pending`,
                    icon: <FiAward />,
                    color: "green",
                    progress: rep.taskCompletionRate || 0,
                },
                {
                    title: "Bugs Resolved",
                    value: rep.resolvedBugs || 0,
                    subtext: `${rep.totalAssignedBugs || 0} total assigned`,
                    icon: <FiAlertCircle />,
                    color: "purple",
                },
                {
                    title: "Effort Logged",
                    value: `${rep.totalWorkingHours || 0} hrs`,
                    subtext: `${rep.overtime || 0} hrs overtime`,
                    icon: <FiClock />,
                    color: "cyan",
                },
            ];
        }

        // Aggregate team cards
        return [
            {
                title: "Total Team Tasks",
                value: aggregateMetrics.totalAssigned,
                subtext: `${aggregateMetrics.totalCompleted} completed across team`,
                icon: <FiCheckCircle />,
                color: "blue",
                progress: aggregateMetrics.avgCompletion,
            },
            {
                title: "Team Velocity",
                value: `${aggregateMetrics.avgCompletion}%`,
                subtext: "Average task completion rate",
                icon: <FiAward />,
                color: "green",
                progress: aggregateMetrics.avgCompletion,
            },
            {
                title: "Total Defect Fixes",
                value: aggregateMetrics.totalBugsResolved,
                subtext: "Defects resolved by workforce",
                icon: <FiAlertCircle />,
                color: "purple",
            },
            {
                title: "Total Logged Effort",
                value: `${aggregateMetrics.totalHours} hrs`,
                subtext: `Across ${users.length} team members`,
                icon: <FiClock />,
                color: "cyan",
            },
        ];
    }, [selectedUser, singleReport, aggregateMetrics, users.length]);

    const activeEmployee = users.find((u) => u._id === selectedUser);

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to="/reports"
                    className="text-[#8f9bb3] hover:text-white transition-colors flex items-center gap-1.5 text-[13px] mb-2 font-medium w-fit"
                >
                    <FiArrowLeft size={14} /> Back to All Reports
                </Link>
                <h1 className="m-0 text-[28px] font-bold text-white tracking-normal flex items-center gap-2.5">
                    <FiUsers className="text-[#5865f2]" /> Employee Productivity & Workload Reports
                </h1>
                <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                    Track individual engineer output, task turnaround rates, resolved defects, and logged hours.
                </p>
            </div>

            {/* Filter toolbar */}
            <ReportFilters
                showUser={true}
                users={users}
                selectedUser={selectedUser}
                onUserChange={setSelectedUser}
                loading={loading}
                onReset={() => setSelectedUser("")}
            />

            {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-[13px]">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader />
                </div>
            ) : (
                <>
                    {/* Active Employee Selected Banner */}
                    {activeEmployee && singleReport && (
                        <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                {!avatarError && activeEmployee.profileImage ? (
                                    <img
                                        src={getProfileImageUrl(activeEmployee.profileImage)}
                                        alt="Profile"
                                        onError={() => setAvatarError(true)}
                                        className="w-11 h-11 rounded-full object-cover border border-[#2d3748] shrink-0"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-[#5865f2] text-white font-bold text-sm flex items-center justify-center shrink-0">
                                        {(activeEmployee.firstName || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[16px] font-bold text-white m-0">
                                            {`${activeEmployee.firstName || ""} ${activeEmployee.lastName || ""}`.trim() || activeEmployee.name}
                                        </h2>
                                        <span className="text-[11px] font-semibold bg-[#5865f2]/20 text-[#818cf8] px-2.5 py-0.5 rounded-full border border-[#5865f2]/30">
                                            {activeEmployee.role || "Member"}
                                        </span>
                                    </div>
                                    <div className="text-[12px] text-[#8f9bb3] mt-1">
                                        {activeEmployee.email} • {activeEmployee.department || "Engineering"}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser("")}
                                className="px-3.5 py-1.5 rounded-lg text-[12px] bg-[#171b2e] hover:bg-[#222942] text-[#8f9bb3] hover:text-white border border-[#30364d] transition-colors cursor-pointer"
                            >
                                Clear Selection (View All)
                            </button>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <ReportSummaryCards cards={summaryCards} />

                    {/* Employee Leaderboard Table */}
                    <EmployeeReportTable
                        records={tableRecords}
                        selectedEmployeeId={selectedUser}
                        onSelectEmployee={(empId) => setSelectedUser(empId)}
                    />
                </>
            )}
        </div>
    );
};

export default EmployeeReports;
