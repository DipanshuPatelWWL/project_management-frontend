import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./UserMenu.css";

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
        <div className="user-menu" ref={menuRef}>
            <button className="user-menu-trigger" onClick={() => setOpen((prev) => !prev)}>
                <span className="user-avatar">{initials || "U"}</span>
                <span className="user-name">
                    {user.firstName} {user.lastName}
                </span>
            </button>

            {open && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-info">
                        <p className="user-menu-fullname">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="user-menu-role">{user.role}</p>
                    </div>
                    <button className="user-menu-item" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;