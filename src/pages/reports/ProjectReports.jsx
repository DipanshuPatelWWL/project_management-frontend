import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as reportService from "../../services/reportService";
import * as projectService from "../../services/projectService";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import ProjectReportChart from "../../components/reports/ProjectReportChart";
import Loader from "../../components/Loader";
import { FiFolder, FiCheckCircle, FiClock, FiAlertTriangle, FiArrowLeft, FiLayers } from "react-icons/fi";

const ProjectReports = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState("");
 
    // Load projects list
    useEffect(() => {
        const loadProjects = async () => {
            try {
                setLoading(true);
                const res = await projectService.getProjects();
                const list = Array.isArray(res?.projects) ? res.projects : Array.isArray(res) ? res : [];
                setProjects(list);
                if (list.length > 0) {
                    setSelectedProjectId(list[0]._id);
                }
            } catch (err) {
                console.error("Failed to load projects:", err);
                setError(err.response?.data?.message || "Failed to load projects");
            } finally {
                setLoading(false);
            }
        };
        loadProjects();
    }, []);

    // Load report for selected project
    useEffect(() => {
        if (!selectedProjectId) {
            setReport(null);
            return;
        }


        const fetchReport = async () => {
            try {
                setReportLoading(true);
                setError("");
                const data = await reportService.getProjectReport(selectedProjectId);
                setReport(data?.report || null);
            } catch (err) {
                console.error("Failed to fetch project report:", err);
                setError(err.response?.data?.message || "Failed to generate project report");
                setReport(null);
            } finally {
                setReportLoading(false);
            }
        };

        fetchReport();
    }, [selectedProjectId]);

    const summaryCards = report ? [
        {
            title: "Total Tasks",
            value: report.totalTasks || 0,
            subtext: `${report.completedTasks || 0} completed`,
            icon: <FiCheckCircle />,
            color: "blue",
            progress: report.totalTasks > 0 ? Math.round(((report.completedTasks || 0) / report.totalTasks) * 100) : 0,
        },
        {
            title: "Project Progress",
            value: `${report.projectProgress || 0}%`,
            subtext: `${report.completedSprints || 0} of ${report.totalSprints || 0} sprints done`,
            icon: <FiLayers />,
            color: "green",
            progress: report.projectProgress || 0,
        },
        {
            title: "Logged Effort",
            value: `${report.totalLoggedHours || 0} hrs`,
            subtext: "Total recorded time",
            icon: <FiClock />,
            color: "cyan",
        },
        {
            title: "Active Bugs",
            value: report.openBugs || 0,
            subtext: `${report.resolvedBugs || 0} resolved`,
            icon: <FiAlertTriangle />,
            color: (report.openBugs || 0) > 0 ? "red" : "green",
            badge: (report.openBugs || 0) === 0 ? "Clean" : "Needs Triage",
        },
    ] : [];

    const activeProject = projects.find((p) => p._id === selectedProjectId);

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Header with Navigation */}
            <div className="mb-6">
                <Link
                    to="/reports"
                    className="text-[#8f9bb3] hover:text-white transition-colors flex items-center gap-1.5 text-[13px] mb-2 font-medium w-fit"
                >
                    <FiArrowLeft size={14} /> Back to All Reports
                </Link>
                <h1 className="m-0 text-[28px] font-bold text-white tracking-normal flex items-center gap-2.5">
                    <FiFolder className="text-[#5865f2]" /> Project Performance Reports
                </h1>
                <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                    Deep dive execution analytics, milestone completion, and defect health for projects.
                </p>
            </div>

            {/* Project Filter */}
            <ReportFilters
                showProject={true}
                projects={projects}
                selectedProject={selectedProjectId}
                onProjectChange={setSelectedProjectId}
                loading={loading || reportLoading}
                onReset={() => projects.length > 0 && setSelectedProjectId(projects[0]._id)}
            />

            {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-[13px]">
                    {error}
                </div>
            )}

            {loading || reportLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader />
                </div>
            ) : report ? (
                <>
                    {/* Active Project Info Banner */}
                    {activeProject && (
                        <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#111422] border border-[#282e45] text-[#5865f2] flex items-center justify-center font-bold text-lg">
                                    📁
                                </div>
                                <div>
                                    <h2 className="text-[16px] font-bold text-white leading-tight m-0">
                                        {activeProject.projectName}
                                    </h2>
                                    <div className="text-[12px] text-[#8f9bb3] mt-1">
                                        {activeProject.projectId ? `ID: ${activeProject.projectId} • ` : ""}
                                        Status: <span className="text-[#dfe3ee] font-medium capitalize">{activeProject.status || "Active"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary KPI Cards */}
                    <ReportSummaryCards cards={summaryCards} />

                    {/* Visual Charts & Execution Breakdown */}
                    <ProjectReportChart report={report} />
                </>
            ) : (
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-10 text-center text-[#8f9bb3]">
                    Select a project from the filter above to generate the performance report.
                </div>
            )}
        </div>
    );
};

export default ProjectReports;
