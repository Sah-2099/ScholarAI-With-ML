import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { BrainCircuit, Mail, Lock, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (password.length < 6) {
    setError("Password must be at least 6 characters long.");
    return;
  }

  setError("");
  setLoading(true);

  try {
    await authService.register(username, email, password);

    toast.success("Registration successful! Please login.");
    navigate("/login"); // ✅ redirect after success

  } catch (err) {
    // ✅ Correct way (VERY IMPORTANT)
    const message = err.message || "Failed to register. Please try again.";

    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-30" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl p-10">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg mb-6">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 mb-2">
              Create an account
            </h1>
            <p className="text-slate-500 text-sm">
              Start your AI-powered learning experience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-3.5 h-5 w-5 ${
                  focusedField === "username" ? "text-emerald-500" : "text-slate-400"
                }`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="john_doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-3.5 h-5 w-5 ${
                  focusedField === "email" ? "text-emerald-500" : "text-slate-400"
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-3.5 h-5 w-5 ${
                  focusedField === "password" ? "text-emerald-500" : "text-slate-400"
                }`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? "Creating account..." : <>Create account <ArrowRight size={16} /></>}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-600">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
