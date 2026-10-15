import React from "react";
import { FiAlertCircle, FiCheckCircle, FiShield, FiTrendingUp } from "react-icons/fi";

const SEVERITY_CONFIG = {
    critical: { label: "Critical", color: "bg-red-500", text: "text-red-400" },
    high: { label: "High", color: "bg-orange-500", text: "text-orange-400" },
    medium: { label: "Medium", color: "bg-yellow-500", text: "text-yellow-400" },
    low: { label: "Low", color: "bg-emerald-500", text: "text-emerald-400" },
};

const BugReportChart = ({ report = null }) => {
    if (!report) {
        return (
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-8 text-center text-[#8f9bb3]">
                No bug report data available.
            </div>
        );
    }
  
    const {
        totalBugs = 0,
        openBugs = 0,
        resolvedBugs = 0,
        resolutionRate = 0,
        severityReport = {},
        priorityReport = {},
    } = report;

    const openPct = totalBugs > 0 ? Math.round((openBugs / totalBugs) * 100) : 0;
    const resolvedPct = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Resolution Rate & Status Overview */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-6 flex flex-col justify-between shadow-sm">
                <div>
                    <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2 m-0">
                        <FiShield className="text-[#3b82f6]" /> Quality Health Score
                    </h3>

                    <div className="p-4 rounded-lg bg-[#111422] border border-[#282e45] text-center my-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8f9bb3]">
                            Resolution Rate
                        </span>
                        <div className="text-4xl font-extrabold text-[#34d399] mt-1">
                            {resolutionRate}%
                        </div>
                        <p className="text-[12px] text-[#8f9bb3] mt-1 mb-0">
                            {resolvedBugs} of {totalBugs} bugs resolved
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-[#111422] border border-[#282e45] rounded-lg p-3 text-center">
                            <span className="text-[11px] font-bold uppercase text-[#f87171] flex items-center justify-center gap-1">
                                <FiAlertCircle size={12} /> Open
                            </span>
                            <div className="text-2xl font-bold text-white mt-1">{openBugs}</div>
                            <span className="text-[11px] text-[#8f9bb3]">{openPct}%</span>
                        </div>

                        <div className="bg-[#111422] border border-[#282e45] rounded-lg p-3 text-center">
                            <span className="text-[11px] font-bold uppercase text-[#34d399] flex items-center justify-center gap-1">
                                <FiCheckCircle size={12} /> Resolved
                            </span>
                            <div className="text-2xl font-bold text-white mt-1">{resolvedBugs}</div>
                            <span className="text-[11px] text-[#8f9bb3]">{resolvedPct}%</span>
                        </div>
                    </div>
                </div>
             
                <div className="mt-5 pt-4 border-t border-[#282e45] flex justify-between text-[12px] text-[#8f9bb3]">
                    <span>Total Defect Tickets</span>
                    <span className="text-white font-bold text-[14px]">{totalBugs}</span>
                </div>
            </div>

            {/* Severity Breakdown */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-6 flex flex-col justify-between shadow-sm">
                <div>
                    <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2 m-0">
                        <FiAlertCircle className="text-[#ef4444]" /> Severity Breakdown
                    </h3>

                    <div className="space-y-3.5 mt-4">
                        {["critical", "high", "medium", "low"].map((key) => {
                            const config = SEVERITY_CONFIG[key];
                            const count = severityReport[key] || 0;
                            const pct = totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0;

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

                <div className="mt-5 pt-4 border-t border-[#282e45] text-[12px] text-[#8f9bb3]">
                    Critical bugs require immediate triage & hotfix.
                </div>
            </div>
 
            {/* Priority Breakdown */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-6 flex flex-col justify-between shadow-sm">
                <div>
                    <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2 m-0">
                        <FiTrendingUp className="text-[#f59e0b]" /> Priority Distribution
                    </h3>

                    <div className="space-y-3.5 mt-4">
                        {["critical", "high", "medium", "low"].map((key) => {
                            const count = priorityReport[key] || 0;
                            const pct = totalBugs > 0 ? Math.round((count / totalBugs) * 100) : 0;

                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between text-[13px] mb-1">
                                        <span className="font-semibold text-[#dfe3ee] capitalize">
                                            {key} Priority
                                        </span>
                                        <span className="text-[#dfe3ee] font-bold">
                                            {count} <span className="text-[#8f9bb3] font-normal">({pct}%)</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[#111422] overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#282e45] text-[12px] text-[#8f9bb3]">
                    Align priorities with current sprint milestones.
                </div>
            </div>
        </div>
    );
};

export default BugReportChart;
