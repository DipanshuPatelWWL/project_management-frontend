import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as companyService from "../../services/companyService";
import Loader from "../../components/Loader";
import {
  isValidEmail,
  isValidPhone,
  isValidPincode,
  VALIDATION_MESSAGES,
} from "../../utils/validation";
import { Country, State, City } from "country-state-city";

const inputBaseClass =
  "w-full h-11 px-[13px] border border-[#30364d] rounded-[7px] bg-[#0f1322] text-white text-[14px] outline-none box-border transition-all duration-200 hover:border-[#4a5475] focus:border-[#5969a8] focus:ring-2 focus:ring-[#5969a8]/20 placeholder:text-[#7f8aa5]";
const readonlyClass = "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5]";
const getInputClass = (hasError, isReadonly = false) => {
  let cls = inputBaseClass;
  if (isReadonly) cls += ` ${readonlyClass}`;
  if (hasError) cls += " field-error";
  return cls;
};

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
  const [fieldErrors, setFieldErrors] = useState({});

  const loadNextCompanyId = async () => {
    try {
      const data = await companyService.getCompanies();

      if (data?.nextCompanyId) {
        setFormData((prev) => ({
          ...prev,
          companyId: data.nextCompanyId,
        }));
      }
    } catch (error) {
      console.error("Failed to load next Company ID:", error);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      loadNextCompanyId();
      return;
    }

    const fetchCompany = async () => {
      setLoadingCompany(true);
      setError("");

      try {
        const data = await companyService.getCompanyById(companyId);

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
        setError(err.response?.data?.message || "Could not load company.");
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [companyId, isEditMode]);

  // Selected Country Object lookup
  const selectedCountryObj = useMemo(() => {
    if (!formData.country) return null;
    const all = Country.getAllCountries();
    return (
      all.find(
        (c) =>
          c.name.toLowerCase() === formData.country.trim().toLowerCase() ||
          c.isoCode.toLowerCase() === formData.country.trim().toLowerCase()
      ) || null
    );
  }, [formData.country]);

  // Derived options based on selected Country and State
  const countryOptions = useMemo(() => {
    const list = Country.getAllCountries().map((c) => c.name);
    if (formData.country && !list.includes(formData.country)) {
      return [formData.country, ...list];
    }
    return list;
  }, [formData.country]);

  const statesOfCountry = useMemo(() => {
    if (!selectedCountryObj) return [];
    return State.getStatesOfCountry(selectedCountryObj.isoCode);
  }, [selectedCountryObj]);

  const stateOptions = useMemo(() => {
    if (!statesOfCountry.length) return [];
    const list = statesOfCountry.map((s) => s.name);
    if (formData.state && !list.includes(formData.state)) {
      return [formData.state, ...list];
    }
    return list;
  }, [statesOfCountry, formData.state]);

  const selectedStateObj = useMemo(() => {
    if (!formData.state || !statesOfCountry.length) return null;
    return (
      statesOfCountry.find(
        (s) =>
          s.name.toLowerCase() === formData.state.trim().toLowerCase() ||
          s.isoCode.toLowerCase() === formData.state.trim().toLowerCase()
      ) || null
    );
  }, [statesOfCountry, formData.state]);

  const citiesOfState = useMemo(() => {
    if (!selectedCountryObj || !selectedStateObj) return [];
    return City.getCitiesOfState(
      selectedCountryObj.isoCode,
      selectedStateObj.isoCode
    );
  }, [selectedCountryObj, selectedStateObj]);

  const cityOptions = useMemo(() => {
    if (!citiesOfState.length) return [];
    const list = citiesOfState.map((c) => c.name);
    if (formData.city && !list.includes(formData.city)) {
      return [formData.city, ...list];
    }
    return list;
  }, [citiesOfState, formData.city]);

  const timeZoneOptions = useMemo(() => {
    if (selectedCountryObj?.timezones?.length) {
      const list = selectedCountryObj.timezones.map((tz) => tz.zoneName);
      if (formData.timeZone && !list.includes(formData.timeZone)) {
        return [formData.timeZone, ...list];
      }
      return list;
    }
    const defaultList = ["Asia/Kolkata", "UTC"];
    if (formData.timeZone && !defaultList.includes(formData.timeZone)) {
      return [formData.timeZone, ...defaultList];
    }
    return defaultList;
  }, [selectedCountryObj, formData.timeZone]);

  const handleCountryChange = (e) => {
    const selectedCountryName = e.target.value;
    const countryObj = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === selectedCountryName.trim().toLowerCase()
    );

    const defaultTz = countryObj?.timezones?.[0]?.zoneName || "";
    const currency = countryObj?.currency || "";

    setFormData((prev) => ({
      ...prev,
      country: countryObj ? countryObj.name : selectedCountryName,
      state: "",
      city: "",
      pincode: "",
      timeZone: defaultTz || prev.timeZone || "",
      currency: currency || prev.currency || "",
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.country;
      delete next.state;
      delete next.city;
      delete next.pincode;
      delete next.timeZone;
      delete next.currency;
      return next;
    });
    setError("");
  };

  const handleStateChange = (e) => {
    const selectedStateName = e.target.value;

    setFormData((prev) => ({
      ...prev,
      state: selectedStateName,
      city: "",
      pincode: "",
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      delete next.city;
      delete next.pincode;
      return next;
    });
    setError("");
  };

  const handleCityChange = (e) => {
    const selectedCityName = e.target.value;

    setFormData((prev) => ({
      ...prev,
      city: selectedCityName,
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.city;
      return next;
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === "contactNumber") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pincode") {
      const isIndia =
        !formData.country || formData.country.toLowerCase() === "india";
      sanitizedValue = isIndia
        ? value.replace(/\D/g, "").slice(0, 6)
        : value.slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
    if (fieldErrors[name] || fieldErrors.officeStartTime || fieldErrors.officeEndTime) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        if (name === "officeStartTime" || name === "officeEndTime") {
          delete next.officeStartTime;
          delete next.officeEndTime;
        }
        return next;
      });
      setError("");
    }
  };

  const handleDayChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((item) => item !== day)
        : [...prev.workingDays, day],
    }));
    if (fieldErrors.workingDays) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.workingDays;
        return next;
      });
      setError("");
    }
  };

  const handleSelectAllDays = () => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.length === DAYS.length ? [] : [...DAYS],
    }));
    if (fieldErrors.workingDays) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.workingDays;
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

    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || !String(formData[field]).trim()) {
        errors[field] = true;
      }
    });

    if (formData.workingDays.length === 0) {
      errors.workingDays = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill all required fields");
      return;
    }

    if (!isValidEmail(formData.officialEmail)) {
      setFieldErrors({ officialEmail: true });
      setError(VALIDATION_MESSAGES.email);
      return;
    }

    if (!isValidPhone(formData.contactNumber)) {
      setFieldErrors({ contactNumber: true });
      setError(VALIDATION_MESSAGES.phone);
      return;
    }

    if (!isValidPincode(formData.pincode, formData.country)) {
      setFieldErrors({ pincode: true });
      setError(VALIDATION_MESSAGES.pincode);
      return;
    }

    if (formData.officeStartTime && formData.officeEndTime) {
      if (formData.officeEndTime <= formData.officeStartTime) {
        setFieldErrors({ officeStartTime: true, officeEndTime: true });
        setError("Office End Time must be after Office Start Time");
        return;
      }
    }

    setFieldErrors({});

    setSubmitting(true);

    try {
      let data;

      if (isEditMode) {
        data = await companyService.updateCompany(companyId, formData);
        setSuccess("Company updated successfully.");
      } else {
        const { companyId: previewCompanyId, ...companyData } = formData;
        data = await companyService.createCompany(companyData);
        const createdId = data?.company?.companyId;
        setSuccess(
          createdId
            ? `Company created successfully. Company ID: ${createdId}`
            : "Company created successfully."
        );
        setFormData(initialFormState);
        await loadNextCompanyId();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCompany) {
    return (
      <div className="w-full min-w-0 box-border p-[30px] max-sm:p-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 box-border p-[30px] max-sm:p-4">
      <div className="w-full max-w-[1000px] mx-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex items-center justify-between p-[22px_28px] max-sm:p-5 bg-[#171b2e] border-b border-[#30364d] max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
          <h1 className="m-0 text-[22px] font-semibold text-white">
            {isEditMode ? "Edit Company" : "Create Company"}
          </h1>

          <button
            type="button"
            className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
            onClick={() => navigate("/companies")}
          >
            Back to Companies
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

        <form className="p-7 max-sm:p-5" onSubmit={handleSubmit}>
          <div>
            <div className="mb-8">
              <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
                Basic Information
              </h2>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="companyId"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Company ID
                  </label>

                  <input
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    readOnly
                    className={getInputClass(false, true)}
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="companyName"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Company Name *
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    className={getInputClass(fieldErrors.companyName)}
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="companyCode"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Company Code *
                  </label>

                  <input
                    id="companyCode"
                    name="companyCode"
                    className={getInputClass(fieldErrors.companyCode)}
                    value={formData.companyCode}
                    onChange={handleChange}
                    placeholder="e.g. COMP001"
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="companyType"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Company Type *
                  </label>

                  <select
                    id="companyType"
                    name="companyType"
                    className={getInputClass(fieldErrors.companyType)}
                    value={formData.companyType}
                    onChange={handleChange}
                  >
                    <option value="" className="bg-[#171b2e] text-white">
                      Select type
                    </option>
                    {COMPANY_TYPES.map((type) => (
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

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="industry"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Industry *
                  </label>

                  <input
                    id="industry"
                    name="industry"
                    className={getInputClass(fieldErrors.industry)}
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Information Technology"
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="status"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    className={getInputClass(false)}
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active" className="bg-[#171b2e] text-white">
                      Active
                    </option>

                    <option
                      value="inactive"
                      className="bg-[#171b2e] text-white"
                    >
                      Inactive
                    </option>

                    <option
                      value="on leave"
                      className="bg-[#171b2e] text-white"
                    >
                      On Leave
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
                Contact Information
              </h2>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="officialEmail"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Official Email *
                  </label>

                  <input
                    id="officialEmail"
                    name="officialEmail"
                    type="email"
                    className={getInputClass(fieldErrors.officialEmail)}
                    value={formData.officialEmail}
                    onChange={handleChange}
                    placeholder="Enter official email"
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="contactNumber"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Contact Number *
                  </label>

                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    maxLength={10}
                    className={getInputClass(fieldErrors.contactNumber)}
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="10-digit number (e.g. 9876543210)"
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="website"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Website
                  </label>

                  <input
                    id="website"
                    name="website"
                    className={getInputClass(false)}
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
                Address
              </h2>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
                  <label
                    htmlFor="addressLine1"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Address *
                  </label>

                  <input
                    id="addressLine1"
                    name="addressLine1"
                    className={getInputClass(fieldErrors.addressLine1)}
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Enter address"
                  />
                </div>

                {/* Country Dropdown */}
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="country"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Country *
                  </label>

                  <select
                    id="country"
                    name="country"
                    className={getInputClass(fieldErrors.country)}
                    value={formData.country}
                    onChange={handleCountryChange}
                  >
                    <option value="" className="bg-[#171b2e] text-white">
                      Select Country
                    </option>
                    {countryOptions.map((c) => (
                      <option
                        key={c}
                        value={c}
                        className="bg-[#171b2e] text-white"
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State Dropdown based on Country */}
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="state"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    State *
                  </label>

                  <select
                    id="state"
                    name="state"
                    className={getInputClass(fieldErrors.state)}
                    value={formData.state}
                    onChange={handleStateChange}
                    disabled={!formData.country}
                  >
                    <option value="" className="bg-[#171b2e] text-white">
                      {!formData.country
                        ? "Select Country First"
                        : "Select State"}
                    </option>
                    {stateOptions.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-[#171b2e] text-white"
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Dropdown based on State */}
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="city"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    City *
                  </label>

                  {cityOptions.length > 0 ? (
                    <select
                      id="city"
                      name="city"
                      className={getInputClass(fieldErrors.city)}
                      value={formData.city}
                      onChange={handleCityChange}
                      disabled={!formData.state}
                    >
                      <option value="" className="bg-[#171b2e] text-white">
                        {!formData.state ? "Select State First" : "Select City"}
                      </option>
                      {cityOptions.map((ci) => (
                        <option
                          key={ci}
                          value={ci}
                          className="bg-[#171b2e] text-white"
                        >
                          {ci}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="city"
                      name="city"
                      className={getInputClass(fieldErrors.city, !formData.state)}
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!formData.state}
                      placeholder={
                        !formData.state ? "Select State First" : "Enter City"
                      }
                    />
                  )}
                </div>

                {/* Pincode (auto-filled on city selection and editable) */}
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="pincode"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Pincode *
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    maxLength={
                      formData.country?.toLowerCase() === "india" ||
                      !formData.country
                        ? 6
                        : 10
                    }
                    className={getInputClass(fieldErrors.pincode)}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 110001"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="m-0 mb-5 pb-3 border-b border-[#30364d] text-[16px] font-semibold text-white">
                Working Information
              </h2>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-7 gap-y-5">
                {/* Timezone (auto-selected on country, and dropdown available) */}
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="timeZone"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Time Zone *
                  </label>

                  <select
                    id="timeZone"
                    name="timeZone"
                    className={getInputClass(fieldErrors.timeZone)}
                    value={formData.timeZone}
                    onChange={handleChange}
                  >
                    <option value="" className="bg-[#171b2e] text-white">
                      Select Time Zone
                    </option>
                    {timeZoneOptions.map((tz) => (
                      <option
                        key={tz}
                        value={tz}
                        className="bg-[#171b2e] text-white"
                      >
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency (auto-selected on country, and editable) */}
                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="currency"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Currency *
                  </label>

                  <input
                    id="currency"
                    name="currency"
                    className={getInputClass(fieldErrors.currency)}
                    value={formData.currency}
                    onChange={handleChange}
                    placeholder="e.g. INR"
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="officeStartTime"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Office Start Time *
                  </label>

                  <input
                    id="officeStartTime"
                    name="officeStartTime"
                    type="time"
                    className={getInputClass(fieldErrors.officeStartTime)}
                    value={formData.officeStartTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col min-w-0 gap-2">
                  <label
                    htmlFor="officeEndTime"
                    className="text-[13px] font-medium text-[#cbd2e3]"
                  >
                    Office End Time *
                  </label>

                  <input
                    id="officeEndTime"
                    name="officeEndTime"
                    type="time"
                    className={getInputClass(fieldErrors.officeEndTime)}
                    value={formData.officeEndTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#30364d]">
                <h2 className="m-0 text-[16px] font-semibold text-white">
                  Working Days *
                </h2>

                <button
                  type="button"
                  className="py-1 px-3 border border-[#30364d] rounded-md bg-[#20253a] text-[#9fc5ff] text-[12px] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#283252] hover:border-[#5969a8]"
                  onClick={handleSelectAllDays}
                >
                  {formData.workingDays.length === DAYS.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div
                className={`grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-3 p-3.5 border rounded-lg bg-[#0f1322] ${
                  fieldErrors.workingDays
                    ? "field-error border-[#ef4444]"
                    : "border-[#30364d]"
                }`}
              >
                {DAYS.map((day) => {
                  const isChecked = formData.workingDays.includes(day);
                  return (
                    <label
                      key={day}
                      className="flex items-center gap-2.5 text-[13px] text-[#cbd2e3] cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDayChange(day)}
                        className="w-4 h-4 accent-[#5865f2] rounded cursor-pointer"
                      />
                      <span>{day}</span>
                    </label>
                  );
                })}
              </div>
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
              : "Create Company"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;
