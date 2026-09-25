import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as userService from "../../services/userService";
import Loader from "../../components/Loader";

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

            setUsers(data.users || []);
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
                `${user.firstName || ""} ${user.lastName || ""}`.toUpperCase();

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
        <div className="w-full min-w-0 min-h-full p-[30px] max-md:p-5 box-border overflow-x-hidden">

            <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-[15px] mb-[25px]">
                <h1 className="m-0 text-[28px] font-bold text-[#faf6f6]">Users</h1>

                <button
                    className="border-none bg-[#5865f2] text-white py-[11px] px-[18px] rounded-lg text-[14px] font-semibold cursor-pointer hover:bg-[#4752c4] transition-colors"
                    onClick={() => navigate("/users/create")}
                >
                    + Add User
                </button>
            </div>

            <div className="flex items-center max-md:flex-col max-md:items-stretch gap-3 mb-5">

                <input
                    type="text"
                    className="flex-1 h-[42px] px-3.5 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] w-full"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            search: e.target.value,
                        })
                    }
                />

                <select
                    className="h-[42px] min-w-[160px] max-md:w-full px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none cursor-pointer focus:border-[#5969a8]"
                    value={filters.role}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            role: e.target.value,
                        })
                    }
                >
                    <option value="" className="bg-[#171b2e] text-white">All Roles</option>
                    <option value="SuperAdmin" className="bg-[#171b2e] text-white">SuperAdmin</option>
                    <option value="Admin" className="bg-[#171b2e] text-white">Admin</option>
                    <option value="ProjectManager" className="bg-[#171b2e] text-white">
                        Project Manager
                    </option>
                    <option value="TeamLead" className="bg-[#171b2e] text-white">
                        Team Lead
                    </option>
                    <option value="Developer" className="bg-[#171b2e] text-white">
                        Developer
                    </option>
                    <option value="QA" className="bg-[#171b2e] text-white">QA</option>
                    <option value="Client" className="bg-[#171b2e] text-white">Client</option>
                </select>

                <select
                    className="h-[42px] min-w-[160px] max-md:w-full px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none cursor-pointer focus:border-[#5969a8]"
                    value={filters.status}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            status: e.target.value,
                        })
                    }
                >
                    <option value="" className="bg-[#171b2e] text-white">All Status</option>
                    <option value="Active" className="bg-[#171b2e] text-white">Active</option>
                    <option value="Inactive" className="bg-[#171b2e] text-white">Inactive</option>
                </select>

            </div>

            {loading && <Loader />}

            {error && (
                <p className="text-[#ff8e9a] bg-[#2a1820] border border-[#4a2530] p-3 rounded-[7px]">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {paginatedUsers.length === 0 ? (
                        <p className="p-[55px_20px] text-center text-[#7f8aa5] bg-[#171b2e] rounded-xl border border-[#282e45] m-0">No users found.</p>
                    ) : (
                        <div className="w-full max-w-full min-w-0 bg-[#171b2e] border border-[#282e45] rounded-[10px] overflow-x-auto box-border">

                            <table className="w-full border-collapse text-[13px]">

                                <thead>
                                    <tr>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Employee ID</th>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Name</th>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Phone</th>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Company</th>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Department</th>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Status</th>
                                        <th className="p-[15px] text-left border-b border-[#282e45] whitespace-nowrap bg-transparent text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em]">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0">

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5]">
                                                {user.employeeId || "-"}
                                            </td>

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5] capitalize">
                                                {user.firstName || user.lastName
                                                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                                    : "-"}
                                            </td>

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5]">
                                                {user.phone || "-"}
                                            </td>

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5] capitalize">
                                                {user.company?.companyName || "-"}
                                            </td>

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5] capitalize">
                                                {user.department || "-"}
                                            </td>

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5]">
                                                {user.status ? (
                                                    <span
                                                        className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${
                                                            user.status.toLowerCase() === "active"
                                                                ? "bg-[#1c3a2e] text-[#7fe3a8]"
                                                                : "bg-[#40252c] text-[#ff9da9]"
                                                        }`}
                                                    >
                                                        {user.status}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="p-[15px] border-b border-[#282e45] whitespace-nowrap text-[#e8ebf5]">
                                                <div className="flex items-center gap-[7px]">

                                                    <button
                                                        className="border-none py-[7px] px-[11px] rounded-md text-[12px] cursor-pointer bg-[#222942] text-[#dbe1f2] hover:bg-[#303958] transition-colors"
                                                        onClick={() =>
                                                            setViewUser(user)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="border-none py-[7px] px-[11px] rounded-md text-[12px] cursor-pointer bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f] transition-all"
                                                        onClick={() =>
                                                            navigate(
                                                                `/users/${user._id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="border-none py-[7px] px-[11px] rounded-md text-[12px] cursor-pointer bg-[#40252c] text-[#ff9da9] hover:bg-[#563039] transition-colors"
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
                        <div className="flex items-center justify-center gap-[18px] mt-5">

                            <button
                                className="border border-[#30364d] bg-[#171b2e] text-[#e8ebf5] py-2 px-3.5 rounded-[7px] text-[13px] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={page === 1}
                                onClick={() =>
                                    setPage((p) => p - 1)
                                }
                            >
                                Previous
                            </button>

                            <span className="text-[13px] font-medium !text-[#8f9bb3]">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                className="border border-[#30364d] bg-[#171b2e] text-[#e8ebf5] py-2 px-3.5 rounded-[7px] text-[13px] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5 box-border">

                    <div
                        className="w-[700px] max-w-full max-h-[90vh] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between p-5 sm:p-[20px_22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-[18px] text-white">User Details</h2>

                            <button
                                className="border-none bg-transparent text-[24px] leading-none text-[#8f9bb3] cursor-pointer w-8 h-8 rounded-md hover:bg-[#222942] hover:text-white flex items-center justify-center"
                                onClick={() => setViewUser(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[22px] grid grid-cols-2 max-md:grid-cols-1 gap-5 max-h-[calc(90vh-80px)] overflow-y-auto">

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Employee ID</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words">
                                    {viewUser.employeeId || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Name</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {`${viewUser.firstName || ""} ${viewUser.lastName || ""}`.trim() || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Email</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words">
                                    {viewUser.email || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Phone</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words">
                                    {viewUser.phone || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Role</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {viewUser.role || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Company</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {viewUser.company?.companyName || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Designation</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {viewUser.designation || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Department</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {viewUser.department || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Employment Type</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {viewUser.employmentType || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Work Location</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words capitalize">
                                    {viewUser.workLocation || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Status</strong>
                                <span>
                                    {viewUser.status ? (
                                        <span
                                            className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${
                                                viewUser.status.toLowerCase() === "active"
                                                    ? "bg-[#1c3a2e] text-[#7fe3a8]"
                                                    : "bg-[#40252c] text-[#ff9da9]"
                                            }`}
                                        >
                                            {viewUser.status}
                                        </span>
                                    ) : (
                                        "-"
                                    )}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <strong className="text-[12px] text-[#7f8aa5] uppercase tracking-[0.4px]">Joining Date</strong>
                                <span className="text-[14px] text-[#eef1f8] font-medium break-words">
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
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5 box-border">

                    <div
                        className="w-[450px] max-w-full bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between p-[20px_22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-[18px] text-white">Delete User</h2>

                            <button
                                className="border-none bg-transparent text-[24px] leading-none text-[#8f9bb3] cursor-pointer w-8 h-8 rounded-md hover:bg-[#222942] hover:text-white flex items-center justify-center"
                                onClick={() => setDeleteUser(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[22px]">

                            <p className="m-0 text-[14px] text-[#dfe3ee] leading-[1.6]">
                                Are you sure you want to delete
                                <strong>
                                    {" "}
                                    {deleteUser.firstName || ""}{" "}
                                    {deleteUser.lastName || ""}
                                    <br />
                                    {deleteUser.employeeId || ""}
                                </strong>
                                ?
                            </p>

                            <p className="!mt-2.5 !text-[13px] !text-[#ff9da9]">
                                This action cannot be undone.
                            </p>

                            {deleteError && (
                                <p className="!mt-[15px] p-[10px_12px] bg-[#2a1820] border border-[#4a2530] rounded-md !text-[#ff8e9a] !text-[13px]">
                                    {deleteError}
                                </p>
                            )}

                        </div>

                        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">

                            <button
                                className="border-none py-[9px] px-4 rounded-[7px] text-[13px] font-semibold cursor-pointer bg-[#282e45] text-[#dfe3ee] hover:bg-[#343b55] transition-colors"
                                onClick={() => setDeleteUser(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="border-none py-[9px] px-4 rounded-[7px] text-[13px] font-semibold cursor-pointer bg-[#a83d4c] text-white hover:bg-[#c04b5b] transition-colors"
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