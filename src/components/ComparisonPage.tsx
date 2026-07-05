/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  ChevronLeft, 
  Sparkles, 
  Star, 
  ExternalLink, 
  Scale, 
  BadgeCheck, 
  TrendingUp, 
  ThumbsUp, 
  ShoppingCart, 
  ShieldAlert 
} from "lucide-react";
import { Product, AIRecommendResponse } from "../types";
import { api } from "../lib/api";

interface ComparisonPageProps {
  compareList: Product[];
  userPreference: string;
  onGoBackToSearch: () => void;
}

export default function ComparisonPage({ 
  compareList, 
  userPreference, 
  onGoBackToSearch 
}: ComparisonPageProps) {
  // Recommendation state
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the Gemini recommendation automatically on mount if products exist.
   */
  useEffect(() => {
    if (compareList.length > 0) {
      fetchAIRecommendation();
    }
  }, [compareList]);

  const fetchAIRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = compareList.map((p) => p.id);
      const data = await api.getAIRecommendation(ids, userPreference);
      setRecommendation(data);
    } catch (err: any) {
      console.error("AI recommendation request error:", err);
      setError("Unable to generate AI recommendation. Please ensure your Gemini API Key is configured.");
    } finally {
      setLoading(false);
    }
  };

  if (compareList.length === 0) {
    return (
      <div className="text-center py-16 bg-[#0b0f19]/60 border border-white/5 rounded-3xl px-4 max-w-xl mx-auto shadow-2xl animate-slide-up">
        <Scale className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-display font-extrabold text-white mb-2">No products to compare</h3>
        <p className="text-xs text-slate-400 mb-6 font-sans">
          Please head back to the search dashboard and pin some products first.
        </p>
        <button
          id="btn-return-empty-compare"
          onClick={onGoBackToSearch}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-purple-500/15"
        >
          Return to Products Search
        </button>
      </div>
    );
  }

  // Retrieve unique spec keys across all products to render standard side-by-side spec list
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap((p) => Object.keys(p.specs)))
  );

  return (
    <div className="space-y-8 animate-slide-up pb-16">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-search"
          onClick={onGoBackToSearch}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer bg-white/5 px-3.5 py-2 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Search Catalog
        </button>
        <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
          Comparing {compareList.length} items side-by-side
        </span>
      </div>

      {/* Grid of Side-by-Side Product Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(compareList.length, 3)} gap-6 items-stretch`}>
        {compareList.map((product) => {
          // Check if this product is picked as winner by the AI recommendation engine
          const isBestValue = recommendation?.bestValueId === product.id;
          const isPremiumWinner = recommendation?.premiumId === product.id;
          const lowestPrice = Math.min(product.amazonPrice, product.flipkartPrice);
          const highestPrice = Math.max(product.amazonPrice, product.flipkartPrice);
          const cheaperStore = product.amazonPrice <= product.flipkartPrice ? "Amazon" : "Flipkart";

          return (
            <div 
              key={product.id}
              id={`compare-card-${product.id}`}
              className={`bg-[#0b0f19]/60 border rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden hover:scale-[1.01] ${
                isBestValue ? "border-emerald-500/50 glow-green bg-[#0b0f19]/85" : "border-white/5"
              } ${
                isPremiumWinner && !isBestValue ? "border-purple-500/50 glow-purple bg-[#0b0f19]/85" : ""
              }`}
            >
              {/* Winner tags pinned on top right */}
              {isBestValue && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  AI value choice
                </div>
              )}
              {isPremiumWinner && !isBestValue && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-mono font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <TrendingUp className="w-3.5 h-3.5" />
                  AI premium choice
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="pt-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {product.category}
                  </span>
                  <h3 className="text-base font-display font-extrabold text-white tracking-tight leading-tight mt-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-purple-400 font-mono">
                      <Star className="w-3.5 h-3.5 fill-purple-400 stroke-purple-400" />
                      {product.rating}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({product.reviews.length} user reviews)</span>
                  </div>
                </div>

                {/* Main comparison price breakdown */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-2 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Amazon Price:</span>
                    <span className="font-bold text-white">₹{product.amazonPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                    <span className="text-slate-400">Flipkart Price:</span>
                    <span className="font-bold text-white">₹{product.flipkartPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2 text-emerald-400">
                    <span className="font-bold text-[11px]">Lowest Offer:</span>
                    <span className="font-bold text-sm">
                      ₹{lowestPrice.toLocaleString()}{" "}
                      <span className="text-[9px] font-medium text-slate-500">({cheaperStore})</span>
                    </span>
                  </div>
                </div>

                {/* Highlight specifications table snippet */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Specs Matrix</h4>
                  <div className="space-y-1.5">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs border-b border-white/5 pb-1">
                        <span className="text-slate-500 font-medium">{key}</span>
                        <span className="text-slate-300 font-semibold text-right max-w-[150px] truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified user review preview box */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-2">User Consensus</span>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 italic text-[11px] text-slate-400 leading-normal relative">
                  "{product.reviews[0].text}"
                  <span className="block text-[10px] font-bold text-slate-500 mt-1.5 not-italic text-right font-mono">— {product.reviews[0].author}</span>
                </div>
              </div>

              {/* Direct Store Checkout Links */}
              <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                <a
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-400 font-bold text-xs rounded-xl border border-white/10 hover:border-orange-500/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Amazon
                </a>
                <a
                  href={`https://www.flipkart.com/search?q=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 font-bold text-xs rounded-xl border border-white/10 hover:border-blue-500/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Flipkart
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendation panel */}
      <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl shadow-2xl overflow-hidden transition-all">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-6 py-5 md:px-8 flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 backdrop-blur-md text-white p-2 rounded-xl">
              <Sparkles className="w-5 h-5 fill-white stroke-none animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-white text-base tracking-tight">Gemini AI Consensus Report</h3>
              <p className="text-[10px] text-purple-200 font-bold font-mono uppercase tracking-wide">
                Optimized Priority: <span className="text-yellow-300 font-extrabold">{userPreference}</span>
              </p>
            </div>
          </div>
          {recommendation && (
            <span className="text-[9px] font-mono font-bold py-1.5 px-3 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/10">
              {recommendation.isFallback ? "ALGORITHMIC INTEL" : "LIVE GEMINI CORE"}
            </span>
          )}
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-200">AI Is Analysing Catalog Specs...</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Comparing product weights, display technologies, processor efficiency, pricing spreads, and user sentiments to formulate an optimized recommendations matrix.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-4 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">AI Consensus Unreachable</p>
                <p className="text-xs text-red-400 leading-normal mb-3">{error}</p>
                <button
                  id="btn-retry-ai"
                  onClick={fetchAIRecommendation}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer border border-red-500/30 transition-all"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          ) : recommendation ? (
            <div className="space-y-6">
              {/* Main recommendation markdown body */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <div className="markdown-body">
                  <ReactMarkdown>{recommendation.recommendation}</ReactMarkdown>
                </div>
              </div>

              {/* Visual callout cards with side-by-side winning selections */}
              <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Best Value Block */}
                <div className="flex items-start gap-3.5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <div className="bg-emerald-600 text-white p-2 rounded-xl shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">AI Best Value Pick</h4>
                    <p className="text-sm font-bold text-slate-100">
                      {compareList.find(p => p.id === recommendation.bestValueId)?.name || "Analyzing..."}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Highest efficiency per Rupee, matching user preference parameters with uncompromised cost metrics.
                    </p>
                  </div>
                </div>

                {/* Premium Choice Block */}
                <div className="flex items-start gap-3.5 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                  <div className="bg-purple-600 text-white p-2 rounded-xl shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">AI Premium Pick</h4>
                    <p className="text-sm font-bold text-slate-100">
                      {compareList.find(p => p.id === recommendation.premiumId)?.name || "Analyzing..."}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Outstanding build quality, maximum technical specifications, and superior long-term customer durability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
