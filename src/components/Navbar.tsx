/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  Search, 
  Scale, 
  LogOut, 
  User 
} from "lucide-react";
import { User as UserType } from "../types";

interface NavbarProps {
  user: UserType | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  compareCount: number;
  onLogout: () => void;
  guestView?: "home" | "login" | "register";
  onGuestViewChange?: (view: "home" | "login" | "register") => void;
}

export default function Navbar({ 
  user, 
  activeTab, 
  onTabChange, 
  compareCount, 
  onLogout,
  guestView = "home",
  onGuestViewChange
}: NavbarProps) {
  return (
    <header className="bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand/Logo Section */}
          <div 
            onClick={() => {
              if (user) {
                onTabChange("dashboard");
              } else if (onGuestViewChange) {
                onGuestViewChange("home");
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-blue-600 text-white flex items-center justify-center font-display font-extrabold text-xl shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-transform group-hover:scale-105">
              P
            </div>
            <div>
              <h1 className="text-base font-display font-black text-white tracking-tight leading-none group-hover:text-purple-400 transition-colors">
                PriceAI
              </h1>
              <span className="text-[9px] font-bold text-purple-400 font-mono tracking-widest uppercase">
                Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links/Tabs */}
          {user && (
            <nav className="hidden md:flex items-center gap-2">
              {/* Dashboard Link */}
              <button
                id="nav-tab-dashboard"
                onClick={() => onTabChange("dashboard")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "text-slate-400 border border-transparent hover:bg-white/5 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                Dashboard
              </button>

              {/* Product Search Link */}
              <button
                id="nav-tab-search"
                onClick={() => onTabChange("search")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                  activeTab === "search"
                    ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "text-slate-400 border border-transparent hover:bg-white/5 hover:text-white"
                }`}
              >
                <Search className="w-4 h-4 text-pink-400" />
                Search Catalog
              </button>

              {/* Compare Page Link */}
              <button
                id="nav-tab-compare"
                onClick={() => onTabChange("compare")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 relative ${
                  activeTab === "compare"
                    ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "text-slate-400 border border-transparent hover:bg-white/5 hover:text-white"
                }`}
              >
                <Scale className="w-4 h-4 text-blue-400" />
                Comparison
                {compareCount > 0 && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono font-bold px-1.5 py-0.2 rounded-full text-[9px] min-w-4 text-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    {compareCount}
                  </span>
                )}
              </button>
            </nav>
          )}

          {/* User Session profile controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User avatar details (Desktop only) */}
                <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 pl-2 pr-3 py-1.5 rounded-xl shadow-inner">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs font-mono shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </span>
                </div>

                {/* Mobile Tab triggers */}
                <div className="flex md:hidden items-center gap-1.5">
                  <button
                    onClick={() => onTabChange("dashboard")}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      activeTab === "dashboard" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutDashboard className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onTabChange("search")}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      activeTab === "search" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Search className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onTabChange("compare")}
                    className={`p-2 rounded-lg cursor-pointer relative transition-colors ${
                      activeTab === "compare" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Scale className="w-4.5 h-4.5" />
                    {compareCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                        {compareCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  id="btn-navbar-logout"
                  onClick={onLogout}
                  className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-white/10 p-2.5 rounded-xl text-slate-400 transition-all cursor-pointer shadow-md"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-btn-guest-home"
                  onClick={() => onGuestViewChange && onGuestViewChange("home")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 border ${
                    guestView === "home"
                      ? "bg-white/10 text-white border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Home
                </button>
                <button
                  id="nav-btn-guest-login"
                  onClick={() => onGuestViewChange && onGuestViewChange("login")}
                  className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-4.5 py-2 rounded-xl text-xs transition-all duration-300 shadow-lg shadow-purple-500/10 hover:scale-[1.01] cursor-pointer`}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
