import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="py-2.5 px-3 border border-[#d1d5db] rounded-lg text-[14px] text-gray-900 outline-none transition-colors duration-150 focus:border-[#4f46e5]"
                        />
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