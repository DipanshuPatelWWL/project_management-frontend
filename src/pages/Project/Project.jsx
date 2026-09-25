import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    getProjects,
    deleteProject,
} from "../../services/projectService";
import Loader from "../../components/Loader";


const Project = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const [viewProject, setViewProject] = useState(null);

    // Popup delete confirmation state (replaces window.confirm)
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getProjects();

            setProjects(data.projects || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to fetch projects"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await deleteProject(deleteTarget._id);

            setProjects((prev) =>
                prev.filter(
                    (project) => project._id !== deleteTarget._id
                )
            );

            if (viewProject?._id === deleteTarget._id) {
                setViewProject(null);
            }

            setDeleteTarget(null);
        } catch (error) {
            setDeleteError(
                error.response?.data?.message ||
                "Failed to delete project"
            );
        } finally {
            setDeleting(false);
        }
    };

    const getUserName = (user) => {
        if (!user) return "-";

        if (typeof user === "string") {
            return user;
        }

        return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "-";
    };

    const getCompanyName = (company) => {
        if (!company) return "-";

        if (typeof company === "string") {
            return company;
        }

        return company.companyName || company.name || "-";
    };

    // FIX: was checking client.clientName (lowercase) which never
    // exists - the actual field is ClientName (capital C).
    const getClientName = (client) => {
        if (!client) return "-";

        if (typeof client === "string") {
            return client;
        }

        return client.ClientName || client.name || "-";
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString();
    };

    const getProjectStatusBadgeClass = (status = "") => {
        const s = status.toLowerCase().replace(/\s+/g, "-");
        if (s === "active" || s === "completed" || s === "in-progress") {
            return "bg-[#1c3a2e] text-[#7fe3a8]";
        }
        if (s === "planning" || s === "on-hold") {
            return "bg-[#3d3520] text-[#f2c96d]";
        }
        return "bg-[#40252c] text-[#ff9da9]";
    };

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const query = search.trim().toLowerCase();
            const projectName = (project.projectName || "").toLowerCase();
            const projectId = (project.projectId || "").toLowerCase();
            const companyName = getCompanyName(project.company).toLowerCase();
            const clientName = getClientName(project.client).toLowerCase();
            const managerName = getUserName(project.projectManager).toLowerCase();

            const matchesSearch =
                !query ||
                projectName.includes(query) ||
                projectId.includes(query) ||
                companyName.includes(query) ||
                clientName.includes(query) ||
                managerName.includes(query);

            const projectStatus = (project.status || "").toLowerCase();
            const matchesStatus =
                !statusFilter ||
                projectStatus === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [projects, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));

    const paginatedProjects = filteredProjects.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    if (loading) {
        return (
            <div className="w-full p-[30px] max-md:p-5 box-border">
                <Loader />
            </div>
        );
    }

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">

            <div className="flex justify-between items-center mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">

                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Projects</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">Manage your projects</p>
                </div>

                <button
                    className="border-none rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#4752c4]"
                    onClick={() =>
                        navigate("/project/create")
                    }
                >
                    + Create Project
                </button>

            </div>

            {error && (
                <div className="text-[#ff8e9a] bg-[#2a1518] border border-[#7f1d1d] rounded-lg py-3 px-4 mb-5 text-[14px]">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-4 max-md:grid-cols-1 gap-[18px] mb-[25px]">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Projects</span>
                    <strong className="text-white text-[26px] font-bold">{projects.length}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Active Projects</span>
                    <strong className="text-white text-[26px] font-bold">
                        {
                            projects.filter((p) => {
                                const st = (p.status || "").toLowerCase();
                                return st === "active" || st === "in progress";
                            }).length
                        }
                    </strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Completed Projects</span>
                    <strong className="text-white text-[26px] font-bold">
                        {
                            projects.filter(
                                (p) => (p.status || "").toLowerCase() === "completed"
                            ).length
                        }
                    </strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">In Planning</span>
                    <strong className="text-white text-[26px] font-bold">
                        {
                            projects.filter(
                                (p) => (p.status || "").toLowerCase() === "planning"
                            ).length
                        }
                    </strong>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-5 flex-wrap max-md:flex-col max-md:items-stretch">
                <input
                    type="text"
                    className="flex-1 min-w-[220px] h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
                    placeholder="Search by project name, ID, company, client, or manager..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="h-[42px] min-w-[160px] px-3 border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border cursor-pointer focus:border-[#5969a8] max-md:w-full transition-colors"
                >
                    <option value="">All Statuses</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="in progress">In Progress</option>
                    <option value="on hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {(search || statusFilter) && (
                    <button
                        type="button"
                        className="h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-[#8f9bb3] text-[13px] cursor-pointer transition-all duration-200 hover:bg-[#222942] hover:text-white hover:border-[#454d6e]"
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setPage(1);
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">

                <table className="w-full min-w-[900px] border-collapse">

                    <thead>
                        <tr>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Project ID</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Project Name</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Company</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Client</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Manager</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Status</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Priority</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Progress</th>
                            <th className="border-none p-[15px] text-left text-[12px] font-semibold uppercase tracking-[0.06em] !bg-transparent !text-[#8f9bb3] border-b border-[#282e45] whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {paginatedProjects.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="text-center py-6 text-[#8f9bb3] border-none"
                                >
                                    No projects found
                                </td>
                            </tr>
                        ) : (
                            paginatedProjects.map((project) => (
                                <tr key={project._id} className="hover:!bg-[#1c2136] transition-colors last:[&>td]:border-b-0">

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent">
                                        {project.projectId || "-"}
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent capitalize font-medium">
                                        {project.projectName || "-"}
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent capitalize">
                                        {getCompanyName(project.company)}
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent capitalize">
                                        {getClientName(project.client)}
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent capitalize">
                                        {getUserName(
                                            project.projectManager
                                        )}
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent">
                                        <span
                                            className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getProjectStatusBadgeClass(
                                                project.status
                                            )}`}
                                        >
                                            {project.status || "-"}
                                        </span>
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent">
                                        <span className="inline-block py-[3px] px-2 rounded-[4px] text-[12px] font-medium capitalize bg-[#20253a] text-[#cbd2e3] border border-[#30364d]">
                                            {project.priority || "-"}
                                        </span>
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent">
                                        {project.progress ?? 0}%
                                    </td>

                                    <td className="border-none p-[15px] text-left text-[13px] !text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap !bg-transparent">

                                        <div className="flex items-center gap-[7px] whitespace-nowrap">

                                            <button
                                                className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#222942] text-[#dbe1f2] hover:bg-[#303958]"
                                                onClick={() =>
                                                    setViewProject(project)
                                                }
                                            >
                                                View
                                            </button>

                                            <button
                                                className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f]"
                                                onClick={() =>
                                                    navigate(
                                                        `/project/edit/${project._id}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer transition-colors duration-200 bg-[#40252c] text-[#ff9da9] hover:bg-[#563039]"
                                                onClick={() => {
                                                    setDeleteTarget(project);
                                                    setDeleteError("");
                                                }}
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>

                </table>

            </div>

            {filteredProjects.length > 0 && (
                <div className="flex items-center justify-center gap-[18px] mt-5">
                    <button
                        disabled={page === 1}
                        onClick={() =>
                            setPage((p) => Math.max(1, p - 1))
                        }
                        className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer transition-colors duration-200 hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                    >
                        Previous
                    </button>

                    <span className="text-[13px] font-medium !text-[#8f9bb3]">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer transition-colors duration-200 hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                    >
                        Next
                    </button>
                </div>
            )}

            {viewProject && (
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">

                    <div className="w-full max-w-[650px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">

                            <div>
                                <h2 className="m-0 text-white text-[18px] font-semibold">Project Details</h2>

                                <p className="m-0 mt-1 text-[#8f9bb3] text-[13px] capitalize">
                                    {viewProject.projectName || "-"}
                                </p>
                            </div>

                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() =>
                                    setViewProject(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="p-0 bg-transparent">

                            <div className="p-[1px] grid grid-cols-2 max-md:grid-cols-1 gap-[1px] bg-[#282e45]">

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Project ID</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.projectId || "-"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Project Name</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal capitalize">
                                        {viewProject.projectName || "-"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Company</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal capitalize">
                                        {getCompanyName(
                                            viewProject.company
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Client</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal capitalize">
                                        {getClientName(
                                            viewProject.client
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Project Manager</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal capitalize">
                                        {getUserName(
                                            viewProject.projectManager
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Team Lead</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal capitalize">
                                        {getUserName(
                                            viewProject.teamLead
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Budget</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.budget !== undefined &&
                                        viewProject.budget !== null &&
                                        viewProject.budget !== ""
                                            ? viewProject.budget
                                            : "-"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Technologies</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.technologies || "-"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Start Date</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {formatDate(
                                            viewProject.startDate
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">End Date</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {formatDate(
                                            viewProject.endDate
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Deadline</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {formatDate(
                                            viewProject.deadline
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Status</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.status ? (
                                            <span
                                                className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${getProjectStatusBadgeClass(
                                                    viewProject.status
                                                )}`}
                                            >
                                                {viewProject.status}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Priority</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        <span className="inline-block py-[3px] px-2 rounded-[4px] text-[12px] font-medium capitalize bg-[#20253a] text-[#cbd2e3] border border-[#30364d]">
                                            {viewProject.priority || "-"}
                                        </span>
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Progress</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.progress ?? 0}%
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Active</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.isActive
                                            ? "Yes"
                                            : "No"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Archived</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.isArchived
                                            ? "Yes"
                                            : "No"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-md:col-span-1">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Description</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal">
                                        {viewProject.description || "-"}
                                    </strong>
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e] col-span-2 max-md:col-span-1">
                                    <span className="text-[#7f8aa5] text-[12px] font-semibold">Team Members</span>
                                    <strong className="text-[#eef1f8] text-[14px] break-words font-normal capitalize">
                                        {viewProject.teamMembers?.length
                                            ? viewProject.teamMembers
                                                .map((member) =>
                                                    getUserName(member)
                                                )
                                                .join(", ")
                                            : "-"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">

                    <div
                        className="w-full max-w-[450px] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-y-visible"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
                            <h2 className="m-0 text-white text-[18px] font-semibold">Delete Project</h2>

                            <button
                                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#222942] hover:text-white leading-none"
                                onClick={() => setDeleteTarget(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-[22px]">

                            <p className="text-[#dfe3ee] text-[14px] leading-[1.6] m-0">
                                Are you sure you want to delete{" "}
                                <strong className="text-white font-semibold">
                                    {deleteTarget.projectName ||
                                        "this project"}
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
                                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#282e45] text-[#dfe3ee] hover:bg-[#343b55] transition-colors duration-200"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#a83d4c] text-white hover:bg-[#c04b5b] transition-colors duration-200"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Project;