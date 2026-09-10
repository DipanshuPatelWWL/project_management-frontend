import "./UpcomingMeetings.css";

const UpcomingMeetings = ({ meetings, loading, error }) => {
    if (loading) return <p>Loading meetings...</p>;
    if (error) return <p className="um-error">{error}</p>;
    if (!meetings || meetings.length === 0) return <p>No upcoming meetings.</p>;

    return (
        <table className="um-table">
            <thead>
                <tr>
                    <th>Meeting Title</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Project</th>
                    <th>Participants</th>
                </tr>
            </thead>
            <tbody>
                {meetings.map((meeting) => (
                    <tr key={meeting._id}>
                        <td>{meeting.meetingTitle}</td>
                        <td>
                            {meeting.meetingDate
                                ? new Date(meeting.meetingDate).toLocaleDateString()
                                : "—"}
                        </td>
                        <td>{meeting.startTime || "—"}</td>
                        <td>{meeting.project?.projectName || "—"}</td>
                        <td>
                            {meeting.participants
                                ? `${meeting.participants.firstName} ${meeting.participants.lastName}`
                                : "—"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default UpcomingMeetings;