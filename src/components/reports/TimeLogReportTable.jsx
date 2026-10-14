import React from "react";
import { FiClock, FiCalendar, FiUser, FiFolder } from "react-icons/fi";
import dayjs from "dayjs";

const TimeLogReportTable = ({ logs = [], summary = null }) => {
    return (
        <div className="bg-[#141829] border border-[#232a42] rounded-2xl overflow-hidden shadow-md mb-6">
            <div className="p-4 border-b border-[#232a42] flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                    <FiClock className="text-[#38bdf8]" /> Time Log Detail Records
                </h3>

                {summary && (
                    <div className="flex items-center gap-4 text-[12px] text-[#94a3b8]">
                        <span>
                            Total Hours: <strong className="text-[#38bdf8] text-[13px]">{summary.totalLoggedHours || 0}h</strong>
                        </span>
                        <span>
                            Overtime: <strong className="text-[#fbbf24] text-[13px]">{summary.totalOvertime || 0}h</strong>
                        </span>
                        <span>
                            Avg / Day: <strong className="text-white text-[13px]">{summary.averageHoursPerDay || 0}h</strong>
                        </span>
                    </div>
                )}
            </div>

            {(!logs || logs.length === 0) ? (
                <div className="p-8 text-center text-[#7f8aa5]">
                    No detailed time logs found for the selected period.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] border-collapse">
                        <thead>
                            <tr className="bg-[#0e1222] text-[#94a3b8] uppercase text-[11px] font-semibold tracking-wider border-b border-[#232a42]">
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4">User</th>
                                <th className="py-3.5 px-4">Project</th>
                                <th className="py-3.5 px-4">Description / Activity</th>
                                <th className="py-3.5 px-4 text-center">Hours</th>
                                <th className="py-3.5 px-4 text-center">Overtime</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e253b]">
                            {logs.map((log) => {
                                const userName = log.user
                                    ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || log.user.email || "User"
                                    : "User";

                                const projectName = log.project
                                    ? log.project.projectName || log.project.projectId || "Project"
                                    : "General";

                                const dateFormatted = log.date
                                    ? dayjs(log.date).format("MMM DD, YYYY")
                                    : log.createdAt
                                    ? dayjs(log.createdAt).format("MMM DD, YYYY")
                                    : "-";

                                return (
                                    <tr key={log._id} className="hover:bg-[#191f36] transition-colors">
                                        {/* Date */}
                                        <td className="py-3.5 px-4 text-[#cbd5e1] font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <FiCalendar size={13} className="text-[#64748b]" />
                                                <span>{dateFormatted}</span>
                                            </div>
                                        </td>

                                        {/* User */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <FiUser size={13} className="text-[#a855f7]" />
                                                <span>{userName}</span>
                                            </div>
                                        </td>

                                        {/* Project */}
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#132238] text-[#60a5fa] border border-[#23385c]">
                                                <FiFolder size={11} />
                                                {projectName}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="py-3.5 px-4 text-[#94a3b8] max-w-xs truncate">
                                            {log.description || log.activity || "Logged hours on project task"}
                                        </td>

                                        {/* Hours Worked */}
                                        <td className="py-3.5 px-4 text-center font-bold text-white whitespace-nowrap">
                                            <span className="px-2 py-0.5 rounded-md bg-[#1e293b] text-[#38bdf8] border border-[#334155]">
                                                {log.hoursWorked || 0} hrs
                                            </span>
                                        </td>

                                        {/* Overtime */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            {Number(log.overtime) > 0 ? (
                                                <span className="px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-400 border border-amber-800/40 font-bold">
                                                    +{log.overtime} hrs
                                                </span>
                                            ) : (
                                                <span className="text-[#64748b]">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TimeLogReportTable;
