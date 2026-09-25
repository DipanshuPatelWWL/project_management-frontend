import Loader from "./Loader";

const UpcomingMeetings = ({ meetings, loading, error }) => {
    if (loading) return <Loader size="sm" />;
    if (error) {
        return (
            <p className="text-[#ff9da9] bg-[rgba(220,38,38,0.12)] border border-[rgba(220,38,38,0.35)] rounded-lg py-3 px-4 text-[13px] my-4">
                {error}
            </p>
        );
    }
    if (!meetings || meetings.length === 0) {
        return (
            <p className="p-[55px_20px] text-center text-[#7f8aa5] bg-[#171b2e] rounded-xl border border-[#282e45] m-0">
                No upcoming meetings.
            </p>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 overflow-hidden text-[14px] bg-[#171b2e] border border-[#282e45] rounded-xl">
                <thead>
                    <tr>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.06em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap first:rounded-tl-xl">
                            Meeting Title
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.06em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap">
                            Date
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.06em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap">
                            Time
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.06em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap">
                            Project
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.06em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap last:rounded-tr-xl">
                            Participants
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {meetings.map((meeting) => (
                        <tr key={meeting._id} className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0">
                            <td className="py-[15px] px-[18px] text-[#e8ebf5] border-b border-[#282e45]">
                                {meeting.meetingTitle}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#e8ebf5] border-b border-[#282e45]">
                                {meeting.meetingDate
                                    ? new Date(meeting.meetingDate).toLocaleDateString()
                                    : "—"}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#e8ebf5] border-b border-[#282e45]">
                                {meeting.startTime || "—"}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#e8ebf5] border-b border-[#282e45]">
                                {meeting.project?.projectName || "—"}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#e8ebf5] border-b border-[#282e45]">
                                {meeting.participants
                                    ? `${meeting.participants.firstName} ${meeting.participants.lastName}`
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UpcomingMeetings;