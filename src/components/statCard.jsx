import "./StatCard.css";

const StatCard = ({ label, value }) => {
    return (
        <div className="stat-card">
            <p className="stat-value">{value ?? "—"}</p>
            <p className="stat-label">{label}</p>
        </div>
    );
};

export default StatCard;