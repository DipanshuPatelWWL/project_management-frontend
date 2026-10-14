import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import * as reportService from "../../services/reportService";
import * as projectService from "../../services/projectService";
import * as userService from "../../services/userService";
import * as timeLogService from "../../services/timeLogService";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import TimeLogReportTable from "../../components/reports/TimeLogReportTable";
import Loader from "../../components/Loader";
import {
    FiClock,
    FiCalendar,
    FiTrendingUp,
    FiAlertCircle,
    FiArrowLeft,
    FiLayers,
} from "react-icons/fi";

const TimeLogReports = () => {
    const defaultStart = dayjs().subtract(30, "day").format("YYYY-MM-DD");
    const defaultEnd = dayjs().format("YYYY-MM-DD");

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    const [report, setReport] = useState(null);
    const [detailedLogs, setDetailedLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load filter dropdown options (projects, users)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [projRes, userRes] = await Promise.allSettled([
                    projectService.getProjects(),
                    userService.getUsers(),
                ]);

                if (projRes.status === "fulfilled") {
                    const pList = Array.isArray(projRes.value?.projects)
                        ? projRes.value.projects
                        : Array.isArray(projRes.value)
                        ? projRes.value
                        : [];
                    setProjects(pList);
                }

                if (userRes.status === "fulfilled") {
                    const uList = Array.isArray(userRes.value?.users)
                        ? userRes.value.users
                        : Array.isArray(userRes.value)
                        ? userRes.value
                        : [];
                    setUsers(uList);
                }
            } catch (err) {
                console.error("Failed to load filter datasets:", err);
            }
        };

        loadInitialData();
    }, []);

    // Fetch timelog summary report + detailed logs on filter changes
    useEffect(() => {
        const fetchTimeLogData = async () => {
            try {
                setLoading(true);
                setError("");

                const params = {
                    startDate,
                    endDate,
                };
                if (selectedProject) params.projectId = selectedProject;
                if (selectedUser) params.userId = selectedUser;

                // Call report service
                const repRes = await reportService.getTimeLogReport(params);
                setReport(repRes?.report || null);

                // Fetch raw logs for the table
                try {
                    const logsRes = await timeLogService.getTimeLogs();
                    const allLogs = Array.isArray(logsRes?.timeLogs)
                        ? logsRes.timeLogs
                        : Array.isArray(logsRes)
                        ? logsRes
                        : [];

                    // Client-side date and project/user filter matching
                    const startObj = new Date(startDate);
                    const endObj = new Date(endDate);
                    endObj.setHours(23, 59, 59, 999);

                    const filtered = allLogs.filter((log) => {
                        const logDate = new Date(log.workDate || log.date || log.createdAt);
                        if (logDate < startObj || logDate > endObj) return false;

                        if (selectedProject) {
                            const pId = typeof log.project === "object" ? log.project?._id : log.project;
                            if (pId !== selectedProject) return false;
                        }

                        if (selectedUser) {
                            const uId = typeof log.user === "object" ? log.user?._id : log.user;
                            if (uId !== selectedUser) return false;
                        }

                        return true;
                    });

                    setDetailedLogs(filtered);
                } catch (logsErr) {
                    console.warn("Failed to fetch detailed timelogs table:", logsErr);
                    setDetailedLogs([]);
                }
            } catch (err) {
                console.error("Failed to load timelog report:", err);
                setError(err.response?.data?.message || "Failed to generate timelog report");
                setReport(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeLogData();
    }, [startDate, endDate, selectedProject, selectedUser]);

    const handleReset = () => {
        setStartDate(defaultStart);
        setEndDate(defaultEnd);
        setSelectedProject("");
        setSelectedUser("");
    };

    const summaryCards = report
        ? [
              {
                  title: "Total Logged Effort",
                  value: `${report.totalLoggedHours || 0} hrs`,
                  subtext: `${report.totalLogs || 0} work logs recorded`,
                  icon: <FiClock />,
                  color: "cyan",
              },
              {
                  title: "Active Working Days",
                  value: report.totalWorkingDays || 0,
                  subtext: "Distinct dates with activity",
                  icon: <FiCalendar />,
                  color: "blue",
              },
              {
                  title: "Avg Hours / Day",
                  value: `${report.averageHoursPerDay || 0} hrs`,
                  subtext: "Daily team pace",
                  icon: <FiTrendingUp />,
                  color: "green",
              },
              {
                  title: "Overtime Recorded",
                  value: `${report.totalOvertime || 0} hrs`,
                  subtext:
                      (report.totalOvertime || 0) > 0
                          ? "Overtime recorded above 8h shifts"
                          : "Standard shifts recorded",
                  icon: <FiAlertCircle />,
                  color: (report.totalOvertime || 0) > 0 ? "yellow" : "green",
                  badge: (report.totalOvertime || 0) > 0 ? "Overtime" : "Optimal",
              },
          ]
        : [];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            to="/reports"
                            className="text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1 text-[13px]"
                        >
                            <FiArrowLeft size={14} /> Back to All Reports
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                        <FiClock className="text-[#38bdf8]" /> Time Log & Effort Analytics
                    </h1>
                    <p className="text-[#94a3b8] text-[13px] mt-1">
                        Review workforce hours, verify billable effort, analyze overtime, and inspect work log details.
                    </p>
                </div>
            </div>

            {/* Filter Toolbar */}
            <ReportFilters
                showDateRange={true}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                showProject={true}
                projects={projects}
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
                showUser={true}
                users={users}
                selectedUser={selectedUser}
                onUserChange={setSelectedUser}
                loading={loading}
                onReset={handleReset}
            />

            {error && (
                <div className="p-4 mb-6 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-[13px]">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader />
                </div>
            ) : (
                <>
                    {/* Summary KPI Cards */}
                    <ReportSummaryCards cards={summaryCards} />

                    {/* Detailed Logs Record Table */}
                    <TimeLogReportTable logs={detailedLogs} summary={report} />
                </>
            )}
        </div>
    );
};

export default TimeLogReports;
