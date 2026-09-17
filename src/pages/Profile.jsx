import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiUser, FiBriefcase, FiMapPin, FiCalendar } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const initials =
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

    return (
        <div className="profile-page">

            <div className="profile-page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>View your personal and employment information</p>
                </div>

                <button
                    className="profile-back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    <FiArrowLeft />
                    Back to Dashboard
                </button>
            </div>

            <div className="profile-content">

                <div className="profile-main-card">

                    <div className="profile-cover"></div>

                    <div className="profile-main-info">

                        <div className="profile-avatar">
                            {initials || "U"}
                        </div>

                        <div className="profile-name-section">
                            <h2>{fullName || "User"}</h2>
                            <p>{user.role || "User"}</p>
                        </div>

                    </div>

                </div>

                <div className="profile-details-card">

                    <div className="profile-card-header">
                        <h2>Personal Information</h2>
                    </div>

                    <div className="profile-details-grid">

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiUser />
                            </div>

                            <div>
                                <span>First Name</span>
                                <strong>{user.firstName || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiUser />
                            </div>

                            <div>
                                <span>Last Name</span>
                                <strong>{user.lastName || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiMail />
                            </div>

                            <div>
                                <span>Email</span>
                                <strong>{user.email || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiPhone />
                            </div>

                            <div>
                                <span>Phone</span>
                                <strong>{user.phone || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiUser />
                            </div>

                            <div>
                                <span>Employee ID</span>
                                <strong>{user.employeeId || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiBriefcase />
                            </div>

                            <div>
                                <span>Role</span>
                                <strong>{user.role || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiBriefcase />
                            </div>

                            <div>
                                <span>Designation</span>
                                <strong>{user.designation || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiBriefcase />
                            </div>

                            <div>
                                <span>Department</span>
                                <strong>{user.department || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiBriefcase />
                            </div>

                            <div>
                                <span>Employment Type</span>
                                <strong>{user.employmentType || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiMapPin />
                            </div>

                            <div>
                                <span>Work Location</span>
                                <strong>{user.workLocation || "-"}</strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiCalendar />
                            </div>

                            <div>
                                <span>Joining Date</span>
                                <strong>
                                    {user.joiningDate
                                        ? new Date(
                                              user.joiningDate
                                          ).toLocaleDateString()
                                        : "-"}
                                </strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <div className="profile-detail-icon">
                                <FiUser />
                            </div>

                            <div>
                                <span>Status</span>
                                <strong>{user.status || "-"}</strong>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Profile;