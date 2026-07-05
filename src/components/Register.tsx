/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, Sparkles, Zap, Scale, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export default function Register({ onRegisterSuccess, onNavigateToLogin }: RegisterProps) {
  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Submits user registration payload to backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const data = await api.register(name, email, password);
      if (data.success) {
        setSuccess("Account created successfully! Redirecting you to login...");
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
      } else {
        setError(data.error || "Registration failed. Please check details.");
      }
    } catch (err: any) {
      console.error("Register component error:", err);
      setError(
        err.response?.data?.error || "Unable to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div 
        id="register-main-container" 
        className="w-full max-w-5xl bg-[#0b0f19]/80 border border-white/10 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/25"
      >
        {/* Left Column: App Promo / Visual Feature Highlights (Hidden on mobile) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-slate-950 via-[#0d1527] to-slate-950 text-white p-10 flex-col justify-between relative overflow-hidden border-r border-white/5">
          {/* Ambient Background Glow Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f70b_1px,transparent_1px),linear-gradient(to_bottom,#a855f70b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo Brand Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 text-white font-semibold text-xs tracking-wide">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse fill-purple-400/20" />
              INTELLIGENT AI ENGINE
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-6 tracking-tight leading-tight">
              Create an <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Account Today.</span>
            </h1>
            <p className="text-xs text-slate-300/80 mt-3 font-sans leading-relaxed">
              Unlock maximum savings. Keep track of price alerts, upload screenshots, and access smart recommendations instantly.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-display font-bold text-white">AI-Powered Extraction</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Drop screenshot receipts directly into the scanner to auto-extract models & specs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-display font-bold text-white">Platform Compare</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Cross-examine live pricing details from Amazon, Flipkart, and other stores side-by-side.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-display font-bold text-white">Verified Pricing</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Always discover identical technical models with our automated verification heuristics.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>SECURE SYSTEM</span>
            <span>v2.0</span>
          </div>
        </div>

        {/* Right Column: High-fidelity Registration Card Form */}
        <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#0b0f19]/90 relative">
          <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
            
            {/* Header branding on Mobile Only */}
            <div className="md:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-3 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <h2 className="text-2xl font-display font-black text-white tracking-tight">PriceAI Intelligence</h2>
              <p className="text-xs text-slate-400 mt-1">
                SaaS Price Comparison & Screenshot Scanner
              </p>
            </div>

            {/* Desktop Brand Headings */}
            <div className="hidden md:block">
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1.5 font-sans">
                Sign up for an account to start scanning receipts, comparing values, and managing smart price alerts.
              </p>
            </div>

            {/* Error Alert Box */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-300 text-xs animate-slide-up shadow-lg">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Success Alert Box */}
            {success && (
              <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs animate-slide-up shadow-lg">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-400" />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-white rounded-xl text-xs font-semibold outline-none transition-all duration-200 placeholder:text-slate-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-white rounded-xl text-xs font-semibold outline-none transition-all duration-200 placeholder:text-slate-500"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-white rounded-xl text-xs font-semibold outline-none transition-all duration-200 placeholder:text-slate-500"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="register-submit-button"
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-800 disabled:to-pink-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Registering Account..." : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            {/* Login Redirect Link Section */}
            <div className="text-center pt-6 border-t border-white/5">
              <p className="text-xs text-slate-400">
                Already have an account?{" "}
                <button
                  id="goto-login-link"
                  onClick={onNavigateToLogin}
                  className="text-purple-400 font-extrabold hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
