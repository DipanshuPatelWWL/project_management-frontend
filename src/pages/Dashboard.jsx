
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as projectService from "../services/projectService";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAdmin =
        user?.role === "SuperAdmin" || user?.role === "Admin";

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await projectService.getProjects();
                setProjects(data.projects || data || []);
            } catch (err) {
                const message =
                    err.response?.data?.message ||
                    "Could not load projects. Please try again.";

                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const handleCreateUser = () => {
        console.log("Create User clicked");
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>

                    {user && (
                        <p className="welcome-text">
                            Welcome, {user.firstName || user.email}
                        </p>
                    )}
                </div>

                <div className="header-actions">
                    {isAdmin && (
                        <button
                            className="create-user-button"
                            onClick={handleCreateUser}
                        >
                            + Create User
                        </button>
                    )}

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <section className="dashboard-content">
                <h2>Projects</h2>

                {loading && <p>Loading projects...</p>}

                {error && (
                    <p className="dashboard-error">
                        {error}
                    </p>
                )}

                {!loading && !error && projects.length === 0 && (
                    <p>No projects found.</p>
                )}

                {!loading && !error && projects.length > 0 && (
                    <table className="project-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Progress</th>
                                <th>Deadline</th>
                            </tr>
                        </thead>

                        <tbody>
                            {projects.map((project) => (
                                <tr key={project._id}>
                                    <td>{project.projectName}</td>
                                    <td>{project.status}</td>
                                    <td>{project.priority}</td>
                                    <td>{project.progress}%</td>
                                    <td>
                                        {project.deadline
                                            ? new Date(
                                                  project.deadline
                                              ).toLocaleDateString()
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default Dashboard;

