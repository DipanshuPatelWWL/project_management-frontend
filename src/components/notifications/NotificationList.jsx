import React from "react";
import NotificationItem from "./NotificationItem";
import Loader from "../Loader";

const NotificationList = ({
    notifications = [],
    loading = false,
    onMarkAsRead,
    onDelete,
    activeFilter = "all",
}) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[280px] bg-[#171b2e] border border-[#282e45] rounded-[10px] p-8">
                <Loader />
                <span className="text-[13px] text-[#8f9bb3] mt-3">
                    Loading notifications...
                </span>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[280px] bg-[#171b2e] border border-[#282e45] rounded-[10px] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#111422] border border-[#282e45] flex items-center justify-center text-[24px] mb-3 text-[#5865f2]">
                    🔔
                </div>
                <h3 className="text-[16px] font-semibold text-white m-0 mb-1">
                    No notifications
                </h3>
                <p className="text-[13px] text-[#8f9bb3] m-0 max-w-sm">
                    {activeFilter === "unread"
                        ? "You're all caught up! No unread notifications."
                        : "You don't have any notifications right now."}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default NotificationList;
