import React from "react";

const NotificationActions = ({
    unreadCount = 0,
    totalCount = 0,
    searchQuery = "",
    onSearchChange,
    onMarkAllAsRead,
    onRefresh,
    loading = false,
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171b2e] border border-[#282e45] p-3.5 rounded-xl">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-[360px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7482a3]">
                    🔍
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full pl-9 pr-3 py-2 bg-[#0f1322] border border-[#2b334f] rounded-lg text-[13px] text-white placeholder-[#687596] focus:outline-none focus:border-[#5865f2] transition-colors"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                {unreadCount > 0 && onMarkAllAsRead && (
                    <button
                        type="button"
                        onClick={onMarkAllAsRead}
                        disabled={loading}
                        className="px-3.5 py-2 bg-[#222a45] hover:bg-[#2c3658] text-[#9fc5ff] border border-[#333e66] rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <span>✓✓</span>
                        <span>Mark all as read</span>
                    </button>
                )}

                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-3 py-2 bg-[#1b2035] hover:bg-[#252c48] text-[#cbd2e3] border border-[#2b334f] rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Refresh notifications"
                    >
                        <span className={loading ? "animate-spin" : ""}>🔄</span>
                        <span className="max-sm:hidden">Refresh</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationActions;
