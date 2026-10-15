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
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#171b2e] border border-[#282e45] p-4 rounded-[10px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-[400px]">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8f9bb3]">
                    🔍
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full h-[42px] pl-10 pr-4 bg-[#111422] border border-[#30364d] rounded-lg text-[14px] text-white placeholder-[#5d6785] focus:outline-none focus:border-[#5865f2] transition-colors"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
                {unreadCount > 0 && onMarkAllAsRead && (
                    <button
                        type="button"
                        onClick={onMarkAllAsRead}
                        disabled={loading}
                        className="h-[42px] px-4 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                        className="h-[42px] px-4 bg-[#171b2e] hover:bg-[#222942] text-[#8f9bb3] hover:text-white border border-[#30364d] rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
