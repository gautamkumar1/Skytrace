"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Upload, 
    X, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    Plane,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import { apiFetch } from "@/lib/utils";

interface FileWithStatus {
    file: File;
    status: "pending" | "uploading" | "success" | "error";
    error?: string;
}

export default function AnalysisForm() {
    const router = useRouter();
    const [caseId, setCaseId] = useState("");
    const [registration, setRegistration] = useState("");
    const [aircraftType, setAircraftType] = useState("");
    const [engineType, setEngineType] = useState("");
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState("");
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                file: f,
                status: "pending" as const
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caseId || !registration || files.length === 0) {
            setError("Please fill in all required fields and upload at least one PDF.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisProgress("Uploading documents...");

        const formData = new FormData();
        formData.append("case_id", caseId);
        formData.append("registration", registration);
        formData.append("aircraft_type", aircraftType);
        formData.append("engine_type", engineType);
        files.forEach(f => formData.append("files", f.file));

        try {
            setAnalysisProgress("AI agents are analyzing documents (this may take 1-2 minutes)...");
            
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Analysis failed");
            }

            setAnalysisProgress("Analysis complete! Redirecting to case report...");
            setTimeout(() => {
                router.push(`/cases/${caseId}`);
            }, 1500);

        } catch (err: any) {
            console.error("Analysis error:", err);
            setError(err.message || "An unexpected error occurred during analysis.");
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-[#1e4d8a] transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-[#1e4d8a] px-8 py-6 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Upload size={24} /> New Technical Analysis
                    </h2>
                    <p className="text-blue-100/80 text-sm mt-1">
                        Upload aircraft technical documentation (PDF) to trigger AI due diligence.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Case ID *</label>
                            <input 
                                type="text"
                                placeholder="e.g. CASE-001"
                                required
                                value={caseId}
                                onChange={(e) => setCaseId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e4d8a]/20 focus:border-[#1e4d8a] transition-all outline-none text-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aircraft Registration *</label>
                            <input 
                                type="text"
                                placeholder="e.g. EI-SYN"
                                required
                                value={registration}
                                onChange={(e) => setRegistration(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e4d8a]/20 focus:border-[#1e4d8a] transition-all outline-none text-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aircraft Type</label>
                            <input 
                                type="text"
                                placeholder="e.g. A320-200"
                                value={aircraftType}
                                onChange={(e) => setAircraftType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e4d8a]/20 focus:border-[#1e4d8a] transition-all outline-none text-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Type</label>
                            <input 
                                type="text"
                                placeholder="e.g. CFM56-5B4"
                                value={engineType}
                                onChange={(e) => setEngineType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e4d8a]/20 focus:border-[#1e4d8a] transition-all outline-none text-slate-800"
                            />
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            Technical Documents (PDF) *
                            <span className="text-[10px] font-normal lowercase bg-slate-100 px-2 py-0.5 rounded text-slate-400">Max 50MB per file</span>
                        </label>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-[#1e4d8a] hover:bg-[#1e4d8a]/5 cursor-pointer transition-all group"
                        >
                            <input 
                                type="file" 
                                multiple 
                                accept=".pdf"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1e4d8a] group-hover:text-white transition-all mb-4">
                                    <Upload size={24} />
                                </div>
                                <h4 className="text-[15px] font-bold text-slate-800">Click to upload or drag and drop</h4>
                                <p className="text-sm text-slate-500 mt-1">Select one or more PDF documents (AD lists, Status reports, ARC)</p>
                            </div>
                        </div>

                        {/* File List */}
                        <AnimatePresence>
                            {files.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 mt-4"
                                >
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="text-rose-500 shrink-0"><FileText size={20} /></div>
                                                <span className="text-[13px] font-medium text-slate-700 truncate">{f.file.name}</span>
                                                <span className="text-[11px] text-slate-400">({(f.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Progress / Status */}
                    {isAnalyzing && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex flex-col items-center text-center gap-4">
                            <Loader2 className="text-[#1e4d8a] animate-spin" size={32} />
                            <div className="space-y-1">
                                <h4 className="text-[15px] font-bold text-[#1e4d8a]">Analysis in Progress</h4>
                                <p className="text-sm text-slate-500 max-w-sm">{analysisProgress}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-700">
                            <AlertCircle className="shrink-0" size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isAnalyzing || files.length === 0}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isAnalyzing || files.length === 0
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                : "bg-[#1e4d8a] text-white hover:bg-[#1a447a] hover:-translate-y-1 shadow-[#1e4d8a]/20"
                            }`}
                        >
                            {isAnalyzing ? "Processing..." : "Start AI Analysis"}
                            {!isAnalyzing && <ChevronRight size={18} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
