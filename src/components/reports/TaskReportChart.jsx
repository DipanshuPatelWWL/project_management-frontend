import React from "react";
import { FiCheckCircle, FiClock, FiPlayCircle, FiFlag, FiTrendingUp } from "react-icons/fi";

const PRIORITY_CONFIG = {
    critical: { label: "Critical", color: "bg-rose-500", text: "text-rose-400", bgLight: "bg-rose-950/40 border-rose-800/40" },
    high: { label: "High", color: "bg-amber-500", text: "text-amber-400", bgLight: "bg-amber-950/40 border-amber-800/40" },
    medium: { label: "Medium", color: "bg-blue-500", text: "text-blue-400", bgLight: "bg-blue-950/40 border-blue-800/40" },
    low: { label: "Low", color: "bg-slate-500", text: "text-slate-400", bgLight: "bg-slate-900/50 border-slate-700/40" },
};

const TaskReportChart = ({ report = null }) => {
    if (!report) {
        return (
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-8 text-center text-[#8f9bb3]">
                No task report data available.
            </div>
        );
    }

    const {
        totalTasks = 0,
        completedTasks = 0,
        pendingTasks = 0,
        inProgressTasks = 0,
        totalStoryPoints = 0,
        completedStoryPoints = 0,
        completionRate = 0,
        priorityReport = {},
    } = report;

    const completedPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const inProgressPct = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
    const pendingPct = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
    const storyPointsPct = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution Chart */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-6 flex flex-col justify-between shadow-sm">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-bold text-white flex items-center gap-2 m-0">
                            <FiTrendingUp className="text-[#3b82f6]" /> Status Breakdown
                        </h3>
                        <span className="text-[12px] font-semibold text-[#38bdf8] bg-[#111422] border border-[#282e45] px-2.5 py-0.5 rounded-full">
                            {completionRate}% Completed
                        </span>
                    </div>

                    {/* Segmented Horizontal Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-[#111422] flex overflow-hidden mb-5">
                        <div
                            style={{ width: `${completedPct}%` }}
                            className="bg-[#10b981] transition-all duration-500"
                            title={`Completed: ${completedTasks}`}
                        />
                        <div
                            style={{ width: `${inProgressPct}%` }}
                            className="bg-[#3b82f6] transition-all duration-500"
                            title={`In Progress: ${inProgressTasks}`}
                        />
                        <div
                            style={{ width: `${pendingPct}%` }}
                            className="bg-[#f59e0b] transition-all duration-500"
                            title={`Pending: ${pendingTasks}`}
                        />
                    </div>

                    {/* Status Pill Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#111422] border border-[#282e45] rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#34d399] uppercase">
                                <FiCheckCircle size={13} /> Done
                            </div>
                            <div className="text-2xl font-extrabold text-white mt-1">{completedTasks}</div>
                            <div className="text-[11px] text-[#8f9bb3]">{completedPct}%</div>
                        </div>

                        <div className="bg-[#111422] border border-[#282e45] rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#60a5fa] uppercase">
                                <FiPlayCircle size={13} /> Active
                            </div>
                            <div className="text-2xl font-extrabold text-white mt-1">{inProgressTasks}</div>
                            <div className="text-[11px] text-[#8f9bb3]">{inProgressPct}%</div>
                        </div>

                        <div className="bg-[#111422] border border-[#282e45] rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#fbbf24] uppercase">
                                <FiClock size={13} /> Pending
                            </div>
                            <div className="text-2xl font-extrabold text-white mt-1">{pendingTasks}</div>
                            <div className="text-[11px] text-[#8f9bb3]">{pendingPct}%</div>
                        </div>
                    </div>
                </div>

                {/* Story Points Meter */}
                <div className="mt-5 pt-4 border-t border-[#282e45]">
                    <div className="flex justify-between text-[12px] text-[#dfe3ee] mb-1.5 font-medium">
                        <span>Story Points Burndown</span>
                        <span className="font-bold text-white">
                            {completedStoryPoints} / {totalStoryPoints} pts ({storyPointsPct}%)
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#111422] overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${storyPointsPct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Priority Distribution Chart */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-6 flex flex-col justify-between shadow-sm">
                <div>
                    <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2 m-0">
                        <FiFlag className="text-[#f59e0b]" /> Priority Distribution
                    </h3>

                    <div className="space-y-3.5 mt-4">
                        {["critical", "high", "medium", "low"].map((key) => {
                            const config = PRIORITY_CONFIG[key];
                            const count = priorityReport[key] || 0;
                            const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between text-[13px] mb-1">
                                        <span className={`font-semibold flex items-center gap-2 ${config.text}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                                            {config.label}
                                        </span>
                                        <span className="text-[#dfe3ee] font-bold">
                                            {count} <span className="text-[#8f9bb3] font-normal">({pct}%)</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[#111422] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${config.color}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#282e45] flex justify-between items-center text-[12px] text-[#8f9bb3]">
                    <span>Total Tasks Analyzed</span>
                    <span className="text-white font-bold text-[14px]">{totalTasks}</span>
                </div>
            </div>
        </div>
    );
};

export default TaskReportChart;
