import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createProject,
  getProjectById,
  updateProject,
  getProjects,
} from "../../services/projectService";

import { getCompanies } from "../../services/CompanyService";
import { getClients } from "../../services/clientService";
import { getUsers } from "../../services/userService";
import Loader from "../../components/Loader";

const inputBaseClass =
  "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";
const readonlyClass =
  "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";
const getInputClass = (hasError, isReadonly = false) => {
  let cls = inputBaseClass;
  if (isReadonly) cls += ` ${readonlyClass}`;
  if (hasError) cls += " field-error";
  return cls;
};

const CreateProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const isEditMode = Boolean(projectId);

  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    projectId: "",
    projectName: "",
    description: "",

    company: "",
    client: "",

    projectManager: "",
    teamLead: "",
    teamMembers: [],

    budget: "",
    technologies: "",

    startDate: "",
    endDate: "",
    deadline: "",

    status: "planning",
    priority: "medium",
    progress: 0,

    isArchived: false,
    isActive: true,
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Load the next auto-generated Project ID preview (create mode only)
  const loadNextProjectId = async () => {
    try {
      const data = await getProjects();

      if (data?.nextProjectId) {
        setFormData((prev) => ({
          ...prev,
          projectId: data.nextProjectId,
        }));
      }
    } catch (error) {
      console.error("Failed to load next Project ID:", error);
    }
  };

  const fetchFormData = async () => {
    try {
      setLoading(true);
      setError("");

      const [companyData, clientData, userData] = await Promise.all([
        getCompanies(),
        getClients(),
        getUsers(),
      ]);

      setCompanies(companyData.companies || []);

      setClients(clientData.clients || []);

      setUsers(userData.users || []);

      if (!isEditMode) {
        await loadNextProjectId();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProjectById(projectId);

      const project = data.project;

      setFormData({
        projectId: project.projectId || "",

        projectName: project.projectName || "",

        description: project.description || "",

        company: project.company?._id || project.company || "",

        client: project.client?._id || project.client || "",

        projectManager:
          project.projectManager?._id || project.projectManager || "",

        teamLead: project.teamLead?._id || project.teamLead || "",

        teamMembers:
          project.teamMembers?.map((member) => member?._id || member) || [],

        budget: project.budget ?? "",

        technologies: project.technologies || "",

        startDate: project.startDate ? project.startDate.split("T")[0] : "",

        endDate: project.endDate ? project.endDate.split("T")[0] : "",

        deadline: project.deadline ? project.deadline.split("T")[0] : "",

        status: project.status || "planning",

        priority: project.priority || "medium",

        progress: project.progress ?? 0,

        isArchived: project.isArchived ?? false,

        isActive: project.isActive ?? true,
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (
      fieldErrors[name] ||
      fieldErrors.startDate ||
      fieldErrors.endDate ||
      fieldErrors.deadline
    ) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        if (name === "startDate" || name === "endDate" || name === "deadline") {
          delete next.startDate;
          delete next.endDate;
          delete next.deadline;
        }
        return next;
      });
      setError("");
    }
  };

  const handleTeamMemberChange = (userId) => {
    setFormData((prev) => {
      if (prev.teamMembers.includes(userId)) {
        return {
          ...prev,
          teamMembers: prev.teamMembers.filter((id) => id !== userId),
        };
      }

      return {
        ...prev,
        teamMembers: [...prev.teamMembers, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const requiredFields = [
      "projectName",
      "company",
      "client",
      "projectManager",
      "startDate",
      "endDate",
    ];
    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || !String(formData[field]).trim()) {
        errors[field] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill all required fields");
      return;
    }

    setFieldErrors({});

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      setFieldErrors({ startDate: true, endDate: true });
      setError("End date cannot be before start date");
      return;
    }

    if (
      formData.startDate &&
      formData.deadline &&
      new Date(formData.deadline) < new Date(formData.startDate)
    ) {
      setFieldErrors({ startDate: true, deadline: true });
      setError("Deadline cannot be before start date");
      return;
    }

    if (
      formData.endDate &&
      formData.deadline &&
      new Date(formData.deadline) < new Date(formData.endDate)
    ) {
      setFieldErrors({ endDate: true, deadline: true });
      setError("Deadline cannot be before end date");
      return;
    }

    try {
      setSubmitting(true);

      // projectId is preview-only on the client - the backend
      // always generates the permanent one, same as
      // Client/Company. Never send it.
      const { projectId: previewProjectId, ...rest } = formData;

      const projectData = {
        ...rest,

        budget: formData.budget ? Number(formData.budget) : 0,

        progress: Number(formData.progress),
      };

      if (isEditMode) {
        await updateProject(projectId, projectData);

        setSuccess("Project updated successfully");
      } else {
        await createProject(projectData);

        setSuccess("Project created successfully");
      }

      setTimeout(() => {
        navigate("/project");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (isEditMode
            ? "Failed to update project"
            : "Failed to create project"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
        <div className="text-[#8f9bb3] py-10 text-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
      <div className="mb-[25px]">
        <div>
          <h1 className="m-0 text-[28px] font-bold text-white">
            {isEditMode ? "Edit Project" : "Create Project"}
          </h1>

          <p className="mt-1.5 mb-0 text-[#8f9bb3] text-[14px]">
            {isEditMode ? "Update project details" : "Create a new project"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-[12px_14px] border border-[#7f1d1d] rounded-[7px] bg-[#2a1518] text-[#fca5a5] text-[13px]">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-[12px_14px] border border-[#166534] rounded-[7px] bg-[#14251b] text-[#86efac] text-[13px]">
          {success}
        </div>
      )}

      <form
        className="bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] p-7"
        onSubmit={handleSubmit}
      >
        <div className="pb-[25px] mb-[25px] border-b border-[#30364d]">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Project Information
          </h2>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Project ID
              </label>

              <input
                type="text"
                className={getInputClass(false, true)}
                value={formData.projectId}
                readOnly
              />
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Project Name *
              </label>

              <input
                type="text"
                name="projectName"
                className={getInputClass(fieldErrors.projectName)}
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
              />
            </div>

            <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Description
              </label>

              <textarea
                name="description"
                className="w-full h-auto min-h-[80px] py-2.5 px-[13px] resize-y border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="pb-[25px] mb-[25px] border-b border-[#30364d]">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Company & Client
          </h2>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Company *
              </label>

              <select
                name="company"
                className={getInputClass(fieldErrors.company)}
                value={formData.company}
                onChange={handleChange}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  Select Company
                </option>

                {companies.map((company) => (
                  <option
                    key={company._id}
                    value={company._id}
                    className="bg-[#171b2e] text-white"
                  >
                    {company.companyName || company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Client *
              </label>

              <select
                name="client"
                className={getInputClass(fieldErrors.client)}
                value={formData.client}
                onChange={handleChange}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  Select Client
                </option>

                {clients.map((client) => (
                  <option
                    key={client._id}
                    value={client._id}
                    className="bg-[#171b2e] text-white"
                  >
                    {client.ClientName || client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pb-[25px] mb-[25px] border-b border-[#30364d]">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Project Team
          </h2>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Project Manager *
              </label>

              <select
                name="projectManager"
                className={getInputClass(fieldErrors.projectManager)}
                value={formData.projectManager}
                onChange={handleChange}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  Select Project Manager
                </option>

                {users.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                    className="bg-[#171b2e] text-white"
                  >
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Team Lead
              </label>

              <select
                name="teamLead"
                className={getInputClass(false)}
                value={formData.teamLead}
                onChange={handleChange}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  Select Team Lead
                </option>

                {users.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                    className="bg-[#171b2e] text-white"
                  >
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Team Members
              </label>

              <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-2 max-h-[180px] overflow-y-auto p-3 bg-[#0f1322] border border-[#30364d] rounded-[7px]">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 p-2 rounded-[5px] text-[#cbd2e3] text-[13px] cursor-pointer transition-colors duration-200 hover:bg-[#20253a]"
                  >
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-[#5865f2] cursor-pointer"
                      checked={formData.teamMembers.includes(user._id)}
                      onChange={() => handleTeamMemberChange(user._id)}
                    />

                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pb-[25px] mb-[25px] border-b border-[#30364d]">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Budget & Technologies
          </h2>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Budget
              </label>

              <input
                type="number"
                name="budget"
                className={getInputClass(false)}
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter budget"
                min="0"
              />
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Technologies
              </label>

              <input
                type="text"
                name="technologies"
                className={getInputClass(false)}
                value={formData.technologies}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>
        </div>

        <div className="pb-[25px] mb-[25px] border-b border-[#30364d]">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Project Dates
          </h2>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Start Date *
              </label>

              <input
                type="date"
                name="startDate"
                className={getInputClass(fieldErrors.startDate)}
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                End Date *
              </label>

              <input
                type="date"
                name="endDate"
                className={getInputClass(fieldErrors.endDate)}
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Deadline
              </label>

              <input
                type="date"
                name="deadline"
                className={getInputClass(fieldErrors.deadline)}
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="pb-[25px] mb-[25px] border-b border-[#30364d]">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Project Status
          </h2>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Status
              </label>

              <select
                name="status"
                className={getInputClass(false)}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="planning" className="bg-[#171b2e] text-white">
                  Planning
                </option>

                <option value="active" className="bg-[#171b2e] text-white">
                  Active
                </option>

                <option value="on hold" className="bg-[#171b2e] text-white">
                  On Hold
                </option>

                <option value="completed" className="bg-[#171b2e] text-white">
                  Completed
                </option>

                <option value="Cancelled" className="bg-[#171b2e] text-white">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Priority
              </label>

              <select
                name="priority"
                className={getInputClass(false)}
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low" className="bg-[#171b2e] text-white">
                  Low
                </option>

                <option value="medium" className="bg-[#171b2e] text-white">
                  Medium
                </option>

                <option value="high" className="bg-[#171b2e] text-white">
                  High
                </option>

                <option value="critical" className="bg-[#171b2e] text-white">
                  Critical
                </option>
              </select>
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label className="text-[13px] font-medium text-[#cbd2e3]">
                Progress: {formData.progress}%
              </label>

              <input
                className="w-full h-2 p-0 border-none accent-[#5865f2] cursor-pointer"
                type="range"
                name="progress"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="last-of-type:border-b-0 last-of-type:mb-[15px] last-of-type:pb-0">
          <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
            Project Controls
          </h2>

          <div className="flex items-center gap-[30px]">
            <label className="flex items-center gap-2 text-[#cbd2e3] text-[13px] cursor-pointer">
              <input
                type="checkbox"
                className="w-[15px] h-[15px] accent-[#5865f2] cursor-pointer"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active Project
            </label>

            <label className="flex items-center gap-2 text-[#cbd2e3] text-[13px] cursor-pointer">
              <input
                type="checkbox"
                className="w-[15px] h-[15px] accent-[#5865f2] cursor-pointer"
                name="isArchived"
                checked={formData.isArchived}
                onChange={handleChange}
              />
              Archived
            </label>
          </div>
        </div>

        <div className="flex justify-end max-sm:flex-col items-center gap-3 mt-6 pt-5 border-t border-[#30364d]">
          <button
            type="button"
            className="py-2.5 px-5 max-sm:w-full border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[14px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => navigate("/project")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="py-2.5 px-6 max-sm:w-full border-none rounded-[7px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#4752c4] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Project"
                : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
