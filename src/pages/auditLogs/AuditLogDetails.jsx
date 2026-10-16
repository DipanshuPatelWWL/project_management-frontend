import React from "react";
import AuditActionBadge from "../../components/auditLogs/AuditActionBadge";

const AuditLogDetails = ({ log, onClose, onDelete, isSuperAdmin }) => {
    if (!log) return null;

    const formattedDate = log.createdAt
        ? new Date(log.createdAt).toLocaleString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
          })
        : "-";

    return (
        <div
            className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5"
        >
            <div
                className="w-full max-w-[650px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                    <div>
                        <h2 className="m-0 text-white text-[18px] font-semibold">
                            Audit Log Details
                        </h2>
                        <span className="text-[11px] font-mono text-[#7f8aa5] mt-0.5 block">
                            ID: {log._id}
                        </span>
                    </div>
                    <button
                        className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* Content Body Grid */}
                <div className="p-[1px] grid grid-cols-2 max-[900px]:grid-cols-1 gap-[1px] bg-[#282e45]">
                    {/* Action */}
                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                        <strong className="text-[#7f8aa5] text-[12px]">Action</strong>
                        <div>
                            <AuditActionBadge action={log.action} />
                        </div>
                    </div>

                    {/* Module */}
                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                        <strong className="text-[#7f8aa5] text-[12px]">Module</strong>
                        <span className="text-[#eef1f8] text-[14px] font-medium uppercase tracking-wide">
                            {log.module || "-"}
                        </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                        <strong className="text-[#7f8aa5] text-[12px]">Recorded At</strong>
                        <span className="text-[#eef1f8] text-[13px] font-mono">
                            {formattedDate}
                        </span>
                    </div>

                    {/* Initiator / User */}
                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                        <strong className="text-[#7f8aa5] text-[12px]">Actor / Initiator</strong>
                        {log.user ? (
                            <div className="flex items-center justify-between text-xs">
                                <div>
                                    <div className="text-[#eef1f8] font-semibold text-[14px]">
                                        {log.user.firstName} {log.user.lastName}
                                    </div>
                                    <div className="text-[#8f9bb3] text-[12px]">{log.user.email}</div>
                                </div>
                                <div className="text-right">
                                    <span className="px-2.5 py-1 rounded-[20px] bg-[#5865f2]/15 text-[#818cf8] text-[11px] font-semibold border border-[#5865f2]/30">
                                        {log.user.role || "User"}
                                    </span>
                                    {log.user.employeeId && (
                                        <div className="text-[11px] font-mono text-[#7f8aa5] mt-1">
                                            {log.user.employeeId}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-[13px] text-[#7f8aa5] italic">
                                System / Anonymous / Unauthenticated
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-[900px]:col-span-1">
                        <strong className="text-[#7f8aa5] text-[12px]">Action Description</strong>
                        <p className="text-[#eef1f8] text-[13px] leading-[1.6] m-0 whitespace-pre-line font-mono bg-[#111422] p-3 rounded-lg border border-[#282e45]">
                            {log.description}
                        </p>
                    </div>

                    {/* Affected Entity */}
                    {(log.entityType || log.entityId) && (
                        <>
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Target Entity Type</strong>
                                <span className="text-[#eef1f8] text-[13px] font-medium">
                                    {log.entityType || "N/A"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px]">Target ObjectId</strong>
                                <span className="text-[#eef1f8] text-[13px] font-mono break-all" title={log.entityId}>
                                    {log.entityId || "N/A"}
                                </span>
                            </div>
                        </>
                    )}

                    {/* Technical & Network */}
                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                        <strong className="text-[#7f8aa5] text-[12px]">IP Address</strong>
                        <span className="text-[#eef1f8] text-[13px] font-mono">
                            {log.ipAddress || "Unknown"}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                        <strong className="text-[#7f8aa5] text-[12px]">Browser / Client</strong>
                        <span className="text-[#eef1f8] text-[12px] font-mono break-all">
                            {log.browser || "Unknown"}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center py-4 px-[22px] border-t border-[#282e45] bg-[#171b2e]">
                    {isSuperAdmin && onDelete ? (
                        <button
                            onClick={() => {
                                onDelete(log._id);
                                onClose();
                            }}
                            className="border-none rounded-[6px] py-[8px] px-4 text-[13px] font-medium cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] hover:bg-[#522d36]"
                        >
                            Delete Record
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={onClose}
                        className="border-none rounded-[6px] py-[8px] px-4 text-[13px] font-medium cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogDetails;
