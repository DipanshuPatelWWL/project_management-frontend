import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as userService from "../../services/userService";
import "./Users.css";

const PAGE_SIZE = 10;

const Users = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const searchFromUrl = searchParams.get("search") || "";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: searchFromUrl,
        role: "",
        status: "",
    });

    const [page, setPage] = useState(1);
    const [viewUser, setViewUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await userService.getUsers();

            setUsers(data.users || data || []);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Could not load users.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            search: searchFromUrl,
        }));

        setPage(1);
    }, [searchFromUrl]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const fullName =
                `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

            const searchValue = filters.search.toLowerCase();

            const matchesSearch =
                !filters.search ||
                fullName.includes(searchValue) ||
                user.email?.toLowerCase().includes(searchValue) ||
                user.employeeId?.toLowerCase().includes(searchValue);

            const matchesRole =
                !filters.role || user.role === filters.role;

            const matchesStatus =
                !filters.status || user.status === filters.status;

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [users, filters]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / PAGE_SIZE)
    );

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteUser) return;

        try {
            await userService.deleteUser(deleteUser._id);

            setUsers((prev) =>
                prev.filter((u) => u._id !== deleteUser._id)
            );

            if (viewUser?._id === deleteUser._id) {
                setViewUser(null);
            }

            setDeleteUser(null);
            setDeleteError("");
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                "Could not delete user."
            );
        }
    };

    return (
        <div className="users-page">

            <div className="users-top">
                <h1>Users</h1>

                <button
                    className="users-add-btn"
                    onClick={() => navigate("/users/create")}
                >
                    + Add User
                </button>
            </div>

            <div className="users-filters">

                <select
                    value={filters.role}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            role: e.target.value,
                        })
                    }
                >
                    <option value="">All Roles</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="Admin">Admin</option>
                    <option value="ProjectManager">Project Manager</option>
                    <option value="TeamLead">Team Lead</option>
                    <option value="Developer">Developer</option>
                    <option value="QA">QA</option>
                    <option value="Client">Client</option>
                </select>

                <select
                    value={filters.status}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            status: e.target.value,
                        })
                    }
                >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

            </div>

            {loading && <p>Loading users...</p>}

            {error && (
                <p className="users-error">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {paginatedUsers.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <div className="users-table-container">

                            <table className="users-table">

                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Company</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedUsers.map((user) => (
                                        <tr key={user._id}>

                                            <td>
                                                {user.employeeId || "-"}
                                            </td>

                                            <td>
                                                {user.firstName || user.lastName
                                                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                                    : "-"}
                                            </td>

                                            <td>
                                                {user.phone || "-"}
                                            </td>

                                            <td>
                                                {user.company?.companyName || "-"}
                                            </td>

                                            <td>
                                                {user.department || "-"}
                                            </td>

                                            <td>
                                                {user.status || "-"}
                                            </td>

                                            <td>
                                                <div className="user-actions">

                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            setViewUser(user)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            navigate(`/users/${user._id}/edit`)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => {
                                                            setDeleteUser(user);
                                                            setDeleteError("");
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>
                    )}

                    {filteredUsers.length > 0 && (
                        <div className="users-pagination">

                            <button
                                disabled={page === 1}
                                onClick={() =>
                                    setPage((p) => p - 1)
                                }
                            >
                                Previous
                            </button>

                            <span>
                                Page {page} of {totalPages}
                            </span>

                            <button
                                disabled={page === totalPages}
                                onClick={() =>
                                    setPage((p) => p + 1)
                                }
                            >
                                Next
                            </button>

                        </div>
                    )}
                </>
            )}

            {viewUser && (
                <div
                    className="user-modal-overlay"
                   // onClick={() => setViewUser(null)}
                >
                    <div
                        className="user-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="user-modal-header">
                            <h2>User Details</h2>

                            <button
                                className="user-modal-close"
                                onClick={() => setViewUser(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="user-modal-body">

                            <div className="user-detail-item">
                                <strong>Employee ID</strong>
                                <span>
                                    {viewUser.employeeId || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Name</strong>
                                <span>
                                    {`${viewUser.firstName || ""} ${viewUser.lastName || ""}`.trim() || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Email</strong>
                                <span>
                                    {viewUser.email || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Phone</strong>
                                <span>
                                    {viewUser.phone || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Role</strong>
                                <span>
                                    {viewUser.role || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Company</strong>
                                <span>
                                    {viewUser.company?.companyName || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Designation</strong>
                                <span>
                                    {viewUser.designation || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Department</strong>
                                <span>
                                    {viewUser.department || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Employment Type</strong>
                                <span>
                                    {viewUser.employmentType || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Work Location</strong>
                                <span>
                                    {viewUser.workLocation || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Status</strong>
                                <span>
                                    {viewUser.status || "-"}
                                </span>
                            </div>

                            <div className="user-detail-item">
                                <strong>Joining Date</strong>
                                <span>
                                    {viewUser.joiningDate
                                        ? new Date(
                                            viewUser.joiningDate
                                        ).toLocaleDateString()
                                        : "-"}
                                </span>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            {deleteUser && (
                <div
                    className="delete-modal-overlay"
                   // onClick={() => setDeleteUser(null)}
                >
                    <div
                        className="delete-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="delete-modal-header">
                            <h2>Delete User</h2>

                            <button
                                className="delete-modal-close"
                                onClick={() => setDeleteUser(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="delete-modal-body">

                            <p>
                                Are you sure you want to delete
                                <strong>
                                    {" "}
                                    {deleteUser.firstName || ""}{" "}
                                    {deleteUser.lastName || ""}
                                    <br></br>
                                    {deleteUser.employeeId || ""}
                                </strong>
                                ?
                            </p>

                            <p className="delete-warning">
                                This action cannot be undone.
                            </p>

                            {deleteError && (
                                <p className="delete-error">
                                    {deleteError}
                                </p>
                            )}

                        </div>

                        <div className="delete-modal-actions">

                            <button
                                className="cancel-delete-btn"
                                onClick={() => setDeleteUser(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-delete-btn"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Users;