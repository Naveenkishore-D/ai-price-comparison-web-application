/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Tag, 
  Plus, 
  Check, 
  Sparkles, 
  Scale, 
  Star, 
  ChevronsRight, 
  AlertCircle,
  ExternalLink,
  Mic,
  MicOff,
  TrendingDown,
  Sparkle
} from "lucide-react";
import { Product } from "../types";
import { api } from "../lib/api";
import FileScanner from "./FileScanner";

interface ProductSearchProps {
  selectedCompareList: Product[];
  onToggleCompare: (product: Product) => void;
  onClearCompare: () => void;
  onGoToCompare: (userPreference: string) => void;
}

const CATEGORIES = ["All", "Smartphones", "Laptops", "Audio", "Smartwatches"];

export default function ProductSearch({ 
  selectedCompareList, 
  onToggleCompare, 
  onClearCompare, 
  onGoToCompare 
}: ProductSearchProps) {
  // Search parameters state
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userPreference, setUserPreference] = useState("Value for Money");

  // Query response state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localToast, setLocalToast] = useState<string | null>(null);

  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Voice Input state
  const [isListening, setIsListening] = useState(false);

  const showLocalToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 4000);
  };

  /**
   * Automatically executes an initial empty search on mount to load initial products catalog.
   */
  useEffect(() => {
    handleSearch();
  }, []);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Build suggestions as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const terms = ["iphone 15", "macbook air", "sony wh1000xm5", "ipad", "smartwatch", "headphones", "samsung s23", "dell xps", "noise colorfit"];
    const filtered = terms.filter(t => t.toLowerCase().includes(query.toLowerCase()));
    setSuggestions(filtered);
  }, [query]);

  /**
   * Search query trigger.
   */
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const data = await api.searchProducts(query);
      setProducts(data);
    } catch (err: any) {
      console.error("Search query error:", err);
      setError("Failed to fetch products. Please ensure the server is fully running.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Triggers the Speech Recognition API or a simulated dictated input loop
   */
  const triggerVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulated listening loop for sandbox compatibility
      setIsListening(true);
      showLocalToast("Listening for product queries... (Simulated)");
      const demoQueries = ["MacBook Air", "iPhone 15 Pro", "Sony WH-1000XM5"];
      const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
      
      setTimeout(() => {
        let currentText = "";
        let i = 0;
        const interval = setInterval(() => {
          if (i < randomQuery.length) {
            currentText += randomQuery.charAt(i);
            setQuery(currentText);
            i++;
          } else {
            clearInterval(interval);
            setIsListening(false);
            showLocalToast(`Extracted search: "${randomQuery}"`);
            // Trigger actual search
            api.searchProducts(randomQuery).then(data => setProducts(data));
          }
        }, 70);
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showLocalToast("Speak your product name now...");
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition error:", event);
        setIsListening(false);
        showLocalToast("Voice dictation error. Standard manual search active.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setQuery(resultText);
        showLocalToast(`Dictated: "${resultText}"`);
        // Search instantly
        setLoading(true);
        api.searchProducts(resultText).then(data => {
          setProducts(data);
          setLoading(false);
        }).catch(() => setLoading(false));
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false);
    }
  };

  // Helper to render product visual category icons dynamically
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "smartphones":
        return <Smartphone className="w-4 h-4" />;
      case "laptops":
        return <Laptop className="w-4 h-4" />;
      case "audio":
        return <Headphones className="w-4 h-4" />;
      case "smartwatches":
        return <Watch className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  // Filter products locally by category pill if any specific category selected
  const displayProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Search Bar & Banner Section */}
      <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="text-xl font-display font-extrabold text-white tracking-tight mb-2">Search & Live Compare</h2>
        <p className="text-xs text-slate-400 mb-6 font-sans">
          Cross-examine immediate, real-time pricing grids across Amazon & Flipkart with smart, interactive Gemini-based alternatives.
        </p>

        {/* Search Input bar */}
        <div ref={searchContainerRef} className="relative space-y-2">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                id="product-search-input"
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products (e.g. 'iPhone 15', 'MacBook', 'Sony WH')..."
                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 text-white rounded-xl text-xs font-semibold outline-none transition-all placeholder:text-slate-500"
              />
              
              {/* Voice Search Trigger button */}
              <button
                type="button"
                onClick={triggerVoiceInput}
                className={`absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-400 transition-colors cursor-pointer ${
                  isListening ? "text-purple-400 animate-pulse" : ""
                }`}
                title="Dictate Query"
              >
                {isListening ? <Mic className="w-5 h-5 text-purple-400" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            
            <button
              id="product-search-submit"
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 rounded-xl text-xs transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 hover:scale-[1.01]"
            >
              {loading ? "Discovering..." : "Search"}
            </button>
          </form>

          {/* Auto Suggestions Overlay List */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden py-1.5 animate-slide-up max-w-xl">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(suggestion);
                    setShowSuggestions(false);
                    setLoading(true);
                    api.searchProducts(suggestion).then(data => {
                      setProducts(data);
                      setLoading(false);
                    }).catch(() => setLoading(false));
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-slate-300 hover:text-white font-mono text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-purple-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills filtering */}
        <div className="flex flex-wrap gap-2 mt-5 border-t border-white/5 pt-5">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              id={`category-pill-${category.toLowerCase()}`}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === category
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5 hover:text-white"
              }`}
            >
              {category !== "All" && getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>
      </div>

      {localToast && (
        <div id="local-toast-search" className="fixed bottom-5 left-5 z-50 bg-[#0b0f19] text-white text-xs font-semibold px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          {localToast}
        </div>
      )}

      {/* AI Smart Scan & Bulk Import collapsible panel */}
      <FileScanner 
        onToggleCompare={onToggleCompare} 
        selectedCompareList={selectedCompareList} 
        onShowToast={showLocalToast} 
      />

      {/* Error notification banner */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-300 text-xs shadow-lg animate-slide-up">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Row: Left is Products List, Right is Comparative floating shelf */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Products List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            // High fidelity pulsing skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#0b0f19]/40 border border-white/5 rounded-3xl p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-white/5 rounded-md w-1/3"></div>
                    <div className="h-4 bg-white/5 rounded-full w-12"></div>
                  </div>
                  <div className="h-5 bg-white/5 rounded-md w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded-md w-5/6"></div>
                    <div className="h-3 bg-white/5 rounded-md w-2/3"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-white/5 rounded-xl"></div>
                    <div className="h-10 bg-white/5 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#0b0f19]/60 border border-white/5 rounded-3xl px-4 shadow-xl">
              <p className="text-slate-400 font-medium mb-1">No products found matching your search</p>
              <p className="text-xs text-slate-500">Try checking your spelling or selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayProducts.map((product) => {
                const onCompareShelf = selectedCompareList.some((p) => p.id === product.id);
                const isAmazonCheaper = product.amazonPrice <= product.flipkartPrice;
                const lowestPrice = isAmazonCheaper ? product.amazonPrice : product.flipkartPrice;
                const priceDiff = Math.abs(product.amazonPrice - product.flipkartPrice);

                return (
                  <div 
                    key={product.id}
                    id={`product-card-${product.id}`}
                    className={`bg-[#0b0f19]/60 border rounded-3xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] ${
                      onCompareShelf 
                        ? "border-purple-500/50 ring-2 ring-purple-500/20 shadow-purple-500/5 bg-[#0b0f19]/80" 
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div>
                      {/* Product Category & Rating Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                          {getCategoryIcon(product.category)}
                          {product.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full font-mono">
                          <Star className="w-3 h-3 fill-purple-400 stroke-purple-400" />
                          {product.rating}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-sm font-display font-bold text-white line-clamp-1 mb-1 tracking-tight">
                        {product.name}
                      </h3>

                      {/* Brief Specs list */}
                      <div className="space-y-1 mb-5">
                        {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-[11px] text-slate-400">
                            <span className="font-medium text-slate-500">{key}:</span>
                            <span className="truncate max-w-[150px] font-mono text-right text-slate-300">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Store Price Cards Box */}
                      <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded-2xl border border-white/5 mb-5 text-[11px]">
                        {/* Amazon Store Card */}
                        <a
                          href={`https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Search ${product.name} on Amazon`}
                          className={`text-center p-2 rounded-xl hover:bg-white/5 border transition-all group/amazon cursor-pointer flex flex-col justify-between ${
                            isAmazonCheaper ? "border-emerald-500/30 glow-green bg-emerald-500/5" : "border-transparent"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-bold text-orange-400 flex items-center justify-center gap-1 mb-0.5 font-mono">
                              AMAZON
                              <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/amazon:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-xs font-bold font-mono text-white block">
                              ₹{product.amazonPrice.toLocaleString()}
                            </span>
                          </div>
                          {isAmazonCheaper && (
                            <span className="block mt-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full px-1.5 py-0.5 mx-auto w-fit border border-emerald-500/20">
                              BEST VALUE
                            </span>
                          )}
                        </a>

                        {/* Flipkart Store Card */}
                        <a
                          href={`https://www.flipkart.com/search?q=${encodeURIComponent(product.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Search ${product.name} on Flipkart`}
                          className={`text-center p-2 rounded-xl hover:bg-white/5 border transition-all group/flipkart cursor-pointer flex flex-col justify-between ${
                            !isAmazonCheaper ? "border-emerald-500/30 glow-green bg-emerald-500/5" : "border-transparent"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-bold text-blue-400 flex items-center justify-center gap-1 mb-0.5 font-mono">
                              FLIPKART
                              <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/flipkart:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-xs font-bold font-mono text-white block">
                              ₹{product.flipkartPrice.toLocaleString()}
                            </span>
                          </div>
                          {!isAmazonCheaper && (
                            <span className="block mt-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full px-1.5 py-0.5 mx-auto w-fit border border-emerald-500/20">
                              BEST VALUE
                            </span>
                          )}
                        </a>
                      </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="border-t border-white/5 pt-4 mt-auto flex items-center justify-between">
                      {priceDiff > 0 ? (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> Save ₹{priceDiff.toLocaleString()} here!
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">Prices are identical</span>
                      )}

                      {/* Compare pin toggle */}
                      <button
                        id={`btn-compare-toggle-${product.id}`}
                        onClick={() => onToggleCompare(product)}
                        className={`text-xs font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          onCompareShelf
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/10"
                            : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                        }`}
                      >
                        {onCompareShelf ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {onCompareShelf ? "Pinned" : "Pin Item"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Comparative floating shelf */}
        <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              Comparison Shelf
            </h3>
            {selectedCompareList.length > 0 && (
              <button
                id="btn-clear-compare"
                onClick={onClearCompare}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedCompareList.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <Scale className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium mb-1">No products pinned yet</p>
              <p className="text-[11px] text-slate-500">Pin up to 3 products below to initiate side-by-side AI evaluation</p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {/* Selected items list */}
              <div className="space-y-2">
                {selectedCompareList.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-200 truncate">{product.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium font-mono">
                        Lowest: ₹{Math.min(product.amazonPrice, product.flipkartPrice).toLocaleString()}
                      </p>
                    </div>
                    <button
                      id={`btn-remove-shelf-${product.id}`}
                      onClick={() => onToggleCompare(product)}
                      className="text-xs font-semibold text-slate-500 hover:text-red-400 cursor-pointer p-1 rounded-md hover:bg-white/5 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Shopping priorities configuration */}
              <div className="border-t border-white/5 pt-4 space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    AI Evaluation Core Priority
                  </label>
                  <select
                    id="recommendation-priority-select"
                    value={userPreference}
                    onChange={(e) => setUserPreference(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-2.5 text-xs outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="Value for Money">Value for Money (Cheapest per Spec)</option>
                    <option value="Highest Performance">Highest Performance & Premium Build</option>
                    <option value="Best Customer Reviews">Top Rated & Best Customer Reviews</option>
                    <option value="Purely Low Price">Lowest Price Match</option>
                  </select>
                </div>

                {/* Compare navigation action trigger */}
                <button
                  id="btn-evaluate-trigger"
                  onClick={() => onGoToCompare(userPreference)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer group hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-white fill-white animate-pulse" />
                  Evaluate Side-by-Side
                  <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-[9px] text-slate-500 text-center font-mono">
                  Evaluation compiles technical specifications and live consumer opinions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
