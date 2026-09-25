import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as clientService from "../../services/clientService";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const Clients = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        status: "",
    });

    const [page, setPage] = useState(1);
    const [viewClient, setViewClient] = useState(null);
    const [deleteClient, setDeleteClient] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const fetchClients = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await clientService.getClients();

            setClients(data.clients || data.client || data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not load clients."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            const searchValue = filters.search.toLowerCase();

            const clientIdValue = client.clientId?.toLowerCase() || "";
            const clientName = client.ClientName?.toLowerCase() || "";
            const email = client.email?.toLowerCase() || "";
            const phone = client.phone?.toLowerCase() || "";
            const company = client.company?.toLowerCase() || "";

            const matchesSearch =
                !filters.search ||
                clientIdValue.includes(searchValue) ||
                clientName.includes(searchValue) ||
                email.includes(searchValue) ||
                phone.includes(searchValue) ||
                company.includes(searchValue);

            const matchesStatus =
                !filters.status ||
                client.status === filters.status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [clients, filters]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredClients.length / PAGE_SIZE)
    );

    const paginatedClients = filteredClients.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const totalClients = clients.length;

    const activeClients = clients.filter(
        (client) => client.status?.toLowerCase() === "active"
    ).length;

    const inactiveClients = clients.filter(
        (client) => client.status?.toLowerCase() === "inactive"
    ).length;

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteClient) return;

        try {
            await clientService.deleteClient(deleteClient._id);

            setClients((prev) =>
                prev.filter(
                    (client) => client._id !== deleteClient._id
                )
            );

            setDeleteClient(null);
            setDeleteError("");

            if (viewClient?._id === deleteClient._id) {
                setViewClient(null);
            }
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                "Could not delete client."
            );
        }
    };

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">

            <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Clients</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                        Manage your clients and their company information.
                    </p>
                </div>

                <button
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#4752c4] transition-colors"
                    onClick={() => navigate("/clients/create")}
                >
                    + Add Client
                </button>
            </div>

            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[18px] mb-[25px]">

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Clients</span>
                    <strong className="text-white text-[26px] font-bold">{totalClients}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Active Clients</span>
                    <strong className="text-white text-[26px] font-bold">{activeClients}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Inactive Clients</span>
                    <strong className="text-white text-[26px] font-bold">{inactiveClients}</strong>
                </div>

            </div>

            <div className="flex items-center gap-3 mb-5 max-md:flex-col max-md:items-stretch">

                <input
                    type="text"
                    className="flex-1 h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                    placeholder="Search clients..."
                    value={filters.search}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            search: e.target.value,
                        })
                    }
                />

                <select
                    value={filters.status}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            status: e.target.value,
                        })
                    }
                    className="h-[42px] min-w-[150px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                </select>

            </div>

            {loading && <Loader />}

            {error && (
                <p className="text-[#ff8e9a]">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {paginatedClients.length === 0 ? (
                        <p className="text-[#8f9bb3]">
                            No clients found.
                        </p>
                    ) : (
                        <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                            <table className="w-full min-w-[900px] border-collapse">

                                <thead>
                                    <tr>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Client ID</th>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Name</th>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Email</th>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Phone</th>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Company</th>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Status</th>
                                        <th className="p-[15px] text-left !bg-transparent !text-[#8f9bb3] text-[12px] font-semibold uppercase tracking-[0.06em] !border-b !border-[#282e45] whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedClients.map((client) => (
                                        <tr key={client._id} className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0">

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                {client.clientId || "-"}
                                            </td>

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap capitalize">
                                                {client.ClientName || "-"}
                                            </td>

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                {client.email || "-"}
                                            </td>

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                {client.phone || "-"}
                                            </td>

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap capitalize">
                                                {client.company || "-"}
                                            </td>

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                {client.status ? (
                                                    <span
                                                        className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${
                                                            client.status.toLowerCase() === "active"
                                                                ? "bg-[#1c3a2e] text-[#7fe3a8]"
                                                                : client.status.toLowerCase() === "inactive"
                                                                ? "bg-[#40252c] text-[#ff9da9]"
                                                                : "bg-[#3d3520] text-[#f2c96d]"
                                                        }`}
                                                    >
                                                        {client.status}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="p-[15px] text-[#e8ebf5] text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-[7px]">

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer bg-[#222942] text-[#dbe1f2] hover:bg-[#303958] transition-colors"
                                                        onClick={() =>
                                                            setViewClient(client)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer bg-[#26354a] text-[#9fc5ff] hover:bg-[#30445f] transition-colors"
                                                        onClick={() =>
                                                            navigate(
                                                                `/clients/${client._id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer bg-[#40252c] text-[#ff9da9] hover:bg-[#563039] transition-colors"
                                                        onClick={() => {
                                                            setDeleteClient(client);
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

                    {filteredClients.length > 0 && (
                        <div className="flex items-center justify-center gap-[18px] mt-5">

                            <button
                                disabled={page === 1}
                                onClick={() =>
                                    setPage((p) => p - 1)
                                }
                                className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
                            >
                                Previous
                            </button>

                            <span className="text-[13px] font-medium !text-[#8f9bb3]">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                disabled={page === totalPages}
                                onClick={() =>
                                    setPage((p) => p + 1)
                                }
                                className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
                            >
                                Next
                            </button>

                        </div>
                    )}
                </>
            )}

            {viewClient && (
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">
                    <div
                        className="w-full max-w-[650px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">Client Details</h2>

                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer hover:bg-[#222942] hover:text-white flex items-center justify-center transition-colors leading-none"
                                onClick={() => setViewClient(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[1px] bg-[#282e45]">

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Client ID</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewClient.clientId || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Name</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.ClientName || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Email</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewClient.email || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Phone</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewClient.phone || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Company</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.company || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Designation</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.designation || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Address</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.address || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Country</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.country || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">City</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.city || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">State</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                                    {viewClient.state || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Pincode</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewClient.pincode || "-"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                <strong className="text-[#7f8aa5] text-[12px] font-semibold">Status</strong>
                                <span className="text-[#eef1f8] text-[14px] break-words">
                                    {viewClient.status ? (
                                        <span
                                            className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${
                                                viewClient.status.toLowerCase() === "active"
                                                    ? "bg-[#1c3a2e] text-[#7fe3a8]"
                                                    : viewClient.status.toLowerCase() === "inactive"
                                                    ? "bg-[#40252c] text-[#ff9da9]"
                                                    : "bg-[#3d3520] text-[#f2c96d]"
                                            }`}
                                        >
                                            {viewClient.status}
                                        </span>
                                    ) : (
                                        "-"
                                    )}
                                </span>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            {deleteClient && (
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">
                    <div
                        className="w-full max-w-[450px] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">Delete Client</h2>

                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer hover:bg-[#222942] hover:text-white flex items-center justify-center transition-colors leading-none"
                                onClick={() => setDeleteClient(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[22px]">

                            <p className="text-[#dfe3ee] text-[14px] leading-[1.6]">
                                Are you sure you want to delete
                                <strong className="text-white font-semibold">
                                    {" "}
                                    {deleteClient.ClientName || "this client"}
                                </strong>
                                ?
                            </p>

                            <p className="!text-[#ff9da9] text-[13px] !mt-2.5">
                                This action cannot be undone.
                            </p>

                            {deleteError && (
                                <p className="!text-[#ff8e9a] text-[13px] !mt-3">
                                    {deleteError}
                                </p>
                            )}

                        </div>

                        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">

                            <button
                                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#282e45] text-[#dfe3ee] hover:bg-[#343b55] transition-colors"
                                onClick={() => setDeleteClient(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#a83d4c] text-white hover:bg-[#c04b5b] transition-colors"
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

export default Clients;