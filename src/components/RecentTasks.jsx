import "./RecentTasks.css";

// NOTE: requires backend fix - taskController.js's getTasks() must
// .populate("project", "projectName") and
// .populate("assignedTo", "firstName lastName") for project/assignedTo
// to be objects instead of raw ObjectId strings.
const RecentTasks = ({ tasks, loading, error }) => {
    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p className="rt-error">{error}</p>;
    if (!tasks || tasks.length === 0) return <p>No tasks found.</p>;

    return (
        <table className="rt-table">
            <thead>
                <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map((task) => (
                    <tr key={task._id}>
                        <td>{task.taskTitle}</td>
                        <td>{task.project?.projectName || "—"}</td>
                        <td>
                            {task.assignedTo
                                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                : "—"}
                        </td>
                        <td>{task.priority}</td>
                        <td>{task.status}</td>
                        <td>
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "—"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RecentTasks;