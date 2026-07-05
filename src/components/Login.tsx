/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles, Scale, ShieldCheck, Zap, Chrome, Github } from "lucide-react";
import { api } from "../lib/api";

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles submission of login credentials to backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);
      if (data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login component error:", err);
      setError(
        err.response?.data?.error || "Unable to connect to the authentication server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler for mock social sign ins
   */
  const handleSocialSignIn = (provider: string) => {
    setEmail(provider === "google" ? "demo@priceai.io" : "admin@priceai.io");
    setPassword("password123");
    setError(null);
    const mockButton = document.getElementById("login-submit-button");
    if (mockButton) {
      setTimeout(() => {
        mockButton.click();
      }, 300);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div 
        id="login-main-container" 
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
            <div className="inline-flex items-center gap-2.5 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 text-white font-semibold text-xs tracking-wide">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse fill-purple-400/20" />
              INTELLIGENT AI ENGINE
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-6 tracking-tight leading-tight">
              Compare Prices, <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Save Smarter.</span>
            </h1>
            <p className="text-xs text-slate-300/80 mt-3 font-sans leading-relaxed">
              Scan invoice screenshots, analyze specs using Gemini AI, and track lowest rates across retail giants dynamically.
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

        {/* Right Column: High-fidelity Login Card Form */}
        <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#0b0f19]/90 relative">
          <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
            
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
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1.5 font-sans">
                Log into your account to access your personalized alerts, saved scans, and dynamic dashboard.
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignIn("google")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-red-400" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn("github")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Github className="w-4 h-4 text-purple-400" />
                GitHub
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider font-mono">Or continue with</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Error Alert Box */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-300 text-xs animate-slide-up shadow-lg">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-white rounded-xl text-xs font-semibold outline-none transition-all duration-200 placeholder:text-slate-500"
                    placeholder="demo@priceai.io"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-white rounded-xl text-xs font-semibold outline-none transition-all duration-200 placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Sign In Button */}
              <button
                id="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-800 disabled:to-pink-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Authenticating Account..." : "Access PriceAI Intelligence"}
                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            {/* Register Redirect Link Section */}
            <div className="text-center pt-6 border-t border-white/5">
              <p className="text-xs text-slate-400">
                New to PriceAI?{" "}
                <button
                  id="goto-register-link"
                  onClick={onNavigateToRegister}
                  className="text-purple-400 font-extrabold hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Create an account for free
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
