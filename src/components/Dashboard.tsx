/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  History, 
  Trash2, 
  Compass, 
  ArrowRight, 
  Clock, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Star, 
  TrendingDown, 
  Bell, 
  Percent, 
  Zap, 
  Activity, 
  AlertCircle,
  Plus,
  TrendingUp
} from "lucide-react";
import { SearchHistoryItem, Product } from "../types";
import { api } from "../lib/api";

interface DashboardProps {
  user: { name: string; email: string } | null;
  onSelectProductToCompare: (id: string) => void;
  onStartSearch: (initialQuery?: string) => void;
}

// Recommended base inventory
const TOP_ITEMS = [
  { id: "iphone-15", name: "Apple iPhone 15 (128GB)", category: "Smartphones", price: "₹69,999", rating: 4.6, valueScore: 92 },
  { id: "macbook-air-m3", name: "Apple MacBook Air M3", category: "Laptops", price: "₹1,02,990", rating: 4.8, valueScore: 96 },
  { id: "sony-wh1000xm5", name: "Sony WH-1000XM5 ANC", category: "Audio", price: "₹27,990", rating: 4.6, valueScore: 90 }
];

// Initial Price Alerts State
interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  platform: "Amazon" | "Flipkart";
  status: "active" | "triggered";
}

export default function Dashboard({ user, onSelectProductToCompare, onStartSearch }: DashboardProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    { id: "1", productName: "Apple iPad Air (M1)", targetPrice: 48000, currentPrice: 52900, platform: "Amazon", status: "active" },
    { id: "2", productName: "Sony WH-1000XM5 ANC", targetPrice: 26000, currentPrice: 27990, platform: "Flipkart", status: "active" },
    { id: "3", productName: "Nintendo Switch OLED", targetPrice: 28000, currentPrice: 27500, platform: "Amazon", status: "triggered" }
  ]);
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertPrice, setNewAlertPrice] = useState("");
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  /**
   * Loads search history records on mount.
   */
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getUserHistory();
      setHistory(data);
    } catch (err) {
      console.error("Dashboard failed to retrieve search logs:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Deletes user's search history on the backend.
   */
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your search history?")) {
      return;
    }
    setClearing(true);
    try {
      await api.clearUserHistory();
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear search history:", err);
    } finally {
      setClearing(false);
    }
  };

  /**
   * Adds a new price alert.
   */
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertName.trim() || !newAlertPrice) return;

    const price = parseFloat(newAlertPrice);
    if (isNaN(price) || price <= 0) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      productName: newAlertName,
      targetPrice: price,
      currentPrice: Math.round(price * 1.15), // Mock current price higher than target
      platform: Math.random() > 0.5 ? "Amazon" : "Flipkart",
      status: "active"
    };

    setAlerts([newAlert, ...alerts]);
    setNewAlertName("");
    setNewAlertPrice("");
    setAlertSuccess("Alert successfully established!");
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  /**
   * Deletes a price alert.
   */
  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  /**
   * Helper to format ISO timestamps.
   */
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Welcome & Overview Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-white/10 bg-gradient-to-br from-purple-950/40 via-slate-950/80 to-blue-950/40 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f70b_1px,transparent_1px),linear-gradient(to_bottom,#a855f70b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        
        <div className="relative space-y-4 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-purple-300">
            <Sparkles className="w-3 h-3 text-purple-400 fill-purple-400/20" />
            PriceAI Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
            Welcome Back, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{user?.name || "Shopper"}</span>!
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans max-w-xl">
            Compare deals across major retail giants using powerful Gemini models, configure target drop price trackers, and upload screenshot invoices to discover smart insights.
          </p>
          <div className="pt-2">
            <button
              id="btn-dashboard-start-search"
              onClick={() => onStartSearch("")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10 hover:scale-[1.01]"
            >
              Browse Catalog & Search Items
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Dashboard Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b0f19]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/25 transition-all">
          <div className="absolute top-4 right-4 text-purple-500/20 group-hover:text-purple-500/30 transition-colors">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">User Identifier</div>
          <p className="text-xs font-bold text-slate-200 font-mono truncate">{user?.email}</p>
        </div>

        <div className="bg-[#0b0f19]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-pink-500/25 transition-all">
          <div className="absolute top-4 right-4 text-pink-500/20 group-hover:text-pink-500/30 transition-colors">
            <Activity className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Historical Search Queries</div>
          <p className="text-lg font-bold text-white font-display flex items-baseline gap-1.5">
            {history.length} <span className="text-[10px] text-slate-400 font-sans font-normal">Stored searches</span>
          </p>
        </div>

        <div className="bg-[#0b0f19]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/25 transition-all">
          <div className="absolute top-4 right-4 text-blue-500/20 group-hover:text-blue-500/30 transition-colors">
            <Bell className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Established Alerts</div>
          <p className="text-lg font-bold text-white font-display flex items-baseline gap-1.5">
            {alerts.length} <span className="text-[10px] text-slate-400 font-sans font-normal">Active drop alerts</span>
          </p>
        </div>
      </div>

      {/* Main Double Column Split: Search History & recommended recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Past Search History logs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Price Alerts Tracker */}
          <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl p-6 shadow-xl relative">
            <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-purple-400" />
              Smart Price Drop Alerts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Add Alert Form */}
              <form onSubmit={handleAddAlert} className="md:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <h4 className="text-[11px] font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Set New Tracker
                </h4>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={newAlertName}
                    onChange={(e) => setNewAlertName(e.target.value)}
                    placeholder="e.g. MacBook Air"
                    className="w-full bg-white/5 border border-white/15 focus:outline-none focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Alert Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    placeholder="e.g. 95000"
                    className="w-full bg-white/5 border border-white/15 focus:outline-none focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>

                {alertSuccess && (
                  <p className="text-[10px] text-emerald-400 font-bold font-mono animate-pulse">{alertSuccess}</p>
                )}

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Create Alert
                </button>
              </form>

              {/* Alert List */}
              <div className="md:col-span-8 space-y-3 max-h-[280px] overflow-y-auto no-scrollbar pr-1">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:border-purple-500/20 transition-all"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                          alert.status === "triggered" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse" 
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {alert.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{alert.platform}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{alert.productName}</h4>
                      <p className="text-[11px] text-slate-400">
                        Target: <span className="font-bold text-purple-400">₹{alert.targetPrice.toLocaleString()}</span> • Current: <span className="font-mono">₹{alert.currentPrice.toLocaleString()}</span>
                      </p>
                    </div>

                    <button 
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/30"
                      title="Remove Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Past Search History logs */}
          <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Your Search Footprint
                </h3>
                {history.length > 0 && (
                  <button
                    id="btn-clear-history"
                    onClick={handleClearHistory}
                    disabled={clearing}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {clearing ? "Clearing..." : "Clear Logs"}
                  </button>
                )}
              </div>

              {loadingHistory ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-400">Loading your search footprints...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Clock className="w-10 h-10 stroke-[1.5] text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1 text-slate-300">Your history log is currently empty</p>
                  <p className="text-xs text-slate-500">Queries you run will automatically pin here for immediate catalog lookup.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="py-3.5 flex items-center justify-between group hover:bg-white/5 rounded-xl px-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl shrink-0">
                          <Search className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            "{item.query}"
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium font-mono">
                            <Clock className="w-3 h-3" />
                            {formatTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        id={`btn-search-again-${item.id}`}
                        onClick={() => onStartSearch(item.query)}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-xl hover:bg-purple-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Search Again
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Smart Suggested Products & Deal of the Day */}
        <div className="space-y-8">
          
          {/* Deal of the Day Spotlight widget */}
          <div className="bg-gradient-to-br from-purple-950/40 via-[#0d101a] to-blue-950/40 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500/10 to-transparent w-40 h-40 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-purple-300 font-mono">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Deal of the Day
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full font-mono animate-pulse">
                Save 15%
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-white group-hover:text-purple-400 transition-colors">
                  Sony WH-1000XM5 ANC
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Industry leading active noise cancellation</p>
              </div>

              {/* Price Comparisons */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121824]/80 border border-white/5 rounded-xl p-3 text-center">
                  <span className="text-[9px] font-bold text-slate-500 block font-mono">Amazon</span>
                  <span className="text-xs font-bold text-slate-300 line-through">₹29,990</span>
                  <span className="text-sm font-extrabold text-rose-400 block mt-0.5">₹27,990</span>
                </div>
                <div className="bg-[#121824]/80 border border-green-500/20 rounded-xl p-3 text-center glow-green">
                  <span className="text-[9px] font-bold text-emerald-400 block font-mono flex items-center justify-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" /> Flipkart
                  </span>
                  <span className="text-xs font-bold text-slate-300 line-through">₹28,900</span>
                  <span className="text-sm font-extrabold text-emerald-400 block mt-0.5">₹24,990</span>
                </div>
              </div>

              {/* Price trend SVG mini graph */}
              <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>Price History Trend</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" /> Low trajectory
                  </span>
                </div>
                <div className="h-10 w-full flex items-end">
                  <svg className="w-full h-8 overflow-visible" stroke="currentColor" fill="none">
                    <path
                      d="M0 25 Q15 10 30 18 T60 8 T90 24 T120 12 T150 28 T180 5"
                      stroke="url(#purpleGlowGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="purpleGlowGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-600">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* AI Best Value Rating Score */}
              <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-purple-200 uppercase tracking-wide">Best Value Score</h5>
                    <p className="text-[9px] text-slate-400">Based on lowest price and rating</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-purple-300 font-mono">98</span>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">/100</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectProductToCompare("sony-wh1000xm5");
                  onStartSearch("");
                }}
                className="w-full bg-white/5 border border-white/10 hover:border-purple-500/30 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-purple-500/10"
              >
                Inspect Deal Analysis
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Section: Smart Suggested Products list */}
          <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="pb-4 border-b border-white/5">
              <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-400" />
                Featured Picks
              </h3>
              <p className="text-xs text-slate-500 mt-1">Globally indexed in-demand comparisons</p>
            </div>

            <div className="space-y-4">
              {TOP_ITEMS.map((item) => (
                <div 
                  key={item.id}
                  id={`recommended-card-${item.id}`}
                  className="group border border-white/5 p-4 rounded-2xl hover:border-purple-500/30 transition-all duration-300 cursor-pointer flex justify-between items-center bg-white/5 hover:bg-purple-950/10"
                  onClick={() => {
                    onSelectProductToCompare(item.id);
                    onStartSearch("");
                  }}
                >
                  <div className="space-y-1.5 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full font-mono">
                        <Star className="w-2.5 h-2.5 fill-purple-400 stroke-purple-400" />
                        {item.rating}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold font-mono">
                      Catalog <span className="text-purple-400 font-bold">{item.price}</span>
                    </p>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-transparent transition-all shrink-0">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
