import React from "react";

const NotificationBadge = ({ count = 0, showZero = false, size = "md", className = "" }) => {
    if (count <= 0 && !showZero) return null;

    const sizeClasses = {
        sm: "text-[10px] min-w-[16px] h-4 px-1 leading-4",
        md: "text-[11px] min-w-[20px] h-5 px-1.5 leading-5",
        lg: "text-[12px] min-w-[24px] h-6 px-2 leading-6 font-bold",
    };

    const displayCount = count > 99 ? "99+" : count;

    return (
        <span
            className={`inline-flex items-center justify-center font-semibold rounded-full bg-[#ef4444] text-white shadow-sm transition-transform duration-200 ${
                sizeClasses[size] || sizeClasses.md
            } ${className}`}
        >
            {displayCount}
        </span>
    );
};

export default NotificationBadge;
