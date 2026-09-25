import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as userService from "../../services/userService";
import * as companyService from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  VALIDATION_MESSAGES,
} from "../../utils/validation";

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

const ROLE_OPTIONS = [
  "SuperAdmin",
  "Admin",
  "ProjectManager",
  "TeamLead",
  "Developer",
  "QA",
  "Client",
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "OnLeave", label: "On Leave" },
];

const EMPLOYMENT_OPTIONS = ["Full-Time", "Part-Time", "Contract", "Intern"];

const initialFormState = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  status: "Active",
  company: "",
  designation: "",
  department: "",
  employmentType: "",
  workLocation: "",
};

const CreateUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  const isEditMode = Boolean(userId);

  const [formData, setFormData] = useState(initialFormState);

  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState("");

  const [pageLoading, setPageLoading] = useState(isEditMode);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");

      try {
        const data = await companyService.getCompanies();

        setCompanies(data?.companies || data?.company || data || []);
      } catch (err) {
        setCompaniesError(
          err.response?.data?.message || "Could not load companies.",
        );
      } finally {
        setCompaniesLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // NEW CHANGE:
  // Load next Employee ID from existing GET Users API
  const loadNextEmployeeId = async () => {
    try {
      const data = await userService.getUsers();

      if (data?.nextEmployeeId) {
        setFormData((prev) => ({
          ...prev,
          employeeId: data.nextEmployeeId,
        }));
      }
    } catch (err) {
      console.error("Failed to load next Employee ID:", err);
    }
  };

  // NEW CHANGE:
  // Load Employee ID preview only in create mode
  useEffect(() => {
    if (isEditMode) return;

    loadNextEmployeeId();
  }, [isEditMode]);

  // Load existing user in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const loadUser = async () => {
      setPageLoading(true);
      setError("");

      try {
        const data = await userService.getUserById(userId);

        const user = data?.user || data;

        setFormData({
          employeeId: user.employeeId || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          password: "",
          role: user.role || "",
          status: user.status || "Active",
          company: user.company?._id || user.company || "",
          designation: user.designation || "",
          department: user.department || "",
          employmentType: user.employmentType || "",
          workLocation: user.workLocation || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load user.");
      } finally {
        setPageLoading(false);
      }
    };

    loadUser();
  }, [isEditMode, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let sanitizedValue = value;
    if (name === "phone") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "role",
      "status",
      "company",
      "designation",
      "department",
      "employmentType",
      "workLocation",
    ];

    if (!isEditMode) {
      requiredFields.push("password");
    }

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

    if (!isValidEmail(formData.email)) {
      setFieldErrors({ email: true });
      setError(VALIDATION_MESSAGES.email);
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setFieldErrors({ phone: true });
      setError(VALIDATION_MESSAGES.phone);
      return;
    }

    if (!isEditMode || formData.password) {
      if (!isValidPassword(formData.password)) {
        setFieldErrors({ password: true });
        setError(VALIDATION_MESSAGES.password);
        return;
      }
    }

    setFieldErrors({});

    setSubmitting(true);

    try {
      if (isEditMode) {
        // EDIT MODE:
        // Existing Employee ID remains unchanged

        await userService.updateUser(userId, formData);

        setSuccess("User updated successfully.");
      } else {
        // NEW CHANGE:
        // Do not send preview Employee ID.
        // Backend generates the permanent Employee ID.

        const { employeeId: previewEmployeeId, ...userData } = formData;

        const data = await userService.createUser(userData);

        const createdEmployeeId = data?.user?.employeeId;

        setSuccess(
          createdEmployeeId
            ? `User created successfully. Employee ID: ${createdEmployeeId}`
            : "User created successfully.",
        );

        // Reset form
        setFormData(initialFormState);

        // NEW CHANGE:
        // Get the next Employee ID preview
        await loadNextEmployeeId();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="w-full min-w-0 box-border p-[30px] max-sm:p-4">
        <div className="text-[#8f9bb3] py-10 text-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 box-border p-[30px] max-sm:p-4">
      <div className="w-full max-w-[1000px] mx-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex items-center justify-between p-[22px_28px] max-sm:p-5 bg-[#171b2e] border-b border-[#30364d] max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
          <h1 className="m-0 text-[22px] font-semibold text-white">
            {isEditMode ? "Edit User" : "Create User"}
          </h1>

          <button
            type="button"
            className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
            onClick={() => navigate("/users")}
          >
            Back to Users
          </button>
        </div>

        {error && (
          <div className="my-0 mx-7 max-sm:mx-5 mt-5 p-[12px_14px] border border-[#7f1d1d] rounded-[7px] bg-[#2a1518] text-[#fca5a5] text-[13px]">
            {error}
          </div>
        )}

        {success && (
          <div className="my-0 mx-7 max-sm:mx-5 mt-5 p-[12px_14px] border border-[#166534] rounded-[7px] bg-[#14251b] text-[#86efac] text-[13px]">
            {success}
          </div>
        )}

        {companiesError && (
          <div className="my-0 mx-7 max-sm:mx-5 mt-5 p-[12px_14px] border border-[#78350f] rounded-[7px] bg-[#2d1d0e] text-[#fcd34d] text-[13px]">
            {companiesError}
          </div>
        )}

        <form className="p-7 max-sm:p-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
            {/* Employee ID */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="employeeId"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Employee ID
              </label>

              <input
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                readOnly
                className={getInputClass(false, true)}
              />
            </div>

            {/* First Name */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="firstName"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                First Name *
              </label>

              <input
                id="firstName"
                name="firstName"
                className={getInputClass(fieldErrors.firstName)}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="lastName"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Last Name *
              </label>

              <input
                id="lastName"
                name="lastName"
                className={getInputClass(fieldErrors.lastName)}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="email"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Email *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className={getInputClass(fieldErrors.email)}
                value={formData.email}
                onChange={handleChange}
                placeholder="user@company.com"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="phone"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Phone *
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={10}
                className={getInputClass(fieldErrors.phone)}
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile (e.g. 9876543210)"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="password"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Password {!isEditMode && "*"}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                className={getInputClass(fieldErrors.password)}
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  isEditMode
                    ? "Leave blank to keep current password"
                    : "Min 8 chars (A-Z, a-z, 0-9, special char)"
                }
              />
            </div>

            {/* Role */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="role"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Role *
              </label>

              <select
                id="role"
                name="role"
                className={getInputClass(fieldErrors.role)}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  Select role
                </option>

                {ROLE_OPTIONS.map((role) => (
                  <option
                    key={role}
                    value={role}
                    className="bg-[#171b2e] text-white"
                  >
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col min-w-0 gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="status"
                  className="text-[13px] font-medium text-[#cbd2e3]"
                >
                  Status *
                </label>
                {!isSuperAdmin && (
                  <span className="text-[11px] text-[#f2c96d] font-medium">
                    Only SuperAdmin can change
                  </span>
                )}
              </div>

              <select
                id="status"
                name="status"
                className={getInputClass(fieldErrors.status, !isSuperAdmin)}
                value={formData.status}
                onChange={handleChange}
                disabled={!isSuperAdmin}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                    className="bg-[#171b2e] text-white"
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="company"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Company *
              </label>

              <select
                id="company"
                name="company"
                className={getInputClass(fieldErrors.company)}
                value={formData.company}
                onChange={handleChange}
                disabled={companiesLoading}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  {companiesLoading ? "Loading companies..." : "Select company"}
                </option>

                {companies.map((company) => (
                  <option
                    key={company._id}
                    value={company._id}
                    className="bg-[#171b2e] text-white"
                  >
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="designation"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Designation *
              </label>

              <input
                id="designation"
                name="designation"
                className={getInputClass(fieldErrors.designation)}
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="department"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Department *
              </label>

              <input
                id="department"
                name="department"
                className={getInputClass(fieldErrors.department)}
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
              />
            </div>

            {/* Employment Type */}
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="employmentType"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Employment Type *
              </label>

              <select
                id="employmentType"
                name="employmentType"
                className={getInputClass(fieldErrors.employmentType)}
                value={formData.employmentType}
                onChange={handleChange}
              >
                <option value="" className="bg-[#171b2e] text-white">
                  Select employment type
                </option>

                {EMPLOYMENT_OPTIONS.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-[#171b2e] text-white"
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Location */}
            <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
              <label
                htmlFor="workLocation"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Work Location *
              </label>

              <input
                id="workLocation"
                name="workLocation"
                className={getInputClass(fieldErrors.workLocation)}
                value={formData.workLocation}
                onChange={handleChange}
                placeholder="e.g. Noida"
              />
            </div>
          </div>

          <button
            type="submit"
            className="block w-[180px] max-sm:w-full h-11 mt-6 ml-auto border-none rounded-[7px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#4752c4] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
