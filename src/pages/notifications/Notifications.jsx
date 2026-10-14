import React, { useState, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import NotificationFilters from "../../components/notifications/NotificationFilters";
import NotificationActions from "../../components/notifications/NotificationActions";
import NotificationList from "../../components/notifications/NotificationList";
import NotificationBadge from "../../components/notifications/NotificationBadge";

const Notifications = () => {
    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotification();

    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Calculate count for each category filter
    const counts = useMemo(() => {
        const list = Array.isArray(notifications) ? notifications : [];
        const c = {
            all: list.length,
            unread: 0,
            read: 0,
            task: 0,
            bug: 0,
            meeting: 0,
            project: 0,
            general: 0,
        };

        list.forEach((n) => {
            if (n.isRead) {
                c.read += 1;
            } else {
                c.unread += 1;
            }

            const typeKey = (n.type || "general").toLowerCase();
            if (c[typeKey] !== undefined) {
                c[typeKey] += 1;
            } else {
                c.general += 1;
            }
        });

        return c;
    }, [notifications]);

    // Filter and search notifications
    const filteredNotifications = useMemo(() => {
        const list = Array.isArray(notifications) ? notifications : [];
        return list.filter((n) => {
            // Category / Status Filter
            if (activeFilter === "unread" && n.isRead) return false;
            if (activeFilter === "read" && !n.isRead) return false;
            if (
                ["task", "bug", "meeting", "project", "general"].includes(activeFilter)
            ) {
                const itemType = (n.type || "general").toLowerCase();
                if (itemType !== activeFilter) return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = n.title?.toLowerCase().includes(query);
                const msgMatch = n.message?.toLowerCase().includes(query);
                const senderMatch =
                    `${n.sender?.firstName || ""} ${n.sender?.lastName || ""}`
                        .toLowerCase()
                        .includes(query);
                if (!titleMatch && !msgMatch && !senderMatch) return false;
            }

            return true;
        });
    }, [notifications, activeFilter, searchQuery]);

    return (
        <div className="min-h-screen bg-[#0b0e19] text-[#e8ebf5] p-6 max-md:p-4">
            <div className="max-w-6xl mx-auto flex flex-col gap-5">
                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#202742]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#1b223d] border border-[#2b355e] flex items-center justify-center text-2xl shadow-inner">
                            🔔
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-[22px] font-bold text-white m-0">
                                    Notifications
                                </h1>
                                <NotificationBadge count={unreadCount} size="md" />
                            </div>
                            <p className="text-[13px] text-[#7a87a7] m-0 mt-0.5">
                                Real-time activity, task updates, bug reports, and meeting alerts
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#142621] border border-[#1e4d3d] text-[#4ade80] text-[12px] font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                            Live Updates
                        </span>
                    </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-3.5">
                    <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[12px] text-[#7a87a7] font-medium block">
                                Total Notifications
                            </span>
                            <span className="text-[22px] font-bold text-white block mt-0.5">
                                {counts.all}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-lg">
                            📊
                        </div>
                    </div>

                    <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[12px] text-[#7a87a7] font-medium block">
                                Unread Alerts
                            </span>
                            <span className="text-[22px] font-bold text-[#ff9da9] block mt-0.5">
                                {counts.unread}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#3a1d26] text-[#ff8e9a] flex items-center justify-center text-lg">
                            ⚠️
                        </div>
                    </div>

                    <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[12px] text-[#7a87a7] font-medium block">
                                Read / Completed
                            </span>
                            <span className="text-[22px] font-bold text-[#7fe3a8] block mt-0.5">
                                {counts.read}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#193326] text-[#7fe3a8] flex items-center justify-center text-lg">
                            ✓
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <NotificationFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    counts={counts}
                />

                {/* Actions & Search */}
                <NotificationActions
                    unreadCount={unreadCount}
                    totalCount={counts.all}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onMarkAllAsRead={markAllAsRead}
                    onRefresh={fetchNotifications}
                    loading={loading}
                />

                {/* Notification List */}
                <NotificationList
                    notifications={filteredNotifications}
                    loading={loading}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    activeFilter={activeFilter}
                />
            </div>
        </div>
    );
};

export default Notifications;
