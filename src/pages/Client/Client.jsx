import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as clientService from "../../services/ClientService";
import * as companyService from "../../services/CompanyService";
import "./Client.css";

const PAGE_SIZE = 10;

const Clients = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        company: "",
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

    const fetchCompanies = async () => {
        try {
            const data = await companyService.getCompanies();

            setCompanies(data.companies || data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchCompanies();
    }, []);

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            const searchValue = filters.search.toLowerCase();

            const clientName = client.ClientName?.toLowerCase() || "";
            const email = client.email?.toLowerCase() || "";
            const phone = client.phone?.toLowerCase() || "";
            const company = client.company?.toLowerCase() || "";

            const matchesSearch =
                !filters.search ||
                clientName.includes(searchValue) ||
                email.includes(searchValue) ||
                phone.includes(searchValue) ||
                company.includes(searchValue);

            const matchesStatus =
                !filters.status ||
                client.status === filters.status;

            const matchesCompany =
                !filters.company ||
                client.company === filters.company;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCompany
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
        <div className="clients-page">

            <div className="clients-page-header">
                <div>
                    <h1>Clients</h1>
                    <p>
                        Manage your clients and their company information.
                    </p>
                </div>

                <button
                    className="clients-add-btn"
                    onClick={() => navigate("/clients/create")}
                >
                    + Add Client
                </button>
            </div>

            <div className="client-statistics">

                <div className="client-stat-card">
                    <span>Total Clients</span>
                    <strong>{totalClients}</strong>
                </div>

                <div className="client-stat-card">
                    <span>Active Clients</span>
                    <strong>{activeClients}</strong>
                </div>

                <div className="client-stat-card">
                    <span>Inactive Clients</span>
                    <strong>{inactiveClients}</strong>
                </div>

            </div>

            <div className="clients-filters">

                <input
                    type="text"
                    className="clients-search"
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
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                </select>

                <select
                    value={filters.company}
                    onChange={(e) =>
                        handleFiltersChange({
                            ...filters,
                            company: e.target.value,
                        })
                    }
                >
                    <option value="">All Companies</option>

                    {companies.map((company) => (
                        <option
                            key={company._id}
                            value={company.companyName}
                        >
                            {company.companyName}
                        </option>
                    ))}
                </select>

            </div>

            {loading && (
                <p className="clients-message">
                    Loading clients...
                </p>
            )}

            {error && (
                <p className="clients-error">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {paginatedClients.length === 0 ? (
                        <p className="clients-message">
                            No clients found.
                        </p>
                    ) : (
                        <div className="clients-table-container">
                            <table className="clients-table">

                                <thead>
                                    <tr>
                                        <th>Client ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Company</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedClients.map((client) => (
                                        <tr key={client._id}>

                                            <td>
                                                {client._id || "-"}
                                            </td>

                                            <td>
                                                {client.ClientName || "-"}
                                            </td>

                                            <td>
                                                {client.email || "-"}
                                            </td>

                                            <td>
                                                {client.phone || "-"}
                                            </td>

                                            <td>
                                                {client.company || "-"}
                                            </td>

                                            <td>
                                                {client.status || "-"}
                                            </td>

                                            <td>
                                                <div className="client-actions">

                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            setViewClient(client)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/clients/${client._id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
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
                        <div className="clients-pagination">

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

            {viewClient && (
                <div className="client-modal-overlay">
                    <div
                        className="client-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="client-modal-header">
                            <h2>Client Details</h2>

                            <button
                                className="client-modal-close"
                                onClick={() => setViewClient(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="client-modal-body">

                            <div className="client-detail-item">
                                <strong>Client ID</strong>
                                <span>
                                    {viewClient._id || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Name</strong>
                                <span>
                                    {viewClient.ClientName || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Email</strong>
                                <span>
                                    {viewClient.email || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Phone</strong>
                                <span>
                                    {viewClient.phone || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Company</strong>
                                <span>
                                    {viewClient.company || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Designation</strong>
                                <span>
                                    {viewClient.designation || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Address</strong>
                                <span>
                                    {viewClient.address || "-"}
                                </span>
                            </div>

                            <div className="client-detail-item">
                                <strong>Status</strong>
                                <span>
                                    {viewClient.status || "-"}
                                </span>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            {deleteClient && (
                <div className="client-delete-modal-overlay">
                    <div
                        className="client-delete-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="client-modal-header">
                            <h2>Delete Client</h2>

                            <button
                                className="client-modal-close"
                                onClick={() => setDeleteClient(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="client-delete-body">

                            <p>
                                Are you sure you want to delete
                                <strong>
                                    {" "}
                                    {deleteClient.ClientName || "this client"}
                                </strong>
                                ?
                            </p>

                            <p className="client-delete-warning">
                                This action cannot be undone.
                            </p>

                            {deleteError && (
                                <p className="client-delete-error">
                                    {deleteError}
                                </p>
                            )}

                        </div>

                        <div className="client-delete-actions">

                            <button
                                className="cancel-delete-btn"
                                onClick={() => setDeleteClient(null)}
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

export default Clients;