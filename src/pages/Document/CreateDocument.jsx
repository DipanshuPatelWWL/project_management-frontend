import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as documentService from "../../services/documentService";
import * as projectService from "../../services/projectService";
import Loader from "../../components/Loader";

const inputBaseClass =
    "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";

const textareaBaseClass =
    "w-full p-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5] resize-y min-h-[90px]";

const readonlyClass = "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";

const getInputClass = (hasError, isReadonly = false) => {
    let cls = inputBaseClass;
    if (isReadonly) cls += ` ${readonlyClass}`;
    if (hasError) cls += " field-error !border-[#ff8e9a] focus:!ring-[#ff8e9a]/20";
    return cls;
};

const getTextareaClass = (hasError) => {
    let cls = textareaBaseClass;
    if (hasError) cls += " field-error !border-[#ff8e9a] focus:!ring-[#ff8e9a]/20";
    return cls;
};

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

const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const initialDocState = {
    documentId: "",
    documentName: "",
    project: "",
    category: "Specification",
    version: "v1.0",
    fileType: "PDF",
    fileSize: "",
    fileUrl: "",
    description: "",
};

const CreateDocument = () => {
    const navigate = useNavigate();
    const { documentId } = useParams();

    const isEditMode = Boolean(documentId);

    const [formData, setFormData] = useState(initialDocState);
    const [projects, setProjects] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setPageLoading(true);

                if (isEditMode) {
                    const [projRes, docRes] = await Promise.all([
                        projectService.getProjects().catch(() => ({ projects: [] })),
                        documentService.getDocumentById(documentId),
                    ]);

                    if (!isMounted) return;

                    const projectList = Array.isArray(projRes?.projects)
                        ? projRes.projects
                        : Array.isArray(projRes)
                        ? projRes
                        : [];
                    setProjects(projectList);

                    const doc = docRes?.document || docRes;
                    if (!doc) {
                        setError("Document not found.");
                        return;
                    }

                    setFormData({
                        documentId: doc.documentId || "",
                        documentName: doc.documentName || "",
                        project: doc.project?._id || (typeof doc.project === "string" ? doc.project : ""),
                        category: doc.category || "Specification",
                        version: doc.version || "v1.0",
                        fileType: doc.fileType || "PDF",
                        fileSize: doc.fileSize || "",
                        fileUrl: doc.fileUrl || "",
                        description: doc.description || "",
                    });
                } else {
                    const [projRes, nextIdRes] = await Promise.all([
                        projectService.getProjects().catch(() => ({ projects: [] })),
                        documentService.getNextDocumentId().catch(() => ({ nextDocumentId: "DOC001" })),
                    ]);

                    if (!isMounted) return;

                    const projectList = Array.isArray(projRes?.projects)
                        ? projRes.projects
                        : Array.isArray(projRes)
                        ? projRes
                        : [];
                    setProjects(projectList);

                    const nextId = nextIdRes?.nextDocumentId || "DOC001";
                    setFormData((prev) => ({
                        ...prev,
                        documentId: nextId,
                    }));
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load document information."
                    );
                }
            } finally {
                if (isMounted) setPageLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [documentId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleLocalFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const ext = file.name.split(".").pop()?.toUpperCase() || "";

        setFormData((prev) => ({
            ...prev,
            documentName: prev.documentName || nameWithoutExt,
            fileType: ext || prev.fileType || "PDF",
            fileSize: formatBytes(file.size),
            fileUrl: prev.fileUrl || file.name,
        }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.documentName?.trim()) {
            errors.documentName = "Document Name is required.";
        }
        if (!formData.project) {
            errors.project = "Please select a Project.";
        }
        if (!formData.fileUrl?.trim()) {
            errors.fileUrl = "Please provide a file URL or browse a file.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validate()) {
            setError("Please fill in all required fields correctly.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                documentId: formData.documentId,
                documentName: formData.documentName.trim(),
                project: formData.project,
                category: formData.category,
                version: formData.version || "v1.0",
                fileType: formData.fileType || "PDF",
                fileSize: formData.fileSize || "0 B",
                fileUrl: formData.fileUrl.trim(),
                description: formData.description || "",
            };

            if (isEditMode) {
                await documentService.updateDocument(documentId, payload);
                setSuccess("Document updated successfully!");
            } else {
                await documentService.createDocument(payload);
                setSuccess("Document uploaded successfully!");
            }

            setTimeout(() => {
                navigate("/documents");
            }, 800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                (isEditMode ? "Failed to update document." : "Failed to upload document.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="max-w-[1020px] mx-auto p-6 max-sm:p-4 text-white">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/documents")}
                    className="flex items-center gap-2 text-[13px] text-[#8f9ab5] hover:text-[#5969a8] transition-colors w-fit group"
                >
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    Back to Documents
                </button>
                <h1 className="text-[24px] font-semibold text-[#e8ebf5] tracking-tight">
                    {isEditMode ? "Edit Document" : "Upload Document"}
                </h1>
                <p className="text-[13px] text-[#8f9ab5]">
                    {isEditMode
                        ? `Editing ${formData.documentName || formData.documentId}`
                        : "Upload project specifications, designs, contracts, or technical documentation."}
                </p>
            </div>

            {/* Error / Success Notifications */}
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
                </div>
            )}

            {/* Form Card */}
            <div className="bg-[#171b2e] border border-[#282e45] rounded-xl shadow-xl overflow-hidden">
                <form className="p-7 max-sm:p-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                        {/* Document ID */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="documentId" className="text-[13px] font-medium text-[#cbd2e3]">
                                Document ID
                            </label>
                            <input
                                id="documentId"
                                name="documentId"
                                value={formData.documentId || ""}
                                readOnly
                                className={getInputClass(false, true)}
                            />
                        </div>

                        {/* Document Name */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="documentName" className="text-[13px] font-medium text-[#cbd2e3]">
                                Document Name <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="documentName"
                                name="documentName"
                                type="text"
                                className={getInputClass(fieldErrors.documentName)}
                                value={formData.documentName || ""}
                                onChange={handleChange}
                                placeholder="e.g. Architecture Technical Blueprint"
                            />
                            {fieldErrors.documentName && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.documentName}</span>
                            )}
                        </div>

                        {/* Project */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="project" className="text-[13px] font-medium text-[#cbd2e3]">
                                Project <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <select
                                id="project"
                                name="project"
                                className={getInputClass(fieldErrors.project)}
                                value={formData.project || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Project</option>
                                {projects.map((proj) => {
                                    const id = proj._id || proj.id;
                                    const name = proj.projectName || proj.name || id;
                                    return (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </select>
                            {fieldErrors.project && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.project}</span>
                            )}
                        </div>

                        {/* Category */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="category" className="text-[13px] font-medium text-[#cbd2e3]">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                className={getInputClass(false)}
                                value={formData.category || "Specification"}
                                onChange={handleChange}
                            >
                                {DOCUMENT_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* File Format / Type */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="fileType" className="text-[13px] font-medium text-[#cbd2e3]">
                                File Format
                            </label>
                            <select
                                id="fileType"
                                name="fileType"
                                className={getInputClass(false)}
                                value={formData.fileType || "PDF"}
                                onChange={handleChange}
                            >
                                {DOCUMENT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Version */}
                        <div className="flex flex-col min-w-0 gap-2">
                            <label htmlFor="version" className="text-[13px] font-medium text-[#cbd2e3]">
                                Document Version
                            </label>
                            <input
                                id="version"
                                name="version"
                                type="text"
                                className={getInputClass(false)}
                                value={formData.version || "v1.0"}
                                onChange={handleChange}
                                placeholder="e.g. v1.0, v2.1"
                            />
                        </div>

                        {/* Local File Picker */}
                        <div className="col-span-2 max-md:col-span-1 flex flex-col gap-2">
                            <label className="text-[13px] font-medium text-[#cbd2e3]">
                                Select File (Auto-detects format & size)
                            </label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center justify-center gap-2 h-11 px-4 rounded-[7px] border border-dashed border-[#4a5475] hover:border-[#5969a8] bg-[#121626] text-[13px] text-[#cbd2e3] cursor-pointer transition-colors">
                                    <svg className="w-4 h-4 text-[#9fc5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>Browse Computer</span>
                                    <input
                                        type="file"
                                        onChange={handleLocalFileSelect}
                                        className="hidden"
                                    />
                                </label>
                                {formData.fileSize && (
                                    <span className="text-[12px] text-[#7f8aa5] bg-[#0f1322] px-3 py-1.5 rounded border border-[#282e45]">
                                        Detected size: <strong className="text-white font-mono">{formData.fileSize}</strong>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* File URL */}
                        <div className="col-span-2 max-md:col-span-1 flex flex-col gap-2">
                            <label htmlFor="fileUrl" className="text-[13px] font-medium text-[#cbd2e3]">
                                File Resource Link or Stored Path <span className="text-[#ff9da9] ml-0.5">*</span>
                            </label>
                            <input
                                id="fileUrl"
                                name="fileUrl"
                                type="text"
                                className={getInputClass(fieldErrors.fileUrl)}
                                value={formData.fileUrl || ""}
                                onChange={handleChange}
                                placeholder="https://drive.google.com/... or architecture-doc-v1.pdf"
                            />
                            {fieldErrors.fileUrl && (
                                <span className="text-[12px] text-[#ff8e9a]">{fieldErrors.fileUrl}</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="col-span-2 max-md:col-span-1 flex flex-col gap-2">
                            <label htmlFor="description" className="text-[13px] font-medium text-[#cbd2e3]">
                                Document Description / Scope
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className={getTextareaClass(false)}
                                value={formData.description || ""}
                                onChange={handleChange}
                                placeholder="Brief summary of document purpose, guidelines, or revision notes..."
                            />
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-[#282e45]">
                        <button
                            type="button"
                            onClick={() => navigate("/documents")}
                            className="h-11 px-6 rounded-lg border border-[#30364d] bg-[#1a1f33] hover:bg-[#232942] text-[13px] font-medium text-[#cbd2e3] transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-11 px-7 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-[13px] font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{isEditMode ? "Updating..." : "Uploading..."}</span>
                                </>
                            ) : (
                                <span>{isEditMode ? "Save Changes" : "Upload Document"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDocument;
