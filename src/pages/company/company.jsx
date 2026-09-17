import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as companyService from "../../services/companyService";
import "./Company.css";

const PAGE_SIZE = 10;

const Companies = () => {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
          
    
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [viewCompany, setViewCompany] = useState(null);
    const [deleteCompanyTarget, setDeleteCompanyTarget] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const fetchCompanies = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await companyService.getCompanies();
            setCompanies(data.companies || data || []);
        } catch (err) {
            const message =
                err.response?.data?.message || "Could not load companies.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const filteredCompanies = useMemo(() => {
        const term = search.toLowerCase();

        return companies.filter((c) => {
            return (
                !term ||
                c.companyName?.toLowerCase().includes(term) ||
                c.companyCode?.toLowerCase().includes(term) ||
                c.officialEmail?.toLowerCase().includes(term)
            );
        });
    }, [companies, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCompanies.length / PAGE_SIZE)
    );

    const paginatedCompanies = filteredCompanies.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteCompanyTarget) return;

        try {
            await companyService.deleteCompany(deleteCompanyTarget._id);

            setCompanies((prev) =>
                prev.filter((c) => c._id !== deleteCompanyTarget._id)
            );

            if (viewCompany?._id === deleteCompanyTarget._id) {
                setViewCompany(null);
            }

            setDeleteCompanyTarget(null);
            setDeleteError("");
        } catch (err) {
            setDeleteError(
                err.response?.data?.message || "Could not delete company."
            );
        }
    };

    return (
        <div className="companies-page">
            <div className="companies-top">
                <h1>Companies</h1>

                <button
                    className="companies-add-btn"
                    onClick={() => navigate("/companies/create")}
                >
                    + Add Company
                </button>
            </div>

            <div className="companies-filters">
                <input
                    type="text"
                    placeholder="Search by name, code, or email..."
                    value={search}
                    onChange={handleSearchChange}
                    className="companies-search"
                />
            </div>

            {loading && <p>Loading companies...</p>}

            {error && <p className="companies-error">{error}</p>}

            {!loading && !error && (
                <>
                    {paginatedCompanies.length === 0 ? (
                        <p>No companies found.</p>
                    ) : (
                        <div className="companies-table-container">
                            <table className="companies-table">
                                <thead>
                                    <tr>
                                        <th>CompanyId</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Industry</th>
                                        <th>Email</th>
                                        <th>City</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedCompanies.map((c) => (
                                        <tr key={c._id}>
                                            <td>{c.companyId|| "-"}</td>

                                            <td>{c.companyName || "-"}</td>

                                            <td>{c.companyType || "-"}</td>

                                            <td>{c.industry || "-"}</td>

                                            <td>{c.officialEmail || "-"}</td>

                                            <td>{c.city || "-"}</td>

                                            <td>
                                                <span
                                                    className={`company-status ${
                                                        c.status === "active"
                                                            ? "status-active"
                                                            : c.status === "inactive"
                                                            ? "status-inactive"
                                                            : "status-leave"
                                                    }`}
                                                >
                                                    {c.status || "-"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="company-actions">
                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            setViewCompany(c)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/companies/edit/${c._id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => {
                                                            setDeleteCompanyTarget(
                                                                c
                                                            );
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

                    {filteredCompanies.length > 0 && (
                        <div className="companies-pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>

                            <span>
                                Page {page} of {totalPages}
                            </span>

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {viewCompany && (
                <div className="company-modal-overlay">
                    <div
                        className="company-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="company-modal-header">
                            <h2>Company Details</h2>

                            <button
                                className="company-modal-close"
                                onClick={() => setViewCompany(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="company-modal-body">
                            <div className="company-detail-item">
                                <strong>Company Code</strong>
                                <span>
                                    {viewCompany.companyCode || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Company Name</strong>
                                <span>
                                    {viewCompany.companyName || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Type</strong>
                                <span>
                                    {viewCompany.companyType || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Industry</strong>
                                <span>
                                    {viewCompany.industry || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Official Email</strong>
                                <span>
                                    {viewCompany.officialEmail || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Contact Number</strong>
                                <span>
                                    {viewCompany.contactNumber || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Website</strong>
                                <span>
                                    {viewCompany.website || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Address</strong>
                                <span>
                                    {viewCompany.addressLine1 || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>City</strong>
                                <span>{viewCompany.city || "-"}</span>
                            </div>

                            <div className="company-detail-item">
                                <strong>State</strong>
                                <span>{viewCompany.state || "-"}</span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Country</strong>
                                <span>{viewCompany.country || "-"}</span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Pincode</strong>
                                <span>{viewCompany.pincode || "-"}</span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Time Zone</strong>
                                <span>{viewCompany.timeZone || "-"}</span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Currency</strong>
                                <span>{viewCompany.currency || "-"}</span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Working Days</strong>
                                <span>
                                    {Array.isArray(viewCompany.workingDays)
                                        ? viewCompany.workingDays.join(", ")
                                        : viewCompany.workingDays || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Office Hours</strong>
                                <span>
                                    {viewCompany.officeStartTime || "-"} to{" "}
                                    {viewCompany.officeEndTime || "-"}
                                </span>
                            </div>

                            <div className="company-detail-item">
                                <strong>Status</strong>
                                <span>
                                    {viewCompany.status || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteCompanyTarget && (
                <div className="delete-modal-overlay">
                    <div
                        className="delete-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="delete-modal-header">
                            <h2>Delete Company</h2>

                            <button
                                className="delete-modal-close"
                                onClick={() =>
                                    setDeleteCompanyTarget(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="delete-modal-body">
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>
                                    {deleteCompanyTarget.companyName}
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
                                onClick={() =>
                                    setDeleteCompanyTarget(null)
                                }
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

export default Companies;