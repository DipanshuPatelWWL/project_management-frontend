import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiCamera,
} from "react-icons/fi";
import * as userService from "../services/userService";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const res = await userService.updateProfileImage(formData);
      if (res.user) {
        setUser(res.user);
        setUploadSuccess("Profile picture updated successfully!");
        setTimeout(() => setUploadSuccess(""), 4000);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="w-full min-h-full p-[30px] max-md:p-5 box-border">
      <div className="flex justify-between items-center mb-[25px] text-white max-md:flex-col max-md:items-start max-md:gap-[15px]">
        <div>
          <h1 className="m-0 text-[28px] font-bold">My Profile</h1>
          <p className="m-0 mt-1.5 text-[14px] text-[#8f9bb3]">View your personal and employment information</p>
        </div>

        <button
          className="flex items-center gap-2 py-2.5 px-4 border border-[#30364d] rounded-lg bg-[#171b2e] text-[#e8ebf5] cursor-pointer text-[14px] hover:bg-[#20263d] transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-[#171b2e] border border-[#282e45] rounded-xl overflow-hidden">
          <div className="h-[120px] bg-gradient-to-br from-[#20263d] to-[#171b2e]"></div>

          <div className="flex items-center gap-5 px-[30px] pb-[25px] max-md:px-5 max-sm:flex-col max-sm:items-start">
            <div className="relative inline-block">
              <div
                className="w-[90px] h-[90px] -mt-[45px] rounded-full bg-[#303958] border-[5px] border-[#171b2e] flex items-center justify-center text-[28px] font-bold text-white relative overflow-hidden shadow-md select-none"
              >
                {user.profileImage ? (
                  <img
                    src={
                      user.profileImage.startsWith("http")
                        ? user.profileImage
                        : `http://localhost:5000${user.profileImage}`
                    }
                    alt={fullName || "User"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{initials || "U"}</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="pt-[15px] flex flex-col gap-2">
              <div>
                <h2 className="m-0 text-[22px] text-white font-semibold capitalize">
                  {fullName || "User"}
                </h2>
                <p className="m-0 mt-0.5 text-[#8f9bb3] text-[14px] capitalize">
                  {user.role || "User"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploading}
                className="inline-flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-[12px] font-medium cursor-pointer transition-all duration-200 shadow-sm active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed w-fit"
              >
                <FiCamera className="text-[14px]" />
                <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
              </button>
            </div>
          </div>

          {uploading && (
            <div className="py-2 px-4 rounded-[6px] text-[13px] font-medium mx-[30px] mb-[15px] bg-[#5865f2]/15 text-[#a5b4fc] border border-[#5865f2]/30">
              Uploading profile picture...
            </div>
          )}
          {uploadSuccess && (
            <div className="py-2 px-4 rounded-[6px] text-[13px] font-medium mx-[30px] mb-[15px] bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
              {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div className="py-2 px-4 rounded-[6px] text-[13px] font-medium mx-[30px] mb-[15px] bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30">
              {uploadError}
            </div>
          )}
        </div>

        <div className="bg-[#171b2e] border border-[#282e45] rounded-xl overflow-hidden">
          <div className="py-5 px-[25px] border-b border-[#282e45]">
            <h2 className="m-0 text-[18px] text-white font-semibold">Personal Information</h2>
          </div>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[1px] bg-[#282e45]">
            {/* First Name */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiUser />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">First Name</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.firstName || "-"}
                </strong>
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiUser />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Last Name</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.lastName || "-"}
                </strong>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiMail />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Email</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold lowercase">
                  {user.email || "-"}
                </strong>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiPhone />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Phone</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold">
                  {user.phone || "-"}
                </strong>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiUser />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Employee ID</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold uppercase">
                  {user.employeeId || "-"}
                </strong>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiBriefcase />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Company</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.company?.companyName || user.company || "-"}
                </strong>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiBriefcase />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Role</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.role || "-"}
                </strong>
              </div>
            </div>

            {/* Designation */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiBriefcase />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Designation</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.designation || "-"}
                </strong>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiBriefcase />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Department</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.department || "-"}
                </strong>
              </div>
            </div>

            {/* Employment Type */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiBriefcase />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Employment Type</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.employmentType || "-"}
                </strong>
              </div>
            </div>

            {/* Work Location */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiMapPin />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Work Location</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.workLocation || "-"}
                </strong>
              </div>
            </div>

            {/* Joining Date */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiCalendar />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Joining Date</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold">
                  {user.joiningDate
                    ? new Date(user.joiningDate).toLocaleDateString()
                    : "-"}
                </strong>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-[15px] p-5 bg-[#171b2e] col-span-2 max-md:col-span-1">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[#222942] flex items-center justify-center text-[#aeb8d0] text-[18px]">
                <FiUser />
              </div>

              <div className="flex flex-col gap-[5px] min-w-0">
                <span className="text-[12px] text-[#7f8aa5] font-medium">Status</span>
                <strong className="text-[14px] text-[#eef1f8] break-words font-semibold capitalize">
                  {user.status || "-"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
