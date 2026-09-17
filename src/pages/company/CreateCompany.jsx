import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as companyService from "../../services/companyService";
import "./CreateCompany.css";

const COMPANY_TYPES = [
    "Private",
    "Public",
    "Partnership",
    "LLP",
    "Proprietorship",
];

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const initialFormState = {
    companyId: "",
    companyName: "",
    companyCode: "",
    companyLogo: "",
    companyType: "",
    industry: "",
    officialEmail: "",
    contactNumber: "",
    website: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    timeZone: "",
    currency: "",
    workingDays: [],
    officeStartTime: "",
    officeEndTime: "",
    status: "active",
};

const CreateCompany = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();

    const isEditMode = Boolean(companyId);

    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loadingCompany, setLoadingCompany] = useState(false);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchCompany = async () => {
            setLoadingCompany(true);
            setError("");

            try {
                const data =
                    await companyService.getCompanyById(companyId);

                const company = data.company || data;

                setFormData({
                    companyId: company.companyId || "",
                    companyName: company.companyName || "",
                    companyCode: company.companyCode || "",
                    companyLogo: company.companyLogo || "",
                    companyType: company.companyType || "",
                    industry: company.industry || "",
                    officialEmail: company.officialEmail || "",
                    contactNumber: company.contactNumber || "",
                    website: company.website || "",
                    addressLine1: company.addressLine1 || "",
                    city: company.city || "",
                    state: company.state || "",
                    country: company.country || "",
                    pincode: company.pincode || "",
                    timeZone: company.timeZone || "",
                    currency: company.currency || "",
                    workingDays: Array.isArray(company.workingDays)
                        ? company.workingDays
                        : [],
                    officeStartTime: company.officeStartTime || "",
                    officeEndTime: company.officeEndTime || "",
                    status: company.status || "active",
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Could not load company."
                );
            } finally {
                setLoadingCompany(false);
            }
        };

        fetchCompany();
    }, [companyId, isEditMode]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleDayChange = (day) => {
        setFormData((prev) => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(
                      (item) => item !== day
                  )
                : [...prev.workingDays, day],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const requiredFields = [
            "companyName",
            "companyCode",
            "companyType",
            "industry",
            "officialEmail",
            "contactNumber",
            "addressLine1",
            "city",
            "state",
            "country",
            "pincode",
            "timeZone",
            "currency",
            "officeStartTime",
            "officeEndTime",
        ];

        const missingField = requiredFields.find(
            (field) => !formData[field]
        );

        if (missingField) {
            setError("Please fill all required fields");
            return;
        }

        if (formData.workingDays.length === 0) {
            setError("Please select at least one working day");
            return;
        }

        setSubmitting(true);

        try {
            let data;

            if (isEditMode) {
                data = await companyService.updateCompany(
                    companyId,
                    formData
                );
            } else {
                data = await companyService.createCompany(
                    formData
                );
            }

            console.log("CREATE COMPANY RESPONSE:", data);

            const createdCompany = data?.company;

            if (!isEditMode && createdCompany?.companyId) {
                setFormData({
                    ...initialFormState,
                    companyId: createdCompany.companyId,
                });
            }

            setSuccess(
                data?.message ||
                    (isEditMode
                        ? "Company updated successfully."
                        : "Company created successfully.")
            );
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
        <div className="create-company-page">
            <div className="create-company-card">

                <div className="create-company-topbar">
                    <h1>
                        {isEditMode
                            ? "Edit Company"
                            : "Create Company"}
                    </h1>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate("/companies")}
                    >
                        Back to Companies
                    </button>
                </div>

                {loadingCompany && (
                    <div className="cc-success">
                        Loading company details...
                    </div>
                )}

                {error && (
                    <div className="cc-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="cc-success">
                        {success}
                    </div>
                )}

                {!loadingCompany && (
                    <form
                        className="create-company-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="cc-section">

                            <h2>Basic Information</h2>

                            <div className="form-group">
                                <label htmlFor="companyId">
                                    Company ID
                                </label>

                                <input
                                    id="companyId"
                                        className="readonly-field"

                                    value={
                                        formData.companyId ||
                                        "Generated automatically"
                                    }
                                    readOnly
                                />
                            </div>

                            <div className="cc-grid">

                                <div className="form-group">
                                    <label htmlFor="companyName">
                                        Company Name *
                                    </label>

                                    <input
                                        id="companyName"
                                        name="companyName"
                                        value={
                                            formData.companyName
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="companyCode">
                                        Company Code *
                                    </label>

                                    <input
                                        id="companyCode"
                                        name="companyCode"
                                        value={
                                            formData.companyCode
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter company code"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="companyLogo">
                                        Company Logo
                                    </label>

                                    <input
                                        id="companyLogo"
                                        name="companyLogo"
                                        value={
                                            formData.companyLogo
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter logo URL"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="companyType">
                                        Company Type *
                                    </label>

                                    <select
                                        id="companyType"
                                        name="companyType"
                                        value={
                                            formData.companyType
                                        }
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select company type
                                        </option>

                                        {COMPANY_TYPES.map(
                                            (type) => (
                                                <option
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="industry">
                                        Industry *
                                    </label>

                                    <input
                                        id="industry"
                                        name="industry"
                                        value={
                                            formData.industry
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter industry"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">
                                        Status
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={handleChange}
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>

                                        <option value="on leave">
                                            On Leave
                                        </option>
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className="cc-section">

                            <h2>Contact Information</h2>

                            <div className="cc-grid">

                                <div className="form-group">
                                    <label htmlFor="officialEmail">
                                        Official Email *
                                    </label>

                                    <input
                                        id="officialEmail"
                                        name="officialEmail"
                                        type="email"
                                        value={
                                            formData.officialEmail
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter official email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contactNumber">
                                        Contact Number *
                                    </label>

                                    <input
                                        id="contactNumber"
                                        name="contactNumber"
                                        value={
                                            formData.contactNumber
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter contact number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="website">
                                        Website
                                    </label>

                                    <input
                                        id="website"
                                        name="website"
                                        value={
                                            formData.website
                                        }
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="cc-section">

                            <h2>Address</h2>

                            <div className="cc-grid">

                                <div className="form-group cc-full">
                                    <label htmlFor="addressLine1">
                                        Address *
                                    </label>

                                    <input
                                        id="addressLine1"
                                        name="addressLine1"
                                        value={
                                            formData.addressLine1
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter address"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city">
                                        City *
                                    </label>

                                    <input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state">
                                        State *
                                    </label>

                                    <input
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">
                                        Country *
                                    </label>

                                    <input
                                        id="country"
                                        name="country"
                                        value={
                                            formData.country
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter country"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="pincode">
                                        Pincode *
                                    </label>

                                    <input
                                        id="pincode"
                                        name="pincode"
                                        value={
                                            formData.pincode
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter pincode"
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="cc-section">

                            <h2>Working Information</h2>

                            <div className="cc-grid">

                                <div className="form-group">
                                    <label htmlFor="timeZone">
                                        Time Zone *
                                    </label>

                                    <input
                                        id="timeZone"
                                        name="timeZone"
                                        value={
                                            formData.timeZone
                                        }
                                        onChange={handleChange}
                                        placeholder="e.g. Asia/Kolkata"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="currency">
                                        Currency *
                                    </label>

                                    <input
                                        id="currency"
                                        name="currency"
                                        value={
                                            formData.currency
                                        }
                                        onChange={handleChange}
                                        placeholder="e.g. INR"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="officeStartTime">
                                        Office Start Time *
                                    </label>

                                    <input
                                        id="officeStartTime"
                                        name="officeStartTime"
                                        type="time"
                                        value={
                                            formData.officeStartTime
                                        }
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="officeEndTime">
                                        Office End Time *
                                    </label>

                                    <input
                                        id="officeEndTime"
                                        name="officeEndTime"
                                        type="time"
                                        value={
                                            formData.officeEndTime
                                        }
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group cc-full">

                                    <label>
                                        Working Days *
                                    </label>

                                    <div className="working-days">

                                        {DAYS.map((day) => (
                                            <label
                                                key={day}
                                                className="day-option"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.workingDays.includes(
                                                        day
                                                    )}
                                                    onChange={() =>
                                                        handleDayChange(
                                                            day
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {day}
                                                </span>
                                            </label>
                                        ))}

                                    </div>

                                </div>

                            </div>
                        </div>

                        <button
                            type="submit"
                            className="cc-submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? isEditMode
                                    ? "Updating..."
                                    : "Creating..."
                                : isEditMode
                                ? "Update Company"
                                : "Create Company"}
                        </button>

                    </form>
                )}

            </div>
        </div>
    );
};

export default CreateCompany;