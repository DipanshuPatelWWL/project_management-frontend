import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const EMPLOYMENT_TYPES = [
    "Full-Time",
    "Part-Time",
    "Contract",
    "Intern",
];

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

    const [formData, setFormData] = useState(initialFormState);

    // Employee ID shown on frontend
    const [employeeId, setEmployeeId] = useState("");

    const [companies, setCompanies] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [companiesError, setCompaniesError] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Fetch companies and existing users
    useEffect(() => {
        const fetchData = async () => {
            setCompaniesLoading(true);
            setCompaniesError("");

            try {
                // Fetch companies using existing API
                const companyData = await companyService.getCompanies();

                setCompanies(
                    companyData.companies || companyData || []
                );

                // Fetch existing users using existing API
                const userData = await userService.getUsers();

                const users = userData.users || [];

                // Find highest employee ID number
                let highestNumber = 0;

                users.forEach((user) => {
                    if (user.employeeId) {
                        const number = parseInt(
                            user.employeeId.replace("EMP", ""),
                            10
                        );

                        if (
                            !isNaN(number) &&
                            number > highestNumber
                        ) {
                            highestNumber = number;
                        }
                    }
                });

                // Generate next Employee ID
                const nextNumber = highestNumber + 1;

                const nextEmployeeId = `EMP${String(
                    nextNumber
                ).padStart(3, "0")}`;

                setEmployeeId(nextEmployeeId);

            } catch (err) {
                console.error("Failed to load data:", err);

                const message =
                    err.response?.data?.message ||
                    "Could not load companies or users.";

                setCompaniesError(message);
            } finally {
                setCompaniesLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const requiredFields = [
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

        const missingField = requiredFields.find(
            (field) => !formData[field]
        );

        if (missingField) {
            setError("Please fill all required fields");
            return;
        }

        setSubmitting(true);

        try {
            // Employee ID is NOT sent from frontend.
            // Backend generates the actual Employee ID.
            const data = await userService.createUser(formData);

            setSuccess(
                `User created successfully. Employee ID: ${data.user.employeeId}`
            );

            // Clear the form
            setFormData(initialFormState);

            /*
                After user creation, update the displayed ID.

                If backend created EMP001,
                frontend now shows EMP002.
            */

            if (data.user?.employeeId) {
                const createdNumber = parseInt(
                    data.user.employeeId.replace("EMP", ""),
                    10
                );

                if (!isNaN(createdNumber)) {
                    const nextNumber = createdNumber + 1;

                    setEmployeeId(
                        `EMP${String(nextNumber).padStart(3, "0")}`
                    );
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

    return (
        <div className="create-user-page">
            <div className="create-user-card">

                <div className="create-user-topbar">
                    <h1>Create User</h1>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate("/users")}
                    >
                        Back to Users
                    </button>
                </div>

                {error && (
                    <div className="cu-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="cu-success">
                        {success}
                    </div>
                )}

                {companiesError && (
                    <div className="cu-warning">
                        {companiesError}
                    </div>
                )}

                <form
                    className="create-user-form"
                    onSubmit={handleSubmit}
                >
                    <div className="cu-grid">

                        {/* Employee ID */}
                        <div className="form-group">
                            <label htmlFor="employeeId">
                                Employee ID
                            </label>

                            <input
                                id="employeeId"
                                value={employeeId}
                                readOnly
                            />
                        </div>

                        {/* First Name */}
                        <div className="form-group">
                            <label htmlFor="firstName">
                                First Name *
                            </label>

                            <input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Last Name */}
                        <div className="form-group">
                            <label htmlFor="lastName">
                                Last Name *
                            </label>

                            <input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">
                                Email *
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone *
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password">
                                Temporary Password *
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Role */}
                        <div className="form-group">
                            <label htmlFor="role">
                                Role *
                            </label>

                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select role
                                </option>

                                {ROLES.map((role) => (
                                    <option
                                        key={role}
                                        value={role}
                                    >
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Company */}
                        <div className="form-group">
                            <label htmlFor="company">
                                Company *
                            </label>

                            <select
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                disabled={companiesLoading}
                            >
                                <option value="">
                                    {companiesLoading
                                        ? "Loading companies..."
                                        : "Select company"}
                                </option>

                                {companies.map((c) => (
                                    <option
                                        key={c._id}
                                        value={c._id}
                                    >
                                        {c.companyName || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Designation */}
                        <div className="form-group">
                            <label htmlFor="designation">
                                Designation *
                            </label>

                            <input
                                id="designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Department */}
                        <div className="form-group">
                            <label htmlFor="department">
                                Department *
                            </label>

                            <input
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Employment Type */}
                        <div className="form-group">
                            <label htmlFor="employmentType">
                                Employment Type
                            </label>

                            <select
                                id="employmentType"
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                            >
                                {EMPLOYMENT_TYPES.map((type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Work Location */}
                        <div className="form-group">
                            <label htmlFor="workLocation">
                                Work Location
                            </label>

                            <input
                                id="workLocation"
                                name="workLocation"
                                value={formData.workLocation}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="cu-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating..."
                            : "Create User"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateUser;