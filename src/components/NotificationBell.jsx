import { useState, useEffect, useRef } from "react";
import * as notificationService from "../services/notificationService";
import "./NotificationBell.css";

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
        <div className="notification-bell" ref={menuRef}>
            <button className="bell-trigger" onClick={() => setOpen((prev) => !prev)}>
                🔔
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>

            {open && (
                <div className="bell-dropdown">
                    <div className="bell-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button className="bell-mark-all" onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="bell-list">
                        {loading && <p className="bell-empty">Loading...</p>}

                        {!loading && notifications.length === 0 && (
                            <p className="bell-empty">No notifications</p>
                        )}

                        {!loading &&
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`bell-item ${n.isRead ? "" : "unread"}`}
                                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                >
                                    <p className="bell-item-title">{n.title}</p>
                                    <p className="bell-item-message">{n.message}</p>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;