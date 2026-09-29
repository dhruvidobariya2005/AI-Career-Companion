import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = formData.email.trim().toLowerCase();
    const rawPassword = formData.password;

    if (!cleanEmail || !rawPassword) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password: rawPassword,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        navigate("/dashboard");
      } else {
        setError("Login succeeded but no access token was returned.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (!err.response) {
        setError("Cannot connect to backend server. Please make sure the backend is running on port 5000.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial-glow px-4 relative overflow-hidden bg-[#f8fafc]">
      {/* Decorative Drift Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-300/35 blur-[120px] pointer-events-none animate-drift"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-300/30 blur-[120px] pointer-events-none animate-drift-reverse"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl relative border border-slate-200/60 bg-white/70">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200/50 mb-4 animate-pulse-glow">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2 text-sm text-center">
            Sign in to continue your personalized AI-driven career development.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-xl glass-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 active:scale-98 disabled:opacity-70 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <span className="border-2 border-t-transparent border-white rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-200/80 pt-6">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-600 hover:text-purple-500 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
