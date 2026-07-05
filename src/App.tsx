/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Homepage from "./components/Homepage";
import ProductSearch from "./components/ProductSearch";
import ComparisonPage from "./components/ComparisonPage";
import { User, Product } from "./types";
import { api } from "./lib/api";

export default function App() {
  // Authentication & session state
  const [user, setUser] = useState<User | null>(null);
  const [isSessionRestoring, setIsSessionRestoring] = useState(true);
  const [guestView, setGuestView] = useState<"home" | "login" | "register">("home");

  // Nav routing & interaction state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedCompareList, setSelectedCompareList] = useState<Product[]>([]);
  const [userPreference, setUserPreference] = useState<string>("Value for Money");

  // System warning notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /**
   * Attempts to restore user session automatically on startup.
   */
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        try {
          // Verify with server profile retrieval endpoint
          const profile = await api.getProfile();
          setUser(profile);
          setActiveTab("dashboard");
        } catch (err) {
          console.warn("Stale login token found. Clearing session.", err);
          api.logout();
          setUser(null);
        }
      }
      setIsSessionRestoring(false);
    };

    checkSession();
  }, []);

  /**
   * Handles successful login trigger by reading profile context.
   */
  const handleLoginSuccess = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Failed to load user profile on login:", err);
    }
  };

  /**
   * Destroys credentials and forces login redirect.
   */
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setSelectedCompareList([]);
    setActiveTab("dashboard");
    setGuestView("home");
  };

  /**
   * Pins or unpins a product from the comparative shelf. Limit to max of 3 items.
   */
  const handleToggleCompare = (product: Product) => {
    const exists = selectedCompareList.some((p) => p.id === product.id);

    if (exists) {
      setSelectedCompareList(selectedCompareList.filter((p) => p.id !== product.id));
    } else {
      if (selectedCompareList.length >= 3) {
        showToast("You can compare a maximum of 3 products at a time.");
        return;
      }
      setSelectedCompareList([...selectedCompareList, product]);
    }
  };

  /**
   * Clears pinned products list.
   */
  const handleClearCompare = () => {
    setSelectedCompareList([]);
  };

  /**
   * Direct trigger to jump to comparison view with selected parameters.
   */
  const handleGoToCompare = (preference: string) => {
    setUserPreference(preference);
    setActiveTab("compare");
  };

  /**
   * Navigates to search with preloaded query state.
   */
  const handleStartSearch = () => {
    setActiveTab("search");
  };

  /**
   * Dashboard recommendation click helper. Directly pins selection and triggers search catalog.
   */
  const handleSelectProductToCompare = async (id: string) => {
    try {
      const allProducts = await api.searchProducts("");
      const target = allProducts.find((p) => p.id === id);
      if (target) {
        const alreadySelected = selectedCompareList.some((p) => p.id === id);
        if (!alreadySelected) {
          if (selectedCompareList.length >= 3) {
            setSelectedCompareList([target]);
          } else {
            setSelectedCompareList([...selectedCompareList, target]);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard trigger pin failed:", err);
    }
  };

  /**
   * Custom feedback alert banner trigger.
   */
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Render a simple beautiful loader on initial page load / hydration check
  if (isSessionRestoring) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]"></div>
        <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest font-mono">
          Initializing Secure Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0b0f19] text-white text-xs font-semibold px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar 
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        compareCount={selectedCompareList.length}
        onLogout={handleLogout}
        guestView={guestView}
        onGuestViewChange={setGuestView}
      />

      {/* Main Page Content Body Area */}
      <main className={`flex-1 w-full mx-auto ${guestView === "home" && !user ? "" : "max-w-7xl px-4 md:px-6 py-8"}`}>
        {!user ? (
          // Unauthenticated Flow
          guestView === "home" ? (
            <Homepage 
              onNavigateToLogin={() => setGuestView("login")}
              onNavigateToRegister={() => setGuestView("register")}
            />
          ) : guestView === "register" ? (
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
              <Register 
                onRegisterSuccess={() => setGuestView("login")}
                onNavigateToLogin={() => setGuestView("login")}
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
              <Login 
                onLoginSuccess={handleLoginSuccess}
                onNavigateToRegister={() => setGuestView("register")}
              />
            </div>
          )
        ) : (
          // Authenticated Views Route Orchestrator
          <div className="space-y-4">
            {activeTab === "dashboard" && (
              <Dashboard 
                user={user}
                onSelectProductToCompare={handleSelectProductToCompare}
                onStartSearch={handleStartSearch}
              />
            )}

            {activeTab === "search" && (
              <ProductSearch 
                selectedCompareList={selectedCompareList}
                onToggleCompare={handleToggleCompare}
                onClearCompare={handleClearCompare}
                onGoToCompare={handleGoToCompare}
              />
            )}

            {activeTab === "compare" && (
              <ComparisonPage 
                compareList={selectedCompareList}
                userPreference={userPreference}
                onGoBackToSearch={() => setActiveTab("search")}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0b0f19] py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 PriceAI Intelligence. All rights reserved.</p>
          <div className="flex gap-5">
            <span>Powered by Gemini AI</span>
            <span>Secure Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
