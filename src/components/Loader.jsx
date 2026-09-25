import React from "react";

const Loader = ({ size = "default", text = "", fullScreen = false, className = "" }) => {
    return (
        <div className={`loader-container ${fullScreen ? "loader-fullscreen" : ""} ${className}`.trim()}>
            <div className={`spinner ${size !== "default" ? `spinner-${size}` : ""}`}></div>
            {text ? <span className="loader-text">{text}</span> : null}
        </div>
    );
};

export default Loader;
