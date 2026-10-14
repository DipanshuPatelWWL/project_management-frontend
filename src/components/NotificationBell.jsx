import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import Loader from "./Loader";

const NotificationBell = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotification();

    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        setOpen(false);
        navigate("/notifications");
    };

    const handleViewAll = () => {
        setOpen(false);
        navigate("/notifications");
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                className="relative w-9 h-9 rounded-lg bg-[#1a1f33] hover:bg-[#232942] border border-[#2b334f] cursor-pointer text-[18px] p-0 flex items-center justify-center transition-colors text-white"
                onClick={() => setOpen((prev) => !prev)}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-[340px] max-h-[440px] flex flex-col bg-[#171b2e] border border-[#282e45] rounded-xl shadow-2xl z-50 text-[#e8ebf5] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex justify-between items-center py-3 px-4 border-b border-[#232942] bg-[#141829]">
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-[#ef4444]/20 text-[#ff8e9a]">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="bg-transparent border-0 text-[#9fc5ff] text-[12px] cursor-pointer font-medium hover:underline p-0"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Scrollable Items */}
                    <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col divide-y divide-[#202742]">
                        {loading && (
                            <div className="p-6 flex justify-center">
                                <Loader size="sm" />
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="p-8 text-center text-[#7482a3]">
                                <span className="text-2xl block mb-1">🔔</span>
                                <p className="text-[13px] m-0">No notifications yet</p>
                            </div>
                        )}

                        {!loading &&
                            notifications.slice(0, 6).map((n) => (
                                <div
                                    key={n._id}
                                    className={`p-3 px-4 cursor-pointer hover:bg-[#1f253d] transition-colors flex items-start gap-2.5 ${
                                        n.isRead ? "opacity-75" : "bg-[#1d233a]"
                                    }`}
                                    onClick={() => handleItemClick(n)}
                                >
                                    {!n.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-[#5865f2] shrink-0 mt-1.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-white m-0 truncate">
                                            {n.title}
                                        </p>
                                        <p className="text-[12px] text-[#93a1c2] m-0 mt-0.5 line-clamp-2">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 px-4 border-t border-[#232942] bg-[#141829] text-center">
                        <button
                            type="button"
                            onClick={handleViewAll}
                            className="w-full py-1.5 text-center text-[12px] font-medium text-[#9fc5ff] hover:text-white transition-colors cursor-pointer bg-transparent border-0"
                        >
                            View all notifications →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;