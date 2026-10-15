import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TYPE_CONFIG = {
    task: {
        icon: "📋",
        label: "Task",
        badgeBg: "bg-[#1e293b]",
        badgeText: "text-[#60a5fa]",
        border: "border-[#2563eb]/30",
    },
    bug: {
        icon: "🐛",
        label: "Bug",
        badgeBg: "bg-[#331c23]",
        badgeText: "text-[#f87171]",
        border: "border-[#dc2626]/30",
    },
    meeting: {
        icon: "📅",
        label: "Meeting",
        badgeBg: "bg-[#281c3b]",
        badgeText: "text-[#c084fc]",
        border: "border-[#9333ea]/30",
    },
    project: {
        icon: "📁",
        label: "Project",
        badgeBg: "bg-[#18332b]",
        badgeText: "text-[#34d399]",
        border: "border-[#059669]/30",
    },
    general: {
        icon: "🔔",
        label: "General",
        badgeBg: "bg-[#2d2518]",
        badgeText: "text-[#fbbf24]",
        border: "border-[#d97706]/30",
    },
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
    if (!notification) return null;

    const {
        _id,
        title,
        message,
        type = "general",
        sender,
        receiver,
        project,
        isRead,
        createdAt,
    } = notification;

    const config = TYPE_CONFIG[type?.toLowerCase()] || TYPE_CONFIG.general;

    const senderName = sender
        ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || sender.email || "System"
        : "System";

    const senderInitial = senderName.charAt(0).toUpperCase() || "S";

    const timeAgo = createdAt ? dayjs(createdAt).fromNow() : "";

    return (
        <div
            className={`group relative p-4 rounded-[10px] border transition-all duration-200 flex items-start gap-3.5 ${
                isRead
                    ? "bg-[#171b2e] border-[#282e45] hover:border-[#384160] hover:bg-[#1f243d]"
                    : "bg-[#1a2035] border-[#5865f2]/40 shadow-sm hover:border-[#5865f2]"
            }`}
        >
            {/* Unread Glowing Dot */}
            {!isRead && (
                <span
                    className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#5865f2] shadow-[0_0_8px_rgba(88,101,242,0.8)]"
                    title="Unread"
                />
            )}

            {/* Type Icon Badge */}
            <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-[18px] shrink-0 border ${config.badgeBg} ${config.border}`}
            >
                {config.icon}
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 pr-6">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.badgeBg} ${config.badgeText}`}
                    >
                        {config.label}
                    </span>

                    {project && (
                        <span className="text-[11px] font-medium text-[#8f9bb3] bg-[#111422] px-2 py-0.5 rounded-md border border-[#282e45] truncate max-w-[150px]">
                            {project.projectName || project.projectId || "Project"}
                        </span>
                    )}

                    <span className="text-[12px] text-[#7f8aa5] ml-auto">
                        {timeAgo}
                    </span>
                </div>

                <h4
                    className={`text-[14px] font-semibold m-0 leading-snug break-words ${
                        isRead ? "text-[#dfe3ee]" : "text-[#ffffff]"
                    }`}
                >
                    {title}
                </h4>

                {message && (
                    <p className="text-[13px] text-[#8f9bb3] m-0 mt-1 leading-relaxed break-words whitespace-pre-wrap">
                        {message}
                    </p>
                )}

                {/* Footer Info & Actions */}
                <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[#282e45]">
                    <div className="flex flex-wrap items-center gap-2">
                        {sender?.profileImage ? (
                            <img
                                src={sender.profileImage}
                                alt={senderName}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-[#282e45] text-[#9fc5ff] text-[10px] font-bold flex items-center justify-center uppercase">
                                {senderInitial}
                            </div>
                        )}
                        <span className="text-[12px] text-[#7f8aa5]">
                            From: <span className="text-[#dfe3ee] font-medium">{senderName}</span>
                        </span>
                        {receiver && (
                            <span className="text-[12px] text-[#7f8aa5] ml-1">
                                • To:{" "}
                                <span className="text-[#dfe3ee] font-medium">
                                    {`${receiver.firstName || ""} ${receiver.lastName || ""}`.trim() ||
                                        receiver.email ||
                                        "User"}
                                </span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        {!isRead && onMarkAsRead && (
                            <button
                                type="button"
                                onClick={() => onMarkAsRead(_id)}
                                className="text-[11px] font-medium py-1 px-2.5 rounded-md bg-[#282e45] hover:bg-[#343b55] text-[#82b4ff] transition-colors cursor-pointer"
                            >
                                Mark Read
                            </button>
                        )}

                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(_id)}
                                className="text-[11px] font-medium py-1 px-2.5 rounded-md bg-[#a83d4c]/20 hover:bg-[#a83d4c]/30 text-[#ff8e9a] border border-[#a83d4c]/30 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
