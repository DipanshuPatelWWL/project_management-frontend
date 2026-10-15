import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as reportService from "../../services/reportService";
import * as projectService from "../../services/projectService";
import * as sprintService from "../../services/sprintService";
import * as userService from "../../services/userService";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import TaskReportChart from "../../components/reports/TaskReportChart";
import Loader from "../../components/Loader";
import {
    FiCheckSquare,
    FiCheckCircle,
    FiClock,
    FiPlayCircle,
    FiTrendingUp,
    FiArrowLeft,
    FiLayers,
} from "react-icons/fi";

const TaskReports = () => {
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedProject, setSelectedProject] = useState("");
    const [selectedSprint, setSelectedSprint] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load filter dropdown options (projects, sprints, users)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [projRes, sprintRes, userRes] = await Promise.allSettled([
                    projectService.getProjects(),
                    sprintService.getSprints(),
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

                if (sprintRes.status === "fulfilled") {
                    const sList = Array.isArray(sprintRes.value?.sprints)
                        ? sprintRes.value.sprints
                        : Array.isArray(sprintRes.value)
                        ? sprintRes.value
                        : [];
                    setSprints(sList);
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

    // Filter sprints when project changes
    const filteredSprints = selectedProject
        ? sprints.filter((s) => {
              const pId = typeof s.project === "object" ? s.project?._id : s.project;
              return pId === selectedProject;
          })
        : sprints;

    // Fetch report on filter changes
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError("");
                const params = {};
                if (selectedProject) params.projectId = selectedProject;
                if (selectedSprint) params.sprintId = selectedSprint;
                if (selectedUser) params.assignedTo = selectedUser;

                const res = await reportService.getTaskReport(params);
                setReport(res?.report || null);
            } catch (err) {
                console.error("Failed to load task report:", err);
                setError(err.response?.data?.message || "Failed to generate task report");
                setReport(null);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [selectedProject, selectedSprint, selectedUser]);

    const handleReset = () => {
        setSelectedProject("");
        setSelectedSprint("");
        setSelectedUser("");
    };

    const spVelocity =
        report && report.totalStoryPoints > 0
            ? Math.round(((report.completedStoryPoints || 0) / report.totalStoryPoints) * 100)
            : 0;

    const summaryCards = report
        ? [
              {
                  title: "Total Tasks",
                  value: report.totalTasks || 0,
                  subtext: `${report.completedTasks || 0} completed`,
                  icon: <FiCheckCircle />,
                  color: "blue",
                  progress: report.completionRate || 0,
              },
              {
                  title: "In Progress",
                  value: report.inProgressTasks || 0,
                  subtext: "Actively underway",
                  icon: <FiPlayCircle />,
                  color: "purple",
              },
              {
                  title: "Pending / Backlog",
                  value: report.pendingTasks || 0,
                  subtext: "Awaiting execution",
                  icon: <FiClock />,
                  color: "yellow",
              },
              {
                  title: "Story Points",
                  value: `${report.completedStoryPoints || 0} / ${report.totalStoryPoints || 0}`,
                  subtext: `${spVelocity}% points burned`,
                  icon: <FiTrendingUp />,
                  color: "cyan",
                  progress: spVelocity,
              },
          ]
        : [];

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
                    <FiCheckSquare className="text-[#5865f2]" /> Task Execution & Velocity Reports
                </h1>
                <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                    Analyze sprint workload distributions, completion rates, and priority allocations.
                </p>
            </div>

            {/* Filter Toolbar */}
            <ReportFilters
                showProject={true}
                projects={projects}
                selectedProject={selectedProject}
                onProjectChange={(val) => {
                    setSelectedProject(val);
                    setSelectedSprint("");
                }}
                showSprint={true}
                sprints={filteredSprints}
                selectedSprint={selectedSprint}
                onSprintChange={setSelectedSprint}
                showUser={true}
                users={users}
                selectedUser={selectedUser}
                onUserChange={setSelectedUser}
                loading={loading}
                onReset={handleReset}
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
            ) : report ? (
                <>
                    {/* Summary KPI Cards */}
                    <ReportSummaryCards cards={summaryCards} />

                    {/* Chart Breakdown */}
                    <TaskReportChart report={report} />
                </>
            ) : (
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-10 text-center text-[#8f9bb3]">
                    No task metrics found for the selected filter combination.
                </div>
            )}
        </div>
    );
};

export default TaskReports;
