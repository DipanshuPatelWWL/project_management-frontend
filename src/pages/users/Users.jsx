import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as userService from "../../services/userService";
import "./Users.css";

const PAGE_SIZE = 10;

const Users = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        role: "",
        status: "",
    });

    const [page, setPage] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");

        try {[]
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

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const fullName =
                `${user.firstName} ${user.lastName}`.toLowerCase();

            const matchesSearch =
                !filters.search ||
                fullName.includes(filters.search.toLowerCase()) ||
                user.email
                    ?.toLowerCase()
                    .includes(filters.search.toLowerCase());

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

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await userService.deleteUser(user._id);

            setUsers((prev) =>
                prev.filter((u) => u._id !== user._id)
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Could not delete user."
            );
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus =
            user.status === "Active"
                ? "Inactive"
                : "Active";

        try {
            await userService.changeUserStatus(
                user._id,
                newStatus
            );

            setUsers((prev) =>
                prev.map((u) =>
                    u._id === user._id
                        ? { ...u, status: newStatus }
                        : u
                )
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Could not update status."
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
                        <div>
                            {paginatedUsers.map((user) => (
                                <div key={user._id}>
                                    {user.firstName} {user.lastName} -{" "}
                                    {user.email}
                                </div>
                            ))}
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

        </div>
    );
};

export default Users;