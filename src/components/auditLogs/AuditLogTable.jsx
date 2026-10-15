import React from "react";
import AuditActionBadge from "./AuditActionBadge";

const formatUserAgent = (ua) => {
    if (!ua || ua === "Unknown" || ua === "Unknown Browser") return "Unknown";
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Postman")) return "Postman";
    return ua.slice(0, 15);
};

const AuditLogTable = ({
    logs = [],
    pagination = {},
    onPageChange,
    onViewDetails,
    onDeleteLog,
    isSuperAdmin = false,
}) => {
    const { page = 1, totalPages = 1, total = 0 } = pagination;

    if (!logs || logs.length === 0) {
        return (
            <div className="w-full bg-[#171b2e] border border-[#282e45] rounded-[10px] p-10 text-center">
                <p className="text-[#8f9bb3] text-[15px] m-0">No audit logs found.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                <table className="w-full min-w-[950px] border-collapse">
                    <thead>
                        <tr>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                Timestamp
                            </th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                User
                            </th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                Module
                            </th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                Event
                            </th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                Description
                            </th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                IP & Device
                            </th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => {
                            const dateStr = log.createdAt
                                ? new Date(log.createdAt).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                  })
                                : "-";

                            return (
                                <tr
                                    key={log._id}
                                    className="border-b border-[#282e45] hover:bg-[#1c2136] transition-colors"
                                >
                                    {/* Timestamp */}
                                    <td className="p-[15px] text-[#8f9bb3] text-[13px] whitespace-nowrap font-mono">
                                        {dateStr}
                                    </td>

                                    {/* User */}
                                    <td className="p-[15px] text-[#eef1f8] text-[14px] whitespace-nowrap">
                                        <div className="font-semibold text-white">
                                            {log.user
                                                ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || "User"
                                                : "System"}
                                        </div>
                                        <div className="text-[12px] text-[#8f9bb3]">
                                            {log.user?.email || log.user?.employeeId || ""}
                                        </div>
                                    </td>

                                    {/* Module */}
                                    <td className="p-[15px] text-[#eef1f8] text-[14px] whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded bg-[#222942] border border-[#30364d] text-[12px] font-mono text-[#dfe3ee]">
                                            {log.module || "General"}
                                        </span>
                                    </td>

                                    {/* Event */}
                                    <td className="p-[15px] whitespace-nowrap">
                                        <AuditActionBadge action={log.action} />
                                    </td>

                                    {/* Description */}
                                    <td className="p-[15px] text-[#dfe3ee] text-[13px] max-w-sm truncate" title={log.description}>
                                        {log.description}
                                    </td>

                                    {/* IP & Browser */}
                                    <td className="p-[15px] text-[#8f9bb3] text-[13px] whitespace-nowrap">
                                        <span className="font-mono text-white text-[12px] block">
                                            {log.ipAddress || "127.0.0.1"}
                                        </span>
                                        <span className="text-[11px] text-[#8f9bb3]">
                                            {formatUserAgent(log.browser)}
                                        </span>
                                    </td>

                                    {/* Action buttons */}
                                    <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                        <div className="flex items-center gap-[7px] whitespace-nowrap">
                                            <button
                                                onClick={() => onViewDetails(log)}
                                                className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                            >
                                                View
                                            </button>

                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => onDeleteLog(log._id)}
                                                    className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] font-medium hover:bg-[#522d36]"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Same as Task / Sprint / Project) */}
            {logs.length > 0 && (
                <div className="flex items-center justify-center gap-[18px] mt-5">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer transition-colors duration-200 hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                    >
                        Previous
                    </button>

                    <span className="text-[13px] font-medium !text-[#8f9bb3]">
                        Page {page} of {totalPages || 1}
                    </span>

                    <button
                        disabled={page >= (totalPages || 1)}
                        onClick={() => onPageChange(page + 1)}
                        className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer transition-colors duration-200 hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuditLogTable;
