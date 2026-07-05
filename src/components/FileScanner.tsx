/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Scan, 
  FileJson, 
  Plus, 
  Image as ImageIcon, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Tag
} from "lucide-react";
import { Product } from "../types";
import { api } from "../lib/api";

interface FileScannerProps {
  onToggleCompare: (product: Product) => void;
  selectedCompareList: Product[];
  onShowToast: (msg: string) => void;
}

export default function FileScanner({ 
  onToggleCompare, 
  selectedCompareList,
  onShowToast 
}: FileScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "data">("image");
  
  // Drag and Drop States
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Image Upload and Processing States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    extracted: {
      productName: string;
      category: string;
      specs: Record<string, string>;
      detectedPrice: number;
    };
    matchedProduct: Product | null;
    isFallback: boolean;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Data Upload and Processing States
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    failedNames: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (file: File) => {
    if (activeTab === "image") {
      if (!file.type.startsWith("image/")) {
        setScanError("Please select or drop a valid image file (PNG, JPG, or JPEG).");
        return;
      }
      setImageFile(file);
      setScanError(null);
      setScanResult(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension !== "json" && extension !== "csv") {
        setScanError("Please select or drop a valid data file (.json or .csv).");
        return;
      }
      setDataFile(file);
      setScanError(null);
      setImportSummary(null);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleScanImage = async () => {
    if (!imagePreview || !imageFile) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const response = await api.scanFile(
        imagePreview,
        imageFile.type,
        imageFile.name
      );

      setScanResult(response);
      onShowToast("AI scanning completed successfully!");
    } catch (err: any) {
      console.error("AI scanning error:", err);
      setScanError("Failed to analyze image. Please ensure your Gemini setup is correct.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleImportData = async () => {
    if (!dataFile) return;

    setIsImporting(true);
    setScanError(null);

    try {
      const text = await dataFile.text();
      let productNames: string[] = [];

      if (dataFile.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            productNames = parsed.map(item => typeof item === "string" ? item : item.name || item.productName || "");
          } else if (parsed.products && Array.isArray(parsed.products)) {
            productNames = parsed.products.map((item: any) => typeof item === "string" ? item : item.name || item.productName || "");
          } else if (parsed.name || parsed.productName) {
            productNames = [parsed.name || parsed.productName];
          }
        } catch (jsonErr) {
          throw new Error("Invalid JSON structure. Ensure it is an array or object containing names.");
        }
      } else {
        // Simple CSV parser
        const lines = text.split("\n");
        productNames = lines
          .map(line => {
            const columns = line.split(",");
            return columns[0] ? columns[0].replace(/"/g, "").trim() : "";
          })
          .filter(name => name.length > 0 && name.toLowerCase() !== "name" && name.toLowerCase() !== "productname");
      }

      productNames = productNames.filter(Boolean);

      if (productNames.length === 0) {
        throw new Error("No products detected in your file. Ensure names are in the first column or labeled.");
      }

      // Query database for matches
      const allProducts = await api.searchProducts("");
      let successCount = 0;
      const failedNames: string[] = [];

      productNames.forEach(term => {
        const words = term.toLowerCase().split(" ");
        const matched = allProducts.find(p => 
          words.every(word => word.length <= 2 || p.name.toLowerCase().includes(word))
        );

        if (matched) {
          const alreadyInShelf = selectedCompareList.some(p => p.id === matched.id);
          if (!alreadyInShelf && selectedCompareList.length + successCount < 3) {
            onToggleCompare(matched);
            successCount++;
          } else if (alreadyInShelf) {
            // Already there, count as soft success
            successCount++;
          } else {
            failedNames.push(`${term} (Shelf limit of 3 reached)`);
          }
        } else {
          failedNames.push(term);
        }
      });

      setImportSummary({
        successCount,
        failedNames,
      });

      if (successCount > 0) {
        onShowToast(`Successfully imported & matched ${successCount} items!`);
      }
    } catch (err: any) {
      console.error("Bulk import error:", err);
      setScanError(err.message || "Failed to process data file. Please verify its content formatting.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setImagePreview(null);
    setScanResult(null);
    setDataFile(null);
    setImportSummary(null);
    setScanError(null);
  };

  return (
    <div id="file-scanner-container" className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl overflow-hidden shadow-xl transition-all">
      {/* Header / Accordion Toggle Button */}
      <button
        id="btn-toggle-scanner-accordion"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Scan className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-display font-extrabold text-white flex items-center gap-1.5">
              AI Screenshot Scanner & Bulk File Import
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Gemini Pro
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Upload shopping receipts, product screenshots, or CSV files to auto-extract prices.
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>

      {/* Expandable Content Panel */}
      {isOpen && (
        <div className="p-6 border-t border-white/5 bg-[#0b0f19]/80 space-y-6">
          {/* Tab Selection */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
            <button
              id="tab-scanner-image"
              onClick={() => {
                setActiveTab("image");
                resetAll();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "image"
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              AI Receipt & Screenshot Scan
            </button>
            <button
              id="tab-scanner-data"
              onClick={() => {
                setActiveTab("data");
                resetAll();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "data"
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              Bulk CSV / JSON Import
            </button>
          </div>

          {/* Interactive Drag & Drop Area */}
          {!imagePreview && !dataFile && (
            <div
              id="drag-drop-uploaddzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileBrowser}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] ${
                isDragActive
                  ? "border-purple-500 bg-purple-500/5 scale-[0.99] shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  : "border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/10"
              }`}
            >
              <input
                id="hidden-file-upload-input"
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept={activeTab === "image" ? "image/*" : ".json,.csv"}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-300 mb-1">
                Drag & drop your file here, or <span className="text-purple-400 hover:underline">browse</span>
              </h4>
              <p className="text-[10px] text-slate-500 max-w-[280px] leading-relaxed mx-auto font-mono">
                {activeTab === "image"
                  ? "Receipts, screenshots, and product photos (PNG, JPG, JPEG up to 10MB)"
                  : "Upload a structured .csv or .json list of product names to automatically pin them"}
              </p>
            </div>
          )}

          {/* Error Banner */}
          {scanError && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{scanError}</span>
            </div>
          )}

          {/* ACTIVE IMAGE SCANNING WORKFLOW */}
          {activeTab === "image" && imagePreview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview & Active Scanning UI */}
              <div className="space-y-4">
                <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center max-h-[220px]">
                  <img
                    src={imagePreview}
                    alt="Scan thumbnail preview"
                    referrerPolicy="no-referrer"
                    className="max-h-full object-contain max-w-full"
                  />
                  {/* Laser Scan line effect during analysis */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent animate-pulse border-b-2 border-purple-500"></div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    id="btn-scan-action"
                    disabled={isScanning}
                    onClick={handleScanImage}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-800 disabled:to-pink-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isScanning ? "AI Analyzing Image..." : "Initiate AI Scan"}
                  </button>
                  <button
                    id="btn-scan-reset"
                    onClick={resetAll}
                    disabled={isScanning}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded-xl transition-colors cursor-pointer"
                    title="Upload Another Image"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Extraction & Matching result layout */}
              <div className="bg-[#0b0f19]/80 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-3">
                    Scan Result & Extraction
                  </h4>
                  
                  {!scanResult && !isScanning && (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-xs font-medium text-slate-400">Ready to Analyze</p>
                      <p className="text-[10px]">Click the button to scan with Gemini AI</p>
                    </div>
                  )}

                  {isScanning && (
                    <div className="space-y-3 py-4">
                      <div className="h-4 bg-white/5 animate-pulse rounded-md w-3/4"></div>
                      <div className="h-3 bg-white/5 animate-pulse rounded-md w-1/2"></div>
                      <div className="h-3 bg-white/5 animate-pulse rounded-md w-5/6"></div>
                    </div>
                  )}

                  {scanResult && (
                    <div className="space-y-3.5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full font-mono">
                            {scanResult.extracted.category}
                          </span>
                          {scanResult.extracted.detectedPrice > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono flex items-center gap-0.5">
                              <Tag className="w-2.5 h-2.5" />
                              ₹{scanResult.extracted.detectedPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-display font-extrabold text-white">
                          {scanResult.extracted.productName || "Product Detected"}
                        </h5>
                      </div>

                      {/* Specs */}
                      {Object.keys(scanResult.extracted.specs).length > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-[10px] space-y-1">
                          {Object.entries(scanResult.extracted.specs).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="flex justify-between font-mono">
                              <span className="text-slate-500 font-bold">{key}:</span>
                              <span className="text-slate-300 font-medium truncate max-w-[150px]">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {scanResult.isFallback && (
                        <p className="text-[9px] text-slate-500 italic font-mono">
                          * Simulated parsing fallback active (Gemini AI Key can be configured in Settings).
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Match Finder Shelf Link */}
                {scanResult && (
                  <div className="border-t border-white/5 pt-4">
                    {scanResult.matchedProduct ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-emerald-400 font-mono">Best Database Match Found!</p>
                          <p className="text-xs font-bold text-slate-200 truncate">
                            {scanResult.matchedProduct.name}
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium font-mono mt-0.5">
                            Cheapest store starts at ₹{Math.min(scanResult.matchedProduct.amazonPrice, scanResult.matchedProduct.flipkartPrice).toLocaleString()}
                          </p>
                        </div>
                        
                        <button
                          id={`btn-match-add-${scanResult.matchedProduct.id}`}
                          onClick={() => onToggleCompare(scanResult.matchedProduct!)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                            selectedCompareList.some(p => p.id === scanResult.matchedProduct?.id)
                              ? "bg-emerald-600 text-white"
                              : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                          }`}
                        >
                          {selectedCompareList.some(p => p.id === scanResult.matchedProduct?.id) ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              Add Compare
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center text-[10px] text-slate-400 font-medium font-mono">
                        Analyzed product is not currently indexed in catalog. Try searching keywords.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DATA FILE BATCH IMPORT WORKFLOW */}
          {activeTab === "data" && dataFile && (
            <div className="bg-[#0b0f19]/80 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-slate-400">
                    <FileJson className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{dataFile.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {(dataFile.size / 1024).toFixed(1)} KB • Ready to Import
                    </p>
                  </div>
                </div>
                <button
                  id="btn-data-reset"
                  onClick={resetAll}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Action trigger button */}
              {!importSummary && (
                <button
                  id="btn-import-data-submit"
                  disabled={isImporting}
                  onClick={handleImportData}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
                >
                  {isImporting ? "Processing data items..." : "Process & Import Matches"}
                </button>
              )}

              {/* Summary panel once imported */}
              {importSummary && (
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex justify-between text-xs font-bold font-mono">
                    <span className="text-slate-400">Process Summary:</span>
                    <span className="text-purple-400">{importSummary.successCount} matched & pinned</span>
                  </div>

                  {importSummary.failedNames.length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-amber-400 mb-1 font-mono">
                        Unmatched or Skipped ({importSummary.failedNames.length}):
                      </p>
                      <div className="max-h-[80px] overflow-y-auto text-[9px] text-slate-400 font-mono space-y-0.5 no-scrollbar">
                        {importSummary.failedNames.map((name, i) => (
                          <div key={i} className="truncate">• {name}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    id="btn-data-reset-all"
                    onClick={resetAll}
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Import Another File
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
