import { useState, useEffect, useRef } from "react";
import * as notificationService from "../services/notificationService";
import Loader from "./Loader";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications || data || []);
        } catch (err) {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };
  
    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (err) {
           
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            // no-op
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="relative bg-transparent border-0 cursor-pointer text-[20px] p-0 flex items-center justify-center"
                onClick={() => setOpen((prev) => !prev)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-[#e53e3e] text-white text-[10px] font-bold rounded-full py-[2px] px-[5px] min-w-[16px] text-center leading-none">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-9 w-[300px] max-h-[360px] overflow-y-auto bg-white border border-[#ddd] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-20 text-slate-800">
                    <div className="flex justify-between items-center py-2.5 px-3.5 border-b border-[#eee] text-[14px] font-semibold">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                className="bg-transparent border-0 text-[#4f46e5] text-[12px] cursor-pointer font-medium hover:underline p-0"
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col">
                        {loading && <Loader size="sm" />}

                        {!loading && notifications.length === 0 && (
                            <p className="p-4 text-center text-[13px] text-[#888] m-0">No notifications</p>
                        )}

                        {!loading &&
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`p-2.5 px-3.5 border-b border-[#f2f2f2] cursor-pointer hover:bg-slate-50 transition-colors ${
                                        n.isRead ? "" : "bg-[#f5f5ff]"
                                    }`}
                                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                >
                                    <p className="text-[13px] font-semibold text-slate-900 m-0">{n.title}</p>
                                    <p className="text-[12px] text-[#666] m-0 mt-0.5">{n.message}</p>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;