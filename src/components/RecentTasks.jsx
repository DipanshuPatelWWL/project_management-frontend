import Loader from "./Loader";

const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "active") {
        return "text-[#7fe3a8] bg-[#1c3a2e] border-[#2c5443]";
    }
    if (s === "in progress" || s === "in-progress" || s === "pending") {
        return "text-[#f2c96d] bg-[#3d3520] border-[#574a28]";
    }
    if (s === "failed" || s === "inactive") {
        return "text-[#ff9da9] bg-[#40252c] border-[#563039]";
    }
    return "text-[#9fc5ff] bg-[#1e2c42] border-[#2c405c]";
};

// NOTE: requires backend fix - taskController.js's getTasks() must
// .populate("project", "projectName") and
// .populate("assignedTo", "firstName lastName") for project/assignedTo
// to be objects instead of raw ObjectId strings.
const RecentTasks = ({ tasks, loading, error }) => {
    if (loading) return <Loader size="sm" />;
    if (error) {
        return (
            <p className="flex items-center gap-2.5 my-4 py-3.5 px-[18px] text-[#ff9da9] text-[13px] font-semibold bg-[rgba(220,38,38,0.12)] border border-[rgba(220,38,38,0.35)] border-l-4 border-l-[#a83d4c] rounded-[10px]">
                {error}
            </p>
        );
    }
    if (!tasks || tasks.length === 0) {
        return (
            <p className="p-[55px_20px] text-center text-[#7f8aa5] bg-[#171b2e] rounded-xl border border-[#282e45] m-0">
                No tasks found.
            </p>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 overflow-hidden text-[14px] bg-[#171b2e] border border-[#282e45] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                <thead>
                    <tr>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors first:rounded-tl-xl">
                            Task
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors">
                            Project
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors">
                            Assigned To
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors">
                            Priority
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors">
                            Status
                        </th>
                        <th className="py-[15px] px-[18px] text-left text-[#8f9bb3] text-[11px] font-bold uppercase tracking-[0.08em] bg-[#1c2136] border-b border-[#282e45] whitespace-nowrap hover:text-white transition-colors last:rounded-tr-xl">
                            Due Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task, idx) => (
                        <tr
                            key={task._id}
                            className={`bg-[#171b2e] even:bg-[#191d32] hover:bg-[#1f2440] hover:translate-x-[2px] hover:shadow-[inset_4px_0_0_#5865f2] relative z-[1] transition-all duration-200 group ${
                                idx === tasks.length - 1 ? "[&>td]:border-b-0" : ""
                            }`}
                        >
                            <td className="py-[15px] px-[18px] text-[#eef1f8] font-semibold border-b border-[#282e45] group-hover:pl-[22px] group-hover:text-[#9fb0ff] transition-all">
                                {task.taskTitle}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                {task.project?.projectName || "—"}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                {task.assignedTo
                                    ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                    : "—"}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                {task.priority}
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                <span className={`inline-flex items-center justify-center min-w-[76px] py-1 px-2.5 rounded-full text-[11px] font-bold border capitalize transition-transform hover:-translate-y-0.5 ${getStatusBadge(task.status)}`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="py-[15px] px-[18px] text-[#b7bfd6] border-b border-[#282e45] group-hover:text-[#eef1f8] transition-all">
                                {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString()
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentTasks;