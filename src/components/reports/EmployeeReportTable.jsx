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
            <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-8 text-center text-[#8f9bb3]">
                No employee records found matching current criteria.
            </div>
        );
    }

    return (
        <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#282e45] flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2 m-0">
                    <FiUser className="text-[#a855f7]" /> Employee Performance Index
                </h3>
                <span className="text-[12px] text-[#8f9bb3]">
                    {records.length} {records.length === 1 ? "Employee" : "Employees"} Analyzed
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                    <thead>
                        <tr className="!bg-transparent !text-[#8f9bb3] uppercase text-[12px] font-semibold tracking-[0.06em] border-b border-[#282e45]">
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
                    <tbody className="divide-y divide-[#282e45]">
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
                                            ? "bg-[#1f243d]"
                                            : "hover:bg-[#1f243d]"
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
                                                <div className="text-[11px] text-[#8f9bb3] mt-0.5">
                                                    {emp.email} {emp.employeeId ? `• ${emp.employeeId}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Designation & Role */}
                                    <td className="py-3.5 px-4">
                                        <div className="text-[#dfe3ee] font-medium">
                                            {emp.designation || emp.role || "Developer"}
                                        </div>
                                        <div className="text-[11px] text-[#8f9bb3] mt-0.5">
                                            {emp.department || "Engineering"}
                                        </div>
                                    </td>

                                    {/* Tasks */}
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="font-bold text-[#34d399]">
                                            {rep.completedTasks || 0}
                                        </span>
                                        <span className="text-[#8f9bb3]"> / {rep.totalAssignedTasks || 0}</span>
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
                                        <span className="text-[#8f9bb3]"> / {rep.totalAssignedBugs || 0}</span>
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
                                            <span className="text-[#8f9bb3]">0h</span>
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-4 text-right">
                                        {onSelectEmployee && (
                                            <button
                                                type="button"
                                                onClick={() => onSelectEmployee(emp._id)}
                                                className="px-3 py-1 rounded-[6px] text-[12px] font-semibold bg-[#282e45] hover:bg-[#343b55] text-[#82b4ff] transition-colors cursor-pointer"
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
