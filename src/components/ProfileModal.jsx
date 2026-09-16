import { useAuth } from "../context/AuthContext";
import "./ProfileModal.css";

const ProfileModal = ({ open, onClose }) => {
    const { user } = useAuth();

    if (!open || !user) return null;

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-modal-header">
                    <h2>My Profile</h2>
                    <button className="profile-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="profile-modal-avatar">
                    {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
                </div>

                <div className="profile-modal-body">
                    <div className="profile-detail-item">
                        <strong>Name</strong>
                        <span>
                            {user.firstName} {user.lastName}
                        </span>
                    </div>

                    <div className="profile-detail-item">
                        <strong>Email</strong>
                        <span>{user.email}</span>
                    </div>

                    <div className="profile-detail-item">
                        <strong>Role</strong>
                        <span>{user.role}</span>
                    </div>

                    {user.employeeId && (
                        <div className="profile-detail-item">
                            <strong>Employee ID</strong>
                            <span>{user.employeeId}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;