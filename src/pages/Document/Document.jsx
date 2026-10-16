import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as documentService from "../../services/documentService";
import * as projectService from "../../services/projectService";
import Loader from "../../components/Loader";


const PAGE_SIZE = 10;



export const DOCUMENT_CATEGORIES = [
    "Specification",
    "Architecture",
    "Design",
    "Contract",
    "Report",
    "Meeting Notes",
    "User Manual",
    "Other",
];



export const DOCUMENT_TYPES = [
    "PDF",
    "DOCX",
    "XLSX",
    "PPTX",
    "FIGMA",
    "PNG",
    "JPG",
    "ZIP",
    "TXT",
    "OTHER",
];


const getFileTypeBadgeStyle = (fileType = "") => {
    const t = (fileType || "").toUpperCase();
    if (t === "PDF") return "bg-[#40252c] text-[#ff9da9] border border-[#5d303b]";
    if (t === "DOC" || t === "DOCX" || t === "WORD") return "bg-[#1f3554] text-[#9fc5ff] border border-[#2b4c7e]";
    if (t === "XLS" || t === "XLSX" || t === "EXCEL" || t === "CSV") return "bg-[#1c3a2e] text-[#7fe3a8] border border-[#265340]";
    if (t === "PNG" || t === "JPG" || t === "JPEG" || t === "SVG" || t === "WEBP") return "bg-[#3d2f1d] text-[#f5b358] border border-[#5a4325]";
    if (t === "ZIP" || t === "RAR" || t === "7Z" || t === "TAR") return "bg-[#382b4a] text-[#c084fc] border border-[#4e346e]";
    return "bg-[#252a42] text-[#cbd2e3] border border-[#353d5e]";
};

const getCategoryBadgeStyle = (category = "") => {
    const c = (category || "").toLowerCase();
    if (c === "specification") return "bg-[#1f3554] text-[#9fc5ff] border border-[#2b4c7e]";
    if (c === "architecture") return "bg-[#382b4a] text-[#c084fc] border border-[#4e346e]";
    if (c === "design") return "bg-[#3d2f1d] text-[#f5b358] border border-[#5a4325]";
    if (c === "contract") return "bg-[#1c3a2e] text-[#7fe3a8] border border-[#265340]";
    if (c === "report") return "bg-[#252a42] text-[#cbd2e3] border border-[#353d5e]";
    return "bg-[#222942] text-[#9fc5ff] border border-[#30364d]";
};

const getProjectName = (proj) => {
    if (!proj) return "-";
    if (typeof proj === "string") return proj;
    return proj.projectName || proj.name || "-";
};


const getUserName = (user) => {
    if (!user) return "-";
    if (typeof user === "string") return user;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || user.name || user.email || "User";
};

const formatDate = (dateVal) => {
    if (!dateVal) return "-";
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "-";
    }
};



const selectBaseClass =
    "h-10 px-3 border border-[#30364d] rounded-lg bg-[#0f1322] text-white text-[13px] outline-none transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20";

const inputBaseClass =
    "w-full h-10 pl-9 pr-3 border border-[#30364d] rounded-lg bg-[#0f1322] text-white text-[13px] outline-none transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";

const Document = () => {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        project: "",
        category: "",
        fileType: "",
    });

    const [page, setPage] = useState(1);

    // Modals
    const [viewDoc, setViewDoc] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const fetchAllData = async () => {
        setLoading(true);
        setError("");

        try {
            const [docsRes, projsRes] = await Promise.all([
                documentService.getDocuments(),
                projectService.getProjects().catch(() => ({ projects: [] })),
            ]);

            const docList = Array.isArray(docsRes?.documents)
                ? docsRes.documents
                : Array.isArray(docsRes)
                ? docsRes
                : [];

            const projList = Array.isArray(projsRes?.projects)
                ? projsRes.projects
                : Array.isArray(projsRes)
                ? projsRes
                : [];

            setDocuments(docList);
            setProjects(projList);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load documents."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleClearFilters = () => {
        setFilters({
            search: "",
            project: "",
            category: "",
            fileType: "",
        });
        setPage(1);
    };

    // Filtered documents
    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            const searchVal = filters.search.toLowerCase().trim();
            const idVal = (doc.documentId || "").toLowerCase();
            const nameVal = (doc.documentName || "").toLowerCase();
            const descVal = (doc.description || "").toLowerCase();
            const projName = (
                doc.project?.projectName ||
                doc.project?.name ||
                (typeof doc.project === "string" ? doc.project : "")
            ).toLowerCase();
            const catVal = (doc.category || "").toLowerCase();
            const typeVal = (doc.fileType || "").toLowerCase();
            const userVal = (
                doc.uploadedBy
                    ? `${doc.uploadedBy.firstName || ""} ${doc.uploadedBy.lastName || ""}`
                    : doc.createdBy
                    ? `${doc.createdBy.firstName || ""} ${doc.createdBy.lastName || ""}`
                    : ""
            ).toLowerCase();

            const matchesSearch =
                !searchVal ||
                idVal.includes(searchVal) ||
                nameVal.includes(searchVal) ||
                descVal.includes(searchVal) ||
                projName.includes(searchVal) ||
                catVal.includes(searchVal) ||
                typeVal.includes(searchVal) ||
                userVal.includes(searchVal);

            const matchesProject =
                !filters.project ||
                doc.project?._id === filters.project ||
                doc.project === filters.project;

            const matchesCategory =
                !filters.category ||
                (doc.category || "").toLowerCase() === filters.category.toLowerCase();

            const matchesFileType =
                !filters.fileType ||
                (doc.fileType || "").toUpperCase() === filters.fileType.toUpperCase();

            return matchesSearch && matchesProject && matchesCategory && matchesFileType;
        });
    }, [documents, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredDocuments.length / PAGE_SIZE) || 1;
    const paginatedDocuments = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredDocuments.slice(start, start + PAGE_SIZE);
    }, [filteredDocuments, page]);

    // Statistics counts
    const stats = useMemo(() => {
        const total = documents.length;
        const specs = documents.filter((d) => (d.category || "").toLowerCase() === "specification").length;
        const arch = documents.filter((d) => (d.category || "").toLowerCase().includes("design") || (d.category || "").toLowerCase().includes("architecture")).length;
        const others = total - specs - arch;
        return { total, specs, arch, others: Math.max(0, others) };
    }, [documents]);

    const handleDownload = (doc) => {
        documentService.downloadDocument(doc);
    };

    const handleEdit = (doc) => {
        const targetId = doc._id || doc.documentId;
        navigate(`/documents/${targetId}/edit`);
    };

    const handleDeletePrompt = (doc) => {
        setDeleteTarget(doc);
        setDeleteError("");
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setDeleteError("");

        try {
            const targetId = deleteTarget._id || deleteTarget.documentId;
            await documentService.deleteDocument(targetId);

            setDocuments((prev) => prev.filter((d) => d._id !== deleteTarget._id));
            setSuccess(`Document "${deleteTarget.documentName}" was deleted.`);
            setDeleteTarget(null);

            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setDeleteError(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete document."
            );
        } finally {
            setDeleting(false);
        }
    };

    const hasActiveFilters = Boolean(
        filters.search || filters.project || filters.category || filters.fileType
    );

    return (
        <div className="p-7 max-sm:p-4 text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-[24px] font-semibold text-[#e8ebf5] tracking-tight">
                        Documents
                    </h1>
                    <p className="text-[13px] text-[#8f9ab5] mt-1">
                        Manage project documentation, technical specifications, and resources.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/documents/create")}
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                >
                    + Upload Document
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4 mb-6">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Total Documents
                    </span>
                    <span className="text-[26px] font-bold text-white tracking-tight">
                        {stats.total}
                    </span>
                </div>
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Specifications
                    </span>
                    <span className="text-[26px] font-bold text-[#5969a8] tracking-tight">
                        {stats.specs}
                    </span>
                </div>
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Architecture & Design
                    </span>
                    <span className="text-[26px] font-bold text-[#a78bfa] tracking-tight">
                        {stats.arch}
                    </span>    
                </div>
                <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-5">
                    <span className="text-[12px] font-medium text-[#8f9ab5] uppercase tracking-wider block mb-1">
                        Reports & Other
                    </span>
                    <span className="text-[26px] font-bold text-[#34d399] tracking-tight">
                        {stats.others}
                    </span>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-[#2e151b] border border-[#ff8e9a]/30 text-[#ff8e9a] text-[13px] flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-[#ff8e9a] hover:text-white font-bold ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded-lg bg-[#132a21] border border-[#22c55e]/30 text-[#22c55e] text-[13px] flex items-center justify-between">
                    <span>{success}</span>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        className="text-[#22c55e] hover:text-white font-bold ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[240px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7f8aa5] pointer-events-none">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, search: e.target.value }));
                                setPage(1);
                            }}
                            placeholder="Search by ID, name, project, category, uploader..."
                            className={inputBaseClass}
                        />
                    </div>

                    {/* Project */}
                    <div className="w-[180px] max-sm:w-full">
                        <select
                            value={filters.project}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, project: e.target.value }));
                                setPage(1);
                            }}
                            className={`${selectBaseClass} w-full`}
                        >
                            <option value="">All Projects</option>
                            {projects.map((p) => {
                                const id = p._id || p.id;
                                const name = p.projectName || p.name || id;
                                return (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="w-[160px] max-sm:w-full">
                        <select
                            value={filters.category}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, category: e.target.value }));
                                setPage(1);
                            }}
                            className={`${selectBaseClass} w-full`}
                        >
                            <option value="">All Categories</option>
                            {DOCUMENT_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Format */}
                    <div className="w-[140px] max-sm:w-full">
                        <select
                            value={filters.fileType}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, fileType: e.target.value }));
                                setPage(1);
                            }}
                            className={`${selectBaseClass} w-full`}
                        >
                            <option value="">All Formats</option>
                            {DOCUMENT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="h-10 px-3.5 border border-[#30364d] rounded-lg bg-[#222942] hover:bg-[#2b3454] text-[#cbd2e3] hover:text-white text-[13px] font-medium transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Content Table / Empty State */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px] bg-[#171b2e] border border-[#282e45] rounded-xl">
                    <Loader />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="p-12 text-center bg-[#171b2e] border border-[#282e45] rounded-xl">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#202742] flex items-center justify-center text-[#9fc5ff]">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#e8ebf5] mb-1">
                        No documents found
                    </h3>
                    <p className="text-[13px] text-[#8f9ab5] max-w-sm mx-auto mb-5">
                        {documents.length === 0
                            ? "No documents have been uploaded yet. Upload your first document to get started."
                            : "No documents match the current filter criteria."}
                    </p>
                    {documents.length === 0 ? (
                        <button
                            type="button"
                            onClick={() => navigate("/documents/create")}
                            className="inline-flex items-center gap-2 h-9 px-4 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-[13px] font-medium transition-colors"
                        >
                            Upload Document
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 h-9 px-4 bg-[#222942] hover:bg-[#2b3454] border border-[#30364d] text-[#cbd2e3] rounded-lg text-[13px] font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
                        <table className="w-full min-w-[950px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Document ID
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Document Name
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Project
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Category
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Format
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Version
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Uploaded By
                                    </th>
                                    <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedDocuments.map((doc) => {
                                    const categoryStyle = getCategoryBadgeStyle(doc.category);
                                    const displayVersion = doc.version ? (doc.version.startsWith("v") ? doc.version : `v${doc.version}`) : "v1.0";
                                    const formatBadgeStyle = getFileTypeBadgeStyle(doc.fileType);

                                    return (
                                        <tr
                                            key={doc._id}
                                            className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0"
                                        >
                                            {/* Document ID */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                {doc.documentId || "-"}
                                            </td>

                                            {/* Document Name */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] max-w-[260px]">
                                                <span className="block text-white text-[14px] font-semibold truncate">
                                                    {doc.documentName}
                                                </span>
                                                {doc.fileSize && (
                                                    <small className="block text-[#7f8aa5] text-[12px] truncate mt-0.5">
                                                        Size: {doc.fileSize}
                                                    </small>
                                                )}
                                            </td>

                                            {/* Project */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-[3px] px-2 bg-[#222942] border border-[#30364d] rounded-[5px] text-[#9fc5ff] text-[12px] font-medium capitalize">
                                                    {getProjectName(doc.project)}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-block py-1 px-2.5 rounded-[5px] text-[12px] font-medium capitalize ${categoryStyle}`}>
                                                    {doc.category || "General"}
                                                </span>
                                            </td>

                                            {/* Format */}
                                            <td className="border-none p-[15px] text-left text-[13px] border-b border-[#282e45] whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-[5px] text-[11px] font-semibold tracking-wide uppercase ${formatBadgeStyle}`}>
                                                    <span>📄</span>
                                                    <span>{doc.fileType || "DOC"}</span>
                                                </span>
                                            </td>

                                            {/* Version */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <span className="inline-block py-0.5 px-2 bg-[#20253a] border border-[#30364d] rounded text-[#cbd2e3] text-[12px] font-mono">
                                                    {displayVersion}
                                                </span>
                                            </td>

                                            {/* Uploaded By */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-6 h-6 rounded-full bg-[#202742] text-[#9fc5ff] flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {getUserName(doc.uploadedBy || doc.createdBy).charAt(0)}
                                                    </span>
                                                    <span className="text-[#cbd2e3] text-[13px]">
                                                        {getUserName(doc.uploadedBy || doc.createdBy)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                                                <div className="flex items-center gap-[7px]">
                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                        onClick={() => setViewDoc(doc)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                        onClick={() => navigate(`/documents/${doc._id || doc.documentId}/edit`)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] font-medium hover:bg-[#522d36]"
                                                        onClick={() => handleDeletePrompt(doc)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between flex-wrap gap-4 mt-5 px-1">
                            <span className="text-[13px] text-[#8f9ab5]">
                                Showing{" "}
                                <span className="font-medium text-white">
                                    {(page - 1) * PAGE_SIZE + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-white">
                                    {Math.min(page * PAGE_SIZE, filteredDocuments.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-white">
                                    {filteredDocuments.length}
                                </span>{" "}
                                documents
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-8 px-3 rounded-md border border-[#30364d] bg-[#171b2e] hover:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[12px] text-[#cbd2e3] font-medium transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-[12px] text-[#8f9ab5] px-2 font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="h-8 px-3 rounded-md border border-[#30364d] bg-[#171b2e] hover:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[12px] text-[#cbd2e3] font-medium transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Document Details Modal */}
            {viewDoc && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5 box-border"
                >
                    <div
                        className="bg-[#171b2e] border border-[#282e45] rounded-xl max-w-[650px] w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#282e45]">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[12px] font-mono font-bold text-[#9fc5ff] bg-[#202742] px-2 py-0.5 rounded">
                                        {viewDoc.documentId || "DOC-NEW"}
                                    </span>
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${getCategoryBadgeStyle(viewDoc.category)}`}>
                                        {viewDoc.category || "Specification"}
                                    </span>
                                    <span className="text-[11px] font-mono text-[#cbd2e3] bg-[#222942] px-2 py-0.5 rounded">
                                        {viewDoc.version || "v1.0"}
                                    </span>
                                </div>
                                <h2 className="text-[20px] font-bold text-[#e8ebf5] leading-snug">
                                    {viewDoc.documentName}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewDoc(null)}
                                className="text-[#8f9ab5] hover:text-white transition-colors p-1 rounded hover:bg-[#20253d]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 py-5 border-b border-[#282e45] text-[13px]">
                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Project</span>
                                <span className="font-semibold text-white">
                                    {getProjectName(viewDoc.project)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">File Format</span>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-[5px] text-[11px] font-semibold tracking-wide uppercase ${getFileTypeBadgeStyle(viewDoc.fileType)}`}>
                                        <span>📄</span>
                                        <span>{viewDoc.fileType || "DOC"}</span>
                                    </span>
                                    {viewDoc.fileSize && (
                                        <span className="text-[#cbd2e3] font-mono text-[12px]">
                                            ({viewDoc.fileSize})
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Uploaded By</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {getUserName(viewDoc.uploadedBy || viewDoc.createdBy)}
                                </span>
                            </div>

                            <div>
                                <span className="text-[#8f9ab5] block mb-1">Uploaded At</span>
                                <span className="font-medium text-[#cbd2e3]">
                                    {formatDate(viewDoc.createdAt)}
                                </span>
                            </div>
                        </div>

                        {viewDoc.description && (
                            <div className="py-4 border-b border-[#282e45]">
                                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#8f9ab5] block mb-2">
                                    Description & Notes
                                </span>
                                <p className="text-[13px] text-[#cbd2e3] whitespace-pre-wrap leading-relaxed bg-[#0f1322] p-3.5 rounded-lg border border-[#282e45]">
                                    {viewDoc.description}
                                </p>
                            </div>
                        )}

                        <div className="py-4 border-b border-[#282e45]">
                            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#8f9ab5] block mb-2">
                                Resource Location
                            </span>
                            <div className="flex items-center justify-between gap-3 p-3 bg-[#0f1322] rounded-lg border border-[#282e45]">
                                <span className="text-[13px] font-mono text-[#9fc5ff] truncate select-all">
                                    {viewDoc.fileUrl || "No file link recorded"}
                                </span>
                                {viewDoc.fileUrl && (
                                    <a
                                        href={viewDoc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[12px] text-[#5969a8] hover:text-[#9fc5ff] font-medium whitespace-nowrap"
                                    >
                                        Open ↗
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    const doc = viewDoc;
                                    setViewDoc(null);
                                    handleEdit(doc);
                                }}
                                className="h-10 px-4 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 text-[#f5b358]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Document
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setViewDoc(null)}
                                    className="h-10 px-4 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors"
                                >
                                    Close
                                </button>

                                {viewDoc.fileUrl && (
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(viewDoc)}
                                        className="h-10 px-5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-[13px] font-medium transition-colors shadow-md flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1100] p-5"
                >
                    <div
                        className="bg-[#171b2e] border border-[#282e45] rounded-xl max-w-[460px] w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#3d1822] text-[#ff8e9a] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[17px] font-semibold text-white">
                                    Delete Document
                                </h3>
                                <p className="text-[12px] text-[#8f9ab5]">
                                    Document ID: {deleteTarget.documentId || "-"}
                                </p>
                            </div>
                        </div>

                        <p className="text-[13px] text-[#cbd2e3] leading-relaxed mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-white">"{deleteTarget.documentName}"</span>?
                            This action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-[#2e151b] border border-[#ff8e9a]/30 text-[#ff8e9a] text-[12px] rounded-lg">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                                className="h-9 px-4 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                                className="h-9 px-4 rounded-lg bg-[#e11d48] hover:bg-[#be123c] text-white text-[13px] font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Document"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Document;
