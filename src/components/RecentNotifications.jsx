import "./RecentNotifications.css";

const RecentNotifications = ({ notifications, loading, error }) => {
    if (loading) return <p>Loading notifications...</p>;
    if (error) return <p className="rn-error">{error}</p>;
    if (!notifications || notifications.length === 0)
        return <p>No notifications found.</p>;

    return (
        <table className="rn-table">
            <thead>
                <tr>
                    <th>Notification</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Read/Unread</th>
                </tr>
            </thead>
            <tbody>
                {notifications.map((n) => (
                    <tr key={n._id} className={n.isRead ? "" : "rn-unread"}>
                        <td>{n.message || n.title}</td>
                        <td>{n.type}</td>
                        <td>
                            {n.createdAt
                                ? new Date(n.createdAt).toLocaleDateString()
                                : "—"}
                        </td>
                        <td>
                            <span className={n.isRead ? "rn-badge-read" : "rn-badge-unread"}>
                                {n.isRead ? "Read" : "Unread"}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RecentNotifications;