import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as clientService from "../../services/clientService";
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
const readonlyClass =
  "cursor-not-allowed !bg-[#111522] !text-[#8f9ab5] !border-[#282e45]";
const getInputClass = (hasError, isReadonly = false) => {
  let cls = inputBaseClass;
  if (isReadonly) cls += ` ${readonlyClass}`;
  if (hasError) cls += " field-error";
  return cls;
};

const STATUS_OPTIONS = ["active", "inactive", "on-leave"];

const initialFormState = {
  clientId: "",
  ClientName: "",
  company: "",
  email: "",
  phone: "",
  designation: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  status: "active",
};

const CreateClient = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const isEditMode = Boolean(clientId);

  const [formData, setFormData] = useState(initialFormState);

  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState("");

  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");

      try {
        const data = await companyService.getCompanies();

        setCompanies(data.companies || data || []);
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

  // NEW CHANGE: Load next Client ID from backend
  const loadNextClientId = async () => {
    try {
      const data = await clientService.getClients();

      if (data?.nextClientId) {
        setFormData((prev) => ({
          ...prev,
          clientId: data.nextClientId,
        }));
      }
    } catch (err) {
      console.error("Failed to load next Client ID:", err);
    }
  };

  useEffect(() => {
    if (isEditMode) return;

    // NEW CHANGE: Get preview Client ID from existing GET API
    loadNextClientId();
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchClient = async () => {
      setPageLoading(true);
      setError("");

      try {
        const data = await clientService.getClientById(clientId);
        const client = data.client || data;

        setFormData({
          clientId: client.clientId || "",
          ClientName: client.ClientName || "",
          company: client.company || "",
          email: client.email || "",
          phone: client.phone || "",
          designation: client.designation || "",
          address: client.address || "",
          country: client.country || "",
          state: client.state || "",
          city: client.city || "",
          pincode: client.pincode || "",
          status: client.status || "active",
        });
      } catch (err) {
        const message = err.response?.data?.message || "Could not load client.";

        setError(message);
      } finally {
        setPageLoading(false);
      }
    };

    fetchClient();
  }, [isEditMode, clientId]);

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

  const handleCountryChange = (e) => {
    const selectedCountryName = e.target.value;
    const countryObj = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === selectedCountryName.trim().toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      country: countryObj ? countryObj.name : selectedCountryName,
      state: "",
      city: "",
      pincode: "",
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.country;
      delete next.state;
      delete next.city;
      delete next.pincode;
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
    if (name === "phone") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pincode") {
      const isIndia =
        !formData.country || formData.country.toLowerCase() === "india";
      if (isIndia) {
        sanitizedValue = value.replace(/\D/g, "").slice(0, 6);
      } else {
        sanitizedValue = value.slice(0, 10);
      }
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
      "ClientName",
      "company",
      "phone",
      "address",
      "country",
      "state",
      "city",
      "pincode",
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

    if (!isValidPhone(formData.phone)) {
      setFieldErrors({ phone: true });
      setError(VALIDATION_MESSAGES.phone);
      return;
    }

    if (
      formData.email &&
      formData.email.trim() &&
      !isValidEmail(formData.email)
    ) {
      setFieldErrors({ email: true });
      setError(VALIDATION_MESSAGES.email);
      return;
    }

    if (!isValidPincode(formData.pincode, formData.country)) {
      setFieldErrors({ pincode: true });
      setError(VALIDATION_MESSAGES.pincode);
      return;
    }

    setFieldErrors({});

    setSubmitting(true);

    try {
      if (isEditMode) {
        // EDIT MODE:
        // Existing clientId is kept unchanged
        await clientService.updateClient(clientId, formData);

        setSuccess("Client updated successfully.");
      } else {
        // NEW CHANGE:
        // Do not send preview Client ID to backend.
        // Backend generates the permanent Client ID.
        const { clientId: previewClientId, ...clientData } = formData;

        await clientService.createClient(clientData);

        setSuccess("Client created successfully.");

        // NEW CHANGE:
        // Reset form and load the next preview ID
        setFormData(initialFormState);

        await loadNextClientId();
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
      <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
        <div className="text-[#8f9bb3] py-10 text-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 box-border p-[30px] max-sm:p-5">
      <div className="w-full max-w-[1000px] mx-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex items-center justify-between p-[22px_28px] max-sm:p-[18px] bg-[#171b2e] border-b border-[#30364d] max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
          <h1 className="m-0 text-[22px] font-semibold text-white">
            {isEditMode ? "Edit Client" : "Add Client"}
          </h1>

          <button
            type="button"
            className="flex items-center justify-center py-[9px] px-4 border border-[#30364d] rounded-[7px] bg-[#20253a] text-[#e8ebf5] text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#292f47] hover:border-[#5969a8] max-sm:w-full"
            onClick={() => navigate("/clients")}
          >
            Back to Clients
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
            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="clientId"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Client ID
              </label>

              <input
                id="clientId"
                name="clientId"
                className={getInputClass(false, true)}
                value={formData.clientId}
                readOnly
              />
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="ClientName"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Client Name *
              </label>

              <input
                id="ClientName"
                name="ClientName"
                className={getInputClass(fieldErrors.ClientName)}
                value={formData.ClientName}
                onChange={handleChange}
                placeholder="e.g. John Carter"
              />
            </div>

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

                {companies.map((c) => (
                  <option
                    key={c._id}
                    value={c.companyName}
                    className="bg-[#171b2e] text-white"
                  >
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="email"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className={getInputClass(false)}
                value={formData.email}
                onChange={handleChange}
                placeholder="client@company.com"
              />
            </div>

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

            <div className="flex flex-col min-w-0 gap-2">
              <label
                htmlFor="designation"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Designation
              </label>

              <input
                id="designation"
                name="designation"
                className={getInputClass(false)}
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Procurement Head"
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
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    className="bg-[#171b2e] text-white"
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* NEW CHANGE: Separate Address field */}
            <div className="flex flex-col min-w-0 gap-2 col-span-2 max-md:col-span-1">
              <label
                htmlFor="address"
                className="text-[13px] font-medium text-[#cbd2e3]"
              >
                Address *
              </label>

              <input
                id="address"
                name="address"
                className={getInputClass(fieldErrors.address)}
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
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
                  {!formData.country ? "Select Country First" : "Select State"}
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

            {/* Pincode */}
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
                placeholder={
                  formData.country?.toLowerCase() === "india" ||
                  !formData.country
                    ? "6-digit pincode (e.g. 110001)"
                    : "Postal code (e.g. 94103)"
                }
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
                : "Add Client"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClient;
