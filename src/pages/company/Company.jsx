import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as companyService from "../../services/companyService";
import Loader from "../../components/Loader";

const PAGE_SIZE = 10;

const Companies = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [viewCompany, setViewCompany] = useState(null);
  const [deleteCompanyTarget, setDeleteCompanyTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await companyService.getCompanies();
      setCompanies(data.companies || data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not load companies.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const term = search.toLowerCase();

    return companies.filter((c) => {
      return (
        !term ||
        c.companyName?.toLowerCase().includes(term) ||
        c.companyCode?.toLowerCase().includes(term) ||
        c.officialEmail?.toLowerCase().includes(term)
      );
    });
  }, [companies, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / PAGE_SIZE),
  );

  const paginatedCompanies = filteredCompanies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteCompanyTarget) return;

    try {
      await companyService.deleteCompany(deleteCompanyTarget._id);

      setCompanies((prev) =>
        prev.filter((c) => c._id !== deleteCompanyTarget._id),
      );

      if (viewCompany?._id === deleteCompanyTarget._id) {
        setViewCompany(null);
      }

      setDeleteCompanyTarget(null);
      setDeleteError("");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Could not delete company.",
      );
    }
  };

  return (
    <div className="w-full p-[30px] max-md:p-5 box-border">
      <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
        <h1 className="m-0 text-[28px] font-bold text-white">Companies</h1>

        <button
          className="border-0 rounded-lg py-[11px] px-[18px] bg-[#5865f2] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#4752c4] transition-colors"
          onClick={() => navigate("/companies/create")}
        >
          + Add Company
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 max-md:flex-col max-md:items-stretch">
        <input
          type="text"
          placeholder="Search by name, code, or email..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1 max-w-none h-[42px] px-[14px] border border-[#30364d] rounded-lg bg-[#171b2e] text-white text-[14px] outline-none box-border placeholder:text-[#7f8aa5] focus:border-[#5969a8] max-md:w-full transition-colors"
        />
      </div>

      {loading && <Loader />}

      {error && <p className="text-[#ff8e9a]">{error}</p>}

      {!loading && !error && (
        <>
          {paginatedCompanies.length === 0 ? (
            <p className="text-[#8f9bb3]">No companies found.</p>
          ) : (
            <div className="w-full overflow-x-auto bg-[#171b2e] border border-[#282e45] rounded-[10px]">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      CompanyId
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      Name
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      Type
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      Industry
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      Email
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      City
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      Status
                    </th>
                    <th className="border-none p-[15px] text-left text-[12px] font-semibold text-[#8f9bb3] uppercase tracking-[0.06em] border-b border-[#282e45] whitespace-nowrap bg-transparent">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCompanies.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-[#1c2136] transition-colors last:[&>td]:border-b-0"
                    >
                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                        {c.companyId || "-"}
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap capitalize">
                        {c.companyName || "-"}
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap capitalize">
                        {c.companyType || "-"}
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap capitalize">
                        {c.industry || "-"}
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                        {c.officialEmail || "-"}
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap capitalize">
                        {c.city || "-"}
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                        <span
                          className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${
                            c.status === "active"
                              ? "bg-[#1c3a2e] text-[#7fe3a8]"
                              : c.status === "inactive"
                                ? "bg-[#40252c] text-[#ff9da9]"
                                : "bg-[#3d3520] text-[#f2c96d]"
                          }`}
                        >
                          {c.status || "-"}
                        </span>
                      </td>

                      <td className="border-none p-[15px] text-left text-[13px] text-[#e8ebf5] border-b border-[#282e45] whitespace-nowrap">
                        <div className="flex items-center gap-[7px]">
                          <button
                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer bg-[#222942] text-[#dbe1f2] hover:bg-[#303958] transition-colors"
                            onClick={() => setViewCompany(c)}
                          >
                            View
                          </button>

                          <button
                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer bg-[#26354a] text-[#9fc5ff] font-medium hover:bg-[#30445f] transition-colors"
                            onClick={() => navigate(`/companies/edit/${c._id}`)}
                          >
                            Edit
                          </button>

                          <button
                            className="border-none rounded-[6px] py-[7px] px-[11px] text-[12px] cursor-pointer bg-[#40252c] text-[#ff9da9] hover:bg-[#563039] transition-colors"
                            onClick={() => {
                              setDeleteCompanyTarget(c);
                              setDeleteError("");
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredCompanies.length > 0 && (
            <div className="flex items-center justify-center gap-[18px] mt-5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
              >
                Previous
              </button>

              <span className="text-[13px] font-medium text-[#8f9bb3]">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="py-2 px-[14px] border border-[#30364d] rounded-[7px] bg-[#171b2e] text-[#e8ebf5] cursor-pointer hover:not-disabled:bg-[#222942] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {viewCompany && (
        <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">
          <div
            className="w-full max-w-[650px] max-h-[85vh] overflow-y-auto bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
              <h2 className="m-0 text-white text-[18px] font-semibold">
                Company Details
              </h2>

              <button
                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer hover:bg-[#222942] hover:text-white flex items-center justify-center transition-colors leading-none"
                onClick={() => setViewCompany(null)}
              >
                ×
              </button>
            </div>

            <div className="p-[1px] grid grid-cols-2 max-md:grid-cols-1 gap-[1px] bg-[#282e45]">
              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Company Code
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.companyCode || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Company Name
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.companyName || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Type
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.companyType || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Industry
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.industry || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Official Email
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.officialEmail || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Contact Number
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.contactNumber || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Website
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.website || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Address
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.addressLine1 || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  City
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.city || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  State
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.state || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Country
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words capitalize">
                  {viewCompany.country || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Pincode
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.pincode || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Time Zone
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.timeZone || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Currency
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.currency || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Working Days
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {Array.isArray(viewCompany.workingDays)
                    ? viewCompany.workingDays.join(", ")
                    : viewCompany.workingDays || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Office Hours
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.officeStartTime || "-"} to{" "}
                  {viewCompany.officeEndTime || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 bg-[#171b2e]">
                <strong className="text-[#7f8aa5] text-[12px] font-semibold">
                  Status
                </strong>
                <span className="text-[#eef1f8] text-[14px] break-words">
                  {viewCompany.status ? (
                    <span
                      className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize ${
                        viewCompany.status === "active"
                          ? "bg-[#1c3a2e] text-[#7fe3a8]"
                          : viewCompany.status === "inactive"
                            ? "bg-[#40252c] text-[#ff9da9]"
                            : "bg-[#3d3520] text-[#f2c96d]"
                      }`}
                    >
                      {viewCompany.status}
                    </span>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteCompanyTarget && (
        <div className="fixed inset-0 bg-[#05070f]/75 flex items-center justify-center z-[1000] p-5">
          <div
            className="w-full max-w-[450px] bg-[#171b2e] border border-[#30364d] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-5 px-[22px] border-b border-[#282e45]">
              <h2 className="m-0 text-white text-[18px] font-semibold">
                Delete Company
              </h2>

              <button
                className="w-8 h-8 border-none rounded-[6px] bg-transparent text-[#8f9bb3] text-[24px] cursor-pointer hover:bg-[#222942] hover:text-white flex items-center justify-center transition-colors leading-none"
                onClick={() => setDeleteCompanyTarget(null)}
              >
                ×
              </button>
            </div>

            <div className="p-[22px]">
              <p className="text-[#dfe3ee] text-[14px] leading-[1.6] m-0">
                Are you sure you want to delete{" "}
                <strong className="text-white font-semibold">
                  {deleteCompanyTarget.companyName}
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
                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#282e45] text-[#dfe3ee] hover:bg-[#343b55] transition-colors"
                onClick={() => setDeleteCompanyTarget(null)}
              >
                Cancel
              </button>

              <button
                className="py-[9px] px-4 rounded-[7px] border-none cursor-pointer text-[13px] bg-[#a83d4c] text-white hover:bg-[#c04b5b] transition-colors"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
