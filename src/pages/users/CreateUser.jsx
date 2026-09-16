import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as userService from "../../services/userService";
import * as companyService from "../../services/companyService";
import "./CreateUser.css";

const ROLES = [
  "SuperAdmin",
  "Admin",
  "ProjectManager",
  "TeamLead",
  "Developer",
  "QA",
  "Client",
];

const EMPLOYMENT_TYPES = ["Full-Time", "Part-Time", "Contract", "Intern"];

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  company: "",
  designation: "",
  department: "",
  employmentType: "Full-Time",
  workLocation: "",
};

const CreateUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  // If the URL has a :userId (e.g. /users/123/edit), this is Edit mode.
  // If not (e.g. /users/create), this is Create mode. Same component,
  // same form - just different behavior for a few pieces.
  const isEditMode = Boolean(userId);

  const [formData, setFormData] = useState(initialFormState);
  const [employeeId, setEmployeeId] = useState("");

  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState("");

  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch companies (needed in both modes, for the dropdown)
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");
      try {
        const companyData = await companyService.getCompanies();
        setCompanies(companyData.companies || companyData || []);
      } catch (err) {
        const message =
          err.response?.data?.message || "Could not load companies.";
        setCompaniesError(message);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // CREATE MODE ONLY: preview the next auto-generated Employee ID
  useEffect(() => {
    if (isEditMode) return;

    const previewEmployeeId = async () => {
      try {
        const userData = await userService.getUsers();
        const users = userData.users || [];

        let highestNumber = 0;
        users.forEach((u) => {
          if (u.employeeId) {
            const number = parseInt(u.employeeId.replace("EMP", ""), 10);
            if (!isNaN(number) && number > highestNumber) {
              highestNumber = number;
            }
          }
        });

        const nextNumber = highestNumber + 1;
        setEmployeeId(`EMP${String(nextNumber).padStart(3, "0")}`);
      } catch (err) {
        // non-blocking
      }
    };

    previewEmployeeId();
  }, [isEditMode]);

  // EDIT MODE ONLY: fetch the existing user and prefill the form
  useEffect(() => {
    if (!isEditMode) return;

    const fetchUser = async () => {
      setPageLoading(true);
      setError("");
      try {
        const data = await userService.getUserById(userId);
        const user = data.user || data;

        setEmployeeId(user.employeeId || "");
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          password: "",
          role: user.role || "",
          company: user.company || user.company || "",
          designation: user.designation || "",
          department: user.department || "",
          employmentType: user.employmentType || "Full-Time",
          workLocation: user.workLocation || "",
        });
      } catch (err) {
        const message = err.response?.data?.message || "Could not load user.";
        setError(message);
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [isEditMode, userId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const requiredFields = isEditMode
      ? [
          "firstName",
          "lastName",
          "email",
          "phone",
          "role",
          "company",
          "designation",
          "department",
        ]
      : [
          "firstName",
          "lastName",
          "email",
          "phone",
          "password",
          "role",
          "company",
          "designation",
          "department",
        ];

    const missingField = requiredFields.find((field) => !formData[field]);
    if (missingField) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        // Don't send an empty password on edit - backend would
        // otherwise overwrite the real one with a blank hash
        const { password, ...rest } = formData;
        const payload = password ? formData : rest;

        await userService.updateUser(userId, payload);
        setSuccess("User updated successfully.");
      } else {
        const data = await userService.createUser(formData);
        setSuccess(
          `User created successfully. Employee ID: ${data.user.employeeId}`,
        );
        setFormData(initialFormState);

        if (data.user?.employeeId) {
          const createdNumber = parseInt(
            data.user.employeeId.replace("EMP", ""),
            10,
          );
          if (!isNaN(createdNumber)) {
            setEmployeeId(`EMP${String(createdNumber + 1).padStart(3, "0")}`);
          }
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="create-user-page">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="create-user-page">
      <div className="create-user-card">
        <div className="create-user-topbar">
          <h1>{isEditMode ? "Edit User" : "Create User"}</h1>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/users")}
          >
            Back to Users
          </button>
        </div>

        {error && <div className="cu-error">{error}</div>}
        {success && <div className="cu-success">{success}</div>}
        {companiesError && <div className="cu-warning">{companiesError}</div>}

        <form className="create-user-form" onSubmit={handleSubmit}>
          <div className="cu-grid">
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID</label>
              <input id="employeeId" value={employeeId} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                {isEditMode
                  ? "New Password (leave blank to keep current)"
                  : "Temporary Password *"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <select
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={companiesLoading}
              >
                {!isEditMode && (
                  <option value="">
                    {companiesLoading
                      ? "Loading companies..."
                      : "Select company"}
                  </option>
                )}

                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation *</label>
              <input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="employmentType">Employment Type</label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="workLocation">Work Location</label>
              <input
                id="workLocation"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="cu-submit" disabled={submitting}>
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
