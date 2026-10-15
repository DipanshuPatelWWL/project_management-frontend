import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import * as auditLogService from "../../services/auditLogService";
import AuditLogFilters from "../../components/auditLogs/AuditLogFilters";
import AuditLogActions from "../../components/auditLogs/AuditLogActions";
import AuditLogTable from "../../components/auditLogs/AuditLogTable";
import AuditLogDetails from "./AuditLogDetails";
import Loader from "../../components/Loader";

const AuditLogs = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "SuperAdmin";

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: "",
        action: "",
        entityType: "",
        startDate: "",
        endDate: "",
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const cleanParams = {};
            if (filters.page) cleanParams.page = filters.page;
            if (filters.limit) cleanParams.limit = filters.limit;
            if (filters.search) cleanParams.search = filters.search;
            if (filters.action) cleanParams.action = filters.action;
            if (filters.entityType) cleanParams.entityType = filters.entityType;
            if (filters.startDate) cleanParams.startDate = filters.startDate;
            if (filters.endDate) cleanParams.endDate = filters.endDate;

            const res = await auditLogService.getAuditLogs(cleanParams);

            if (res?.success) {
                setLogs(Array.isArray(res.data) ? res.data : []);
                setPagination(
                    res.pagination || {
                        page: filters.page,
                        limit: filters.limit,
                        total: res.data?.length || 0,
                        totalPages: 1,
                    }
                );
            } else {
                setLogs([]);
            }
        } catch (err) {
            console.error("Failed to fetch audit logs:", err);
            setError(err.response?.data?.message || "Failed to fetch audit logs");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            search: "",
            action: "",
            entityType: "",
            startDate: "",
            endDate: "",
        });
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleLimitChange = (newLimit) => {
        setFilters((prev) => ({
            ...prev,
            limit: newLimit,
            page: 1,
        }));
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm("Are you sure you want to permanently delete this audit log record?")) {
            return;
        }

        try {
            await auditLogService.deleteAuditLog(logId);
            fetchLogs();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete log");
        }
    };

    // Statistics counts
    const totalLogsCount = pagination.total || logs.length;
    const createLogsCount = logs.filter((l) => (l.action || "").toUpperCase() === "CREATE").length;
    const updateLogsCount = logs.filter((l) =>
        ["UPDATE", "STATUS_CHANGE", "ROLE_CHANGE", "PASSWORD_CHANGE"].includes((l.action || "").toUpperCase())
    ).length;
    const securityLogsCount = logs.filter((l) =>
        ["DELETE", "LOGIN", "LOGIN_FAILED", "LOGOUT"].includes((l.action || "").toUpperCase())
    ).length;

    return (
        <div className="w-full p-[30px] max-md:p-5 box-border">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-[25px] max-md:flex-col max-md:items-start max-md:gap-[15px]">
                <div>
                    <h1 className="m-0 text-[28px] font-bold text-white">Audit Logs</h1>
                    <p className="m-0 mt-1.5 text-[#8f9bb3] text-[14px]">
                        Track security events, data changes, and user activities across your organization.
                    </p>
                </div>

                <AuditLogActions
                    onRefresh={fetchLogs}
                    loading={loading}
                />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-[18px] mb-[25px]">
                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Total Audit Logs</span>
                    <strong className="text-white text-[26px] font-bold">{totalLogsCount}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Create Events</span>
                    <strong className="text-white text-[26px] font-bold">{createLogsCount}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Updates & Changes</span>
                    <strong className="text-white text-[26px] font-bold">{updateLogsCount}</strong>
                </div>

                <div className="bg-[#171b2e] border border-[#282e45] rounded-[10px] p-5">
                    <span className="block text-[#8f9bb3] text-[13px] mb-2">Auth & Security</span>
                    <strong className="text-white text-[26px] font-bold">{securityLogsCount}</strong>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-[#ff8e9a] bg-[#2a1518] border border-[#7f1d1d] rounded-lg py-3 px-4 mb-5 text-[14px]">
                    {error}
                </p>
            )}

            {/* Filters Bar */}
            <AuditLogFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            {/* Table / Loader */}
            {loading ? (
                <Loader />
            ) : (
                <AuditLogTable
                    logs={logs}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                    onViewDetails={setSelectedLog}
                    onDeleteLog={handleDeleteLog}
                    isSuperAdmin={isSuperAdmin}
                />
            )}

            {/* View Details Modal */}
            {selectedLog && (
                <AuditLogDetails
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                    onDelete={handleDeleteLog}
                    isSuperAdmin={isSuperAdmin}
                />
            )}
        </div>
    );
};

export default AuditLogs;
