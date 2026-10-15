import React from "react";
import { FiRefreshCw } from "react-icons/fi";

const AuditLogActions = ({ onRefresh, loading }) => {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onRefresh}
                disabled={loading}
                className="border border-[#30364d] rounded-lg py-[11px] px-[18px] bg-[#171b2e] text-[#8f9bb3] text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#222942] hover:text-white hover:border-[#454d6e] flex items-center gap-2 disabled:opacity-50"
                title="Refresh Logs"
            >
                <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#5865f2]" : ""}`} />
                <span>Refresh</span>
            </button>
        </div>
    );
};

export default AuditLogActions;
