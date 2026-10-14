import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import * as notificationService from "../services/notificationService";

const NotificationContext = createContext();

const SOCKET_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    // Fetch all notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            return;
        }
  
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications();
            const list = Array.isArray(data?.notifications)
                ? data.notifications
                : Array.isArray(data)
                ? data
                : [];
            setNotifications(list);
        } catch (err) {
            console.error("Failed to fetch notifications:", err.message);
            setError(err.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load when user logs in
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket.IO Real-time Connection
    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Initialize Socket connection with credentials (cookies)
        const socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket connected for user:", user._id);
        });

        // Listen for newNotification emitted by backend
        socket.on("newNotification", (incoming) => {
            if (!incoming) return;

            setNotifications((prev) => {
                // Prevent duplicate if already received
                const exists = prev.some((n) => n._id === incoming._id);
                if (exists) return prev;
                return [incoming, ...prev];
            });

            // Show sleek jet-black notification popup toast
            toast.custom((t) => (
                <div
                    className={`${
                        t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    } transition-all duration-200 max-w-sm w-full bg-[#000000] border border-[#2d3748] shadow-[0_10px_35px_rgba(0,0,0,0.95)] rounded-xl pointer-events-auto flex items-start gap-3 p-4 text-white`}
                >
                    <div className="w-9 h-9 rounded-lg bg-[#111420] border border-[#23293a] flex items-center justify-center text-lg shrink-0">
                        {incoming.type === "bug"
                            ? "🐛"
                            : incoming.type === "meeting"
                            ? "📅"
                            : incoming.type === "project"
                            ? "📁"
                            : "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[14px] font-bold text-white m-0 truncate">
                                {incoming.title || "New Notification"}
                            </p>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#1c2338] text-[#60a5fa]">
                                {incoming.type || "Task"}
                            </span>
                        </div>
                        <p className="text-[12px] text-[#94a3b8] m-0 mt-1 line-clamp-2 leading-relaxed">
                            {incoming.message || ""}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => toast.dismiss(t.id)}
                        className="text-[#64748b] hover:text-white text-[16px] leading-none cursor-pointer p-0.5 bg-transparent border-0"
                    >
                        ×
                    </button>
                </div>
            ), {
                duration: 5000,
                position: "top-right",
            });
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    // Mark single notification as read
    const markAsRead = async (notificationId) => {
        if (!notificationId) return;
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (err) {
            console.error("Failed to mark notification as read:", err.message);
        }
    };
  
    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            toast.success("All notifications marked as read");
        } catch (err) {
            console.error("Failed to mark all as read:", err.message);
            toast.error("Failed to mark all as read");
        }
    };

    // Delete single notification
    const deleteNotification = async (notificationId) => {
        if (!notificationId) return;
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications((prev) =>
                prev.filter((n) => n._id !== notificationId)
            );
            toast.success("Notification deleted");
        } catch (err) {
            console.error("Failed to delete notification:", err.message);
            toast.error("Failed to delete notification");
        }
    };

    // Unread count
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

export default NotificationContext;
