import React from "react";
import { FiCheckCircle, FiClock, FiAlertTriangle, FiLayers, FiActivity } from "react-icons/fi";

const ProjectReportChart = ({ report = null }) => {
    if (!report) {
        return (
            <div className="bg-[#141829] border border-[#232a42] rounded-2xl p-8 text-center text-[#7f8aa5]">
                No project report data available. Select a project to view analytics.
            </div>
        );
    }
  
    const {
        project = {},
        totalTasks = 0,
        completedTasks = 0,
        pendingTasks = 0,
        totalSprints = 0,
        completedSprints = 0,
        totalBugs = 0,
        openBugs = 0,
        resolvedBugs = 0,
        totalLoggedHours = 0,
        projectProgress = 0,
    } = report;

    const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const bugResolutionPct = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 100;
    const sprintCompletionPct = totalSprints > 0 ? Math.round((completedSprints / totalSprints) * 100) : 0;

    // SVG donut progress circle
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (projectProgress / 100) * circumference;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Progress Ring & Health Card */}
            <div className="bg-[#141829] border border-[#232a42] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-4 flex items-center gap-2">
                    <FiActivity className="text-[#6366f1]" /> Project Completion
                </span>

                <div className="relative w-40 h-40 flex items-center justify-center my-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        {/* Background track */}
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="#1e293b"
                            strokeWidth="12"
                            fill="transparent"
                        />
                        {/* Animated progress stroke */}
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="url(#progressGradient)"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                            {projectProgress}%
                        </span>
                        <span className="text-[11px] text-[#94a3b8] uppercase font-medium mt-0.5">
                            Progress
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b223c] border border-[#2b355d] text-[#a5b4fc] text-[12px] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    Status: <strong className="capitalize">{project.status || "In Progress"}</strong>
                </div>
            </div>

            {/* Task & Sprint Metrics Breakdown */}
            <div className="bg-[#141829] border border-[#232a42] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
                        <FiLayers className="text-[#3b82f6]" /> Execution Breakdown
                    </h3>

                    {/* Tasks Progress Bar */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between text-[13px] mb-1.5">
                            <span className="text-[#cbd5e1] font-medium flex items-center gap-1.5">
                                <FiCheckCircle className="text-[#3b82f6]" size={14} /> Tasks Completed
                            </span>
                            <span className="text-white font-bold">
                                {completedTasks} / {totalTasks} ({taskCompletionPct}%)
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#1e293b] overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${taskCompletionPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#64748b] mt-1">
                            <span>Pending: {pendingTasks}</span>
                            <span>Completed: {completedTasks}</span>
                        </div>
                    </div>

                    {/* Sprints Progress Bar */}
                    <div>
                        <div className="flex items-center justify-between text-[13px] mb-1.5">
                            <span className="text-[#cbd5e1] font-medium flex items-center gap-1.5">
                                <FiLayers className="text-[#8b5cf6]" size={14} /> Sprints Completed
                            </span>
                            <span className="text-white font-bold">
                                {completedSprints} / {totalSprints} ({sprintCompletionPct}%)
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#1e293b] overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                                style={{ width: `${sprintCompletionPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#64748b] mt-1">
                            <span>Total Sprints: {totalSprints}</span>
                            <span>Finished: {completedSprints}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#232a42] flex items-center justify-between text-[12px] text-[#94a3b8]">
                    <span>Total Logged Effort</span>
                    <span className="text-[#38bdf8] font-bold text-[14px]">
                        {totalLoggedHours} Hours
                    </span>
                </div>
            </div>

            {/* Quality & Bug Health Card */}
            <div className="bg-[#141829] border border-[#232a42] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
                        <FiAlertTriangle className="text-[#ef4444]" /> Quality & Bug Health
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#1c1829] border border-[#3b1d28] rounded-xl p-3.5 text-center">
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#f87171]">
                                Open Bugs
                            </span>
                            <div className="text-2xl font-bold text-white mt-1">{openBugs}</div>
                        </div>

                        <div className="bg-[#102422] border border-[#065f46]/40 rounded-xl p-3.5 text-center">
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#34d399]">
                                Resolved Bugs
                            </span>
                            <div className="text-2xl font-bold text-white mt-1">{resolvedBugs}</div>
                        </div>
                    </div>

                    {/* Bug Resolution Progress Bar */}
                    <div>
                        <div className="flex items-center justify-between text-[13px] mb-1.5">
                            <span className="text-[#cbd5e1] font-medium">Resolution Rate</span>
                            <span className="text-[#34d399] font-bold">{bugResolutionPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#1e293b] overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                style={{ width: `${bugResolutionPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#232a42] flex items-center justify-between text-[12px] text-[#94a3b8]">
                    <span>Total Bugs Logged</span>
                    <span className="text-white font-bold text-[14px]">{totalBugs}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectReportChart;
