import React from "react";
import { FiUser, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://project-management-backend-sen3.onrender.com";

const getProfileImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${cleanPath}`;
};

const EmployeeAvatar = ({ image, name, size = "w-9 h-9", textSize = "text-[12px]" }) => {
    const [imgError, setImgError] = React.useState(false);
    const initial = (name || "E").charAt(0).toUpperCase();
    const url = !imgError && image ? getProfileImageUrl(image) : null;

    if (url) {
        return (
            <img
                src={url}
                alt={name}
                onError={() => setImgError(true)}
                className={`${size} rounded-full object-cover border border-[#2d3748] shrink-0`}
            />
        );
    }

    return (
        <div
            className={`${size} rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold ${textSize} flex items-center justify-center shrink-0`}
        >
            {initial}
        </div>
    );
};

const EmployeeReportTable = ({ records = [], onSelectEmployee, selectedEmployeeId = "" }) => {
    if (!records || records.length === 0) {
        return (
            <div className="bg-[#141829] border border-[#232a42] rounded-2xl p-8 text-center text-[#7f8aa5]">
                No employee records found matching current criteria.
            </div>
        );
    }

    return (
        <div className="bg-[#141829] border border-[#232a42] rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#232a42] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                    <FiUser className="text-[#a855f7]" /> Employee Performance Index
                </h3>
                <span className="text-[12px] text-[#94a3b8]">
                    {records.length} {records.length === 1 ? "Employee" : "Employees"} Analyzed
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                    <thead>
                        <tr className="bg-[#0e1222] text-[#94a3b8] uppercase text-[11px] font-semibold tracking-wider border-b border-[#232a42]">
                            <th className="py-3.5 px-4">Employee</th>
                            <th className="py-3.5 px-4">Designation / Role</th>
                            <th className="py-3.5 px-4 text-center">Tasks (Done/Total)</th>
                            <th className="py-3.5 px-4 text-center">Completion Rate</th>
                            <th className="py-3.5 px-4 text-center">Bugs Resolved</th>
                            <th className="py-3.5 px-4 text-center">Hours Worked</th>
                            <th className="py-3.5 px-4 text-center">Overtime</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e253b]">
                        {records.map((item) => {
                            const emp = item.employee || item;
                            const rep = item.report || item;
                            const isSelected = selectedEmployeeId === emp._id;

                            const completionRate = rep.taskCompletionRate ?? (
                                rep.totalAssignedTasks > 0
                                    ? Math.round((rep.completedTasks / rep.totalAssignedTasks) * 100)
                                    : 0
                            );

                            const name = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Employee";

                            return (
                                <tr
                                    key={emp._id || emp.email}
                                    className={`transition-colors duration-150 ${
                                        isSelected
                                            ? "bg-[#1c223c] hover:bg-[#202745]"
                                            : "hover:bg-[#191f36]"
                                    }`}
                                >
                                    {/* Name & Avatar */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <EmployeeAvatar image={emp.profileImage} name={name} />
                                            <div>
                                                <div className="font-semibold text-white leading-tight">
                                                    {name}
                                                </div>
                                                <div className="text-[11px] text-[#64748b]">
                                                    {emp.email} {emp.employeeId ? `• ${emp.employeeId}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Designation & Role */}
                                    <td className="py-3.5 px-4">
                                        <div className="text-[#e2e8f0] font-medium">
                                            {emp.designation || emp.role || "Developer"}
                                        </div>
                                        <div className="text-[11px] text-[#64748b]">
                                            {emp.department || "Engineering"}
                                        </div>
                                    </td>

                                    {/* Tasks */}
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="font-bold text-[#34d399]">
                                            {rep.completedTasks || 0}
                                        </span>
                                        <span className="text-[#64748b]"> / {rep.totalAssignedTasks || 0}</span>
                                    </td>

                                    {/* Completion Rate */}
                                    <td className="py-3.5 px-4 text-center">
                                        <span
                                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                completionRate >= 80
                                                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-700/50"
                                                    : completionRate >= 50
                                                    ? "bg-amber-950/50 text-amber-400 border-amber-700/50"
                                                    : "bg-rose-950/50 text-rose-400 border-rose-700/50"
                                            }`}
                                        >
                                            {completionRate}%
                                        </span>
                                    </td>

                                    {/* Bugs */}
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="font-bold text-[#38bdf8]">
                                            {rep.resolvedBugs || 0}
                                        </span>
                                        <span className="text-[#64748b]"> / {rep.totalAssignedBugs || 0}</span>
                                    </td>

                                    {/* Hours Worked */}
                                    <td className="py-3.5 px-4 text-center font-bold text-white">
                                        {rep.totalWorkingHours || 0}h
                                    </td>

                                    {/* Overtime */}
                                    <td className="py-3.5 px-4 text-center">
                                        {rep.overtime > 0 ? (
                                            <span className="text-amber-400 font-bold">
                                                +{rep.overtime}h
                                            </span>
                                        ) : (
                                            <span className="text-[#64748b]">0h</span>
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4 text-right">
                                        {onSelectEmployee && (
                                            <button
                                                type="button"
                                                onClick={() => onSelectEmployee(emp._id)}
                                                className="px-3 py-1 rounded-md text-[12px] font-medium bg-[#1e2640] hover:bg-[#2a365b] text-[#93c5fd] border border-[#324068] transition-colors cursor-pointer"
                                            >
                                                Details
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeReportTable;
