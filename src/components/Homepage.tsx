/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Scale, 
  Check, 
  Zap, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Star, 
  TrendingDown, 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch,
  ShoppingBag
} from "lucide-react";
import { Product } from "../types";
import { api } from "../lib/api";

interface HomepageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export default function Homepage({ onNavigateToLogin, onNavigateToRegister }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [demoProducts, setDemoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load some featured products for the initial demo state
  useEffect(() => {
    const fetchDemoProducts = async () => {
      setLoading(true);
      try {
        const data = await api.searchProducts("");
        // Take 3 popular products (iPhone 15, MacBook Air M3, Sony Headphones) for standard showcase
        const featuredIds = ["iphone-15", "macbook-air-m3", "sony-wh1000xm5"];
        const featured = data.filter(p => featuredIds.includes(p.id));
        
        // If not found, fallback to first 3 items
        if (featured.length > 0) {
          setDemoProducts(featured);
        } else {
          setDemoProducts(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load homepage demo products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDemoProducts();
  }, []);

  const handleDemoSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.searchProducts(searchQuery);
      setDemoProducts(data.slice(0, 3));
    } catch (err) {
      console.error("Failed to search demo products:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "smartphones":
        return <Smartphone className="w-3.5 h-3.5 text-purple-400" />;
      case "laptops":
        return <Laptop className="w-3.5 h-3.5 text-pink-400" />;
      case "audio":
        return <Headphones className="w-3.5 h-3.5 text-blue-400" />;
      case "smartwatches":
        return <Watch className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden w-full min-h-screen bg-[#030712] text-slate-100 font-sans pb-24">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid Pattern overlay for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-12 md:pt-20 pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 px-4 py-1.5 rounded-full border border-white/10 hover:border-purple-500/30 transition-all duration-300 shadow-md mb-8 group cursor-pointer animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse fill-purple-400/20" />
          <span className="text-[10px] sm:text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            Next-Gen Price Aggregator Powered by Gemini
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white mb-6 leading-[1.1] animate-slide-up">
          Compare Prices, <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm font-black">
            Save Instantly
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-10 font-sans leading-relaxed animate-fade-in">
          Discover best-value deals in real-time across Amazon, Flipkart, and more. Upload invoices or query with voice to unlock Gemini-powered specification matrices and side-by-side consensus analyses.
        </p>

        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto bg-[#0b0f19]/80 border border-white/10 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10 hover:border-purple-500/30 transition-all duration-300">
          <form onSubmit={handleDemoSearchSubmit} className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products to compare (e.g. 'iPhone 15', 'MacBook', 'Sony WH')..."
                className="w-full pl-12 pr-4 py-3 bg-transparent border-0 text-white rounded-xl text-xs sm:text-sm focus:outline-none placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer hover:shadow-purple-500/30"
            >
              Search Demo
            </button>
          </form>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 font-mono">
          Interactive demo search filters products live in the sandbox inventory below!
        </p>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            How PriceAI Outperforms Common Shopping
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Deep metadata comparison with artificial intelligence replaces manual browser tab-hopping forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Powered Extraction */}
          <div className="group bg-[#0b0f19]/60 border border-white/5 hover:border-purple-500/30 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(168,85,247,0.05)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors">
                AI Powered Extraction
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Upload invoice sheets, shop flyers, or screenshot details. Gemini Pro analyzes pixel matrices to instantly extract tech specifications and verify real-time matches.
              </p>
            </div>
            <div className="border-t border-white/5 pt-4 mt-6 flex items-center text-[11px] text-purple-400 font-bold tracking-wider font-mono uppercase group-hover:gap-1.5 transition-all">
              Screenshot Scanning Active <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Fast Comparison */}
          <div className="group bg-[#0b0f19]/60 border border-white/5 hover:border-pink-500/30 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(236,72,153,0.05)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-100 mb-2 group-hover:text-pink-400 transition-colors">
                Fast Comparison
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Side-by-side matrices comparing weight distributions, battery durations, screen dimensions, and consumer sentiment scores instantly in a beautiful unified layout.
              </p>
            </div>
            <div className="border-t border-white/5 pt-4 mt-6 flex items-center text-[11px] text-pink-400 font-bold tracking-wider font-mono uppercase group-hover:gap-1.5 transition-all">
              Live Price Comparison <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: Best Price Guarantee */}
          <div className="group bg-[#0b0f19]/60 border border-white/5 hover:border-blue-500/30 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(59,130,246,0.05)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                Best Price Guarantee
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Never pay more. We constantly discover the lowest offers across multiple platforms, highlight best value scores, and provide active direct checkout links.
              </p>
            </div>
            <div className="border-t border-white/5 pt-4 mt-6 flex items-center text-[11px] text-blue-400 font-bold tracking-wider font-mono uppercase group-hover:gap-1.5 transition-all">
              Verified Lowest Deals <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* DEMO RESULTS SECTION */}
      <section id="demo-results" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 fill-purple-400/20 animate-bounce" />
            Instant Discovery Grid
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Live Retail Comparison Mockup
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Review live price differences mapped instantly between e-commerce giants Amazon and Flipkart.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#0b0f19]/40 border border-white/5 rounded-3xl p-6 h-80 animate-pulse space-y-4">
                <div className="h-4 bg-white/5 rounded w-1/3"></div>
                <div className="h-6 bg-white/5 rounded w-3/4"></div>
                <div className="h-20 bg-white/5 rounded"></div>
                <div className="h-10 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        ) : demoProducts.length === 0 ? (
          <div className="bg-[#0b0f19]/40 border border-white/5 rounded-3xl p-16 text-center">
            <p className="text-slate-400 text-sm font-semibold">No demo matches found for your query.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-purple-400 mt-2 underline"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoProducts.map((product) => {
              const isAmazonCheaper = product.amazonPrice <= product.flipkartPrice;
              const lowestPrice = isAmazonCheaper ? product.amazonPrice : product.flipkartPrice;
              const priceDifference = Math.abs(product.amazonPrice - product.flipkartPrice);

              return (
                <div 
                  key={product.id}
                  className="bg-[#0b0f19]/60 border border-white/10 hover:border-purple-500/20 rounded-3xl p-6 shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden hover:scale-[1.01] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                        {getCategoryIcon(product.category)}
                        {product.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full font-mono">
                        <Star className="w-3 h-3 fill-purple-400 stroke-purple-400" />
                        {product.rating}
                      </span>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-sm sm:text-base font-display font-extrabold text-white mb-4 line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Brief specifications snippets */}
                    <div className="space-y-1.5 mb-6">
                      {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-[11px] border-b border-white/5 pb-1 font-mono">
                          <span className="text-slate-500 font-bold">{key}</span>
                          <span className="text-slate-300 text-right truncate max-w-[150px]">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* E-Commerce Comparison Grid */}
                    <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 text-[11px] mb-5">
                      {/* Amazon Store box */}
                      <div className={`p-2 rounded-xl text-center border relative ${
                        isAmazonCheaper ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-transparent"
                      }`}>
                        <span className="text-[9px] font-bold text-orange-400 font-mono tracking-wider block mb-1">AMAZON</span>
                        <span className="text-xs font-bold text-white font-mono block">₹{product.amazonPrice.toLocaleString()}</span>
                        {isAmazonCheaper && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            Deal 🔥
                          </span>
                        )}
                      </div>

                      {/* Flipkart Store box */}
                      <div className={`p-2 rounded-xl text-center border relative ${
                        !isAmazonCheaper ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-transparent"
                      }`}>
                        <span className="text-[9px] font-bold text-blue-400 font-mono tracking-wider block mb-1">FLIPKART</span>
                        <span className="text-xs font-bold text-white font-mono block">₹{product.flipkartPrice.toLocaleString()}</span>
                        {!isAmazonCheaper && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            Deal 🔥
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Savings / Footer status */}
                  <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                    {priceDifference > 0 ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                        <TrendingDown className="w-3.5 h-3.5" /> Save ₹{priceDifference.toLocaleString()} instantly!
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Prices are identical</span>
                    )}

                    <button
                      onClick={onNavigateToLogin}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                    >
                      Compare Details <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CALL TO ACTION */}
      <section id="cta" className="max-w-4xl mx-auto px-4 mt-16">
        <div className="bg-gradient-to-br from-slate-950 via-[#0a1020] to-slate-950 border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Light glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-4 leading-tight">
            Ready to Discover Genuine Value?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8 font-sans leading-relaxed">
            Create your free account today to experience the full capacity of Gemini-powered evaluations, screenshot parsing pipelines, and automated alerts for daily price updates.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              id="cta-start-comparing"
              onClick={onNavigateToLogin}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-purple-500/15 cursor-pointer flex items-center justify-center gap-2 group hover:scale-[1.01]"
            >
              Start Comparing Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onNavigateToRegister}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Register for Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
