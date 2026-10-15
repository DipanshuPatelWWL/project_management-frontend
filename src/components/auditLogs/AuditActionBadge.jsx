import React from "react";

const ACTION_CONFIG = {
    CREATE: "bg-[#1c3a2e] text-[#7fe3a8]",
    UPDATE: "bg-[#1f3554] text-[#9fc5ff]",
    DELETE: "bg-[#40252c] text-[#ff9da9]",
    LOGIN: "bg-[#34244d] text-[#cbb2fe]",
    LOGIN_FAILED: "bg-[#40252c] text-[#ff9da9]",
    LOGOUT: "bg-[#252a42] text-[#cbd2e3]",
    STATUS_CHANGE: "bg-[#3d3520] text-[#f2c96d]",
    ROLE_CHANGE: "bg-[#2b2554] text-[#a5b4fc]",
    PASSWORD_CHANGE: "bg-[#183c48] text-[#67e8f9]",
    DEFAULT: "bg-[#222942] text-[#cbd2e3]",
};

const AuditActionBadge = ({ action }) => {
    const key = (action || "DEFAULT").toUpperCase();
    const badgeClass = ACTION_CONFIG[key] || ACTION_CONFIG.DEFAULT;

    return (
        <span
            className={`inline-block py-1 px-2.5 rounded-[20px] text-[12px] font-semibold capitalize w-fit ${badgeClass}`}
        >
            {key.replace(/_/g, " ").toLowerCase()}
        </span>
    );
};

export default AuditActionBadge;
