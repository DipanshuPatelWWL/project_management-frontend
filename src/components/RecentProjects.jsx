import "./RecentProjects.css";

const RecentProjects = ({ projects, loading, error }) => {
    if (loading) return <p>Loading projects...</p>;
    if (error) return <p className="rp-error">{error}</p>;
    if (!projects || projects.length === 0) return <p>No projects found.</p>;

    return (
        <table className="rp-table">
            <thead>
                <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Deadline</th>
                </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                    <tr key={project._id}>
                        <td>{project.projectName}</td>
                        <td>{project.status}</td>
                        <td>{project.progress}%</td>
                        <td>
                            {project.deadline
                                ? new Date(project.deadline).toLocaleDateString()
                                : "—"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RecentProjects;