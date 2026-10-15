import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Agar user pehle se logged-in hai, to login page ke bajaye dashboard par bhejo
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        try {
            await login(formData.email, formData.password);
            const redirectTo = location.state?.from?.pathname || "/dashboard";
            navigate(redirectTo, { replace: true });
        } catch (err) {
            const message =
                err.response?.data?.message || "Login failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] p-4">
            <div className="w-full max-w-[400px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8">
                <h1 className="text-[22px] font-bold text-[#1a1a2e] mb-1 text-center">Welcome back</h1>
                <p className="text-[14px] text-[#6b7280] text-center mb-6">Sign in to your Project Management account</p>

                {error && <div className="bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] rounded-lg py-2 px-3 text-[13px] mb-4">{error}</div>}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-[13px] font-semibold text-[#374151]">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="py-2.5 px-3 border border-[#d1d5db] rounded-lg text-[14px] text-gray-900 outline-none transition-colors duration-150 focus:border-[#4f46e5]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-[13px] font-semibold text-[#374151]">Password</label>
                        <div className="relative w-full">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full py-2.5 pl-3 pr-10 border border-[#d1d5db] rounded-lg text-[14px] text-gray-900 outline-none transition-colors duration-150 focus:border-[#4f46e5]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827] transition-colors duration-150 p-1 cursor-pointer bg-transparent border-0 flex items-center justify-center focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-1 p-[11px] border-none rounded-lg bg-[#4f46e5] text-white text-[14px] font-semibold cursor-pointer transition-colors duration-150 hover:not-disabled:bg-[#4338ca] disabled:bg-[#a5a6f6] disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;