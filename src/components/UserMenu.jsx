import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const UserMenu = () => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Close the dropdown when clicking anywhere outside it
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
    };

    if (!user) return null;

    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer py-1 px-2"
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[13px] font-bold">
                    {initials || "U"}
                </span>
                <span className="text-[14px] text-[#1a1a2e]">
                    {user.firstName} {user.lastName}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-11 bg-white border border-[#ddd] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] min-w-[180px] z-20">
                    <div className="py-3 px-3.5 border-b border-[#eee]">
                        <p className="text-[14px] font-semibold m-0 text-gray-800">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[12px] text-[#888] m-0 mt-1">{user.role}</p>
                    </div>
                    <button
                        className="w-full text-left py-2.5 px-3.5 bg-transparent border-none cursor-pointer text-[14px] hover:bg-[#f4f4f4] text-gray-700"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;