"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, X, FileText, CheckCircle2, AlertCircle, Loader2,
    ArrowRight, Sparkles, ChevronDown, ChevronUp, Pencil
} from "lucide-react";
import {
    detectAircraftInfo,
    ALL_AIRCRAFT_TYPES,
    ALL_ENGINE_TYPES,
    type DetectedInfo,
} from "@/lib/aircraftLookup";

interface UploadStatus {
    loading: boolean;
    success: boolean;
    error: string | null;
    output?: string;
}

export default function FileUploader({ onClose, onSuccess }: { onClose?: () => void; onSuccess?: (data: any) => void }) {
    const [files, setFiles] = useState<File[]>([]);
    const [caseId, setCaseId] = useState("");
    const [registration, setRegistration] = useState("");
    const [aircraftType, setAircraftType] = useState("");
    const [engineType, setEngineType] = useState("");
    const [status, setStatus] = useState<UploadStatus>({ loading: false, success: false, error: null });
    const [isDragging, setIsDragging] = useState(false);
    const [showOverride, setShowOverride] = useState(false);
    const [detected, setDetected] = useState<DetectedInfo | null>(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv", ".json"];
    const acceptAttr = ACCEPTED_EXTENSIONS.join(",");
    const acceptList = "PDF, Word, Excel, TXT, CSV, JSON";

    const filterAccepted = (fileList: FileList | null): File[] => {
        if (!fileList) return [];
        return Array.from(fileList).filter((file) => {
            const name = file.name || "";
            const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
            return ACCEPTED_EXTENSIONS.includes(ext);
        });
    };

    // ─── Auto-detection ─────────────────────────────────────────────
    useEffect(() => {
        const sources: string[] = [];
        if (caseId) sources.push(caseId);
        if (registration) sources.push(registration);
        files.forEach((f) => sources.push(f.name));

        if (sources.length === 0) {
            setDetected(null);
            return;
        }

        const info = detectAircraftInfo(...sources);
        setDetected(info);

        // Auto-fill only if user hasn't manually overridden
        if (!showOverride) {
            if (info.aircraftType) setAircraftType(info.aircraftType);
            if (info.engineType) setEngineType(info.engineType);
        }
    }, [caseId, registration, files, showOverride]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const accepted = filterAccepted(e.target.files);
        if (accepted.length) setFiles(accepted);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const accepted = filterAccepted(e.dataTransfer.files);
        if (accepted.length) setFiles(accepted);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitAttempted(true);
        
        if (!caseId || !registration) {
            setStatus({ loading: false, success: false, error: "Please enter a Case ID and Aircraft Registration." });
            return;
        }
        
        if (!files.length) {
            setStatus({ loading: false, success: false, error: "At least one technical document is required for analysis." });
            return;
        }

        setStatus({ loading: true, success: false, error: null });

        try {
            const formData = new FormData();
            formData.append("case_id", caseId);
            formData.append("registration", registration);
            formData.append("aircraft_type", aircraftType || "auto");
            formData.append("engine_type", engineType || "auto");
            files.forEach(file => formData.append("files", file));

            const res = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data.rejected?.length
                    ? `${data.error}: ${data.rejected.join("; ")}`
                    : (data.error || "Analysis failed");
                throw new Error(msg);
            }

            if (onSuccess) onSuccess(data);
            setStatus({ loading: false, success: true, error: null, output: data.output });
            setFiles([]);
            setCaseId("");
            setRegistration("");
            setAircraftType("");
            setEngineType("");
            setDetected(null);
            setShowOverride(false);
            setSubmitAttempted(false);
        } catch (err: any) {
            setStatus({ loading: false, success: false, error: err.message });
        }
    };

    const confidenceColor = (c: string) => {
        switch (c) {
            case "high": return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "medium": return "text-sky-600 bg-sky-50 border-sky-200";
            case "low": return "text-amber-600 bg-amber-50 border-amber-200";
            default: return "text-slate-500 bg-slate-50 border-slate-200";
        }
    };

    return (
        <div className="premium-card p-6 md:p-8 mb-8 mt-6 m-2 md:m-4">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Upload size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 leading-none mb-1">Upload New Inventory</h2>
                        <p className="text-xs text-slate-500 font-medium">Ingest technical documents — aircraft &amp; engine types are auto-detected</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── Core fields: Case ID & Registration only ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Case ID <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. CASE-2024-001"
                            value={caseId}
                            onChange={(e) => {
                                setCaseId(e.target.value);
                                if (status.error) setStatus({ ...status, error: null });
                            }}
                            className={`w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                                submitAttempted && !caseId ? "border-rose-300 focus:ring-rose-600/10 focus:border-rose-400" : "border-slate-200 focus:ring-blue-600/5 focus:border-blue-300"
                            }`}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Registration <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. N12345"
                            value={registration}
                            onChange={(e) => {
                                setRegistration(e.target.value);
                                if (status.error) setStatus({ ...status, error: null });
                            }}
                            className={`w-full bg-slate-50/50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                                submitAttempted && !registration ? "border-rose-300 focus:ring-rose-600/10 focus:border-rose-400" : "border-slate-200 focus:ring-blue-600/5 focus:border-blue-300"
                            }`}
                        />
                    </div>
                </div>

                {/* ── File Drop Zone ── */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                        isDragging ? "border-blue-500 bg-blue-50/50" : 
                        submitAttempted && !files.length ? "border-rose-300 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/50" : 
                        "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
                    }`}
                >
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept={acceptAttr}
                    />
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <FileText size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">{acceptList} — multiple files per case</p>
                    </div>
                </div>

                {/* ── Selected files ── */}
                {files.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <FileText size={16} className="text-blue-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-700 truncate">{file.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Auto-detected classification panel ── */}
                <AnimatePresence>
                    {detected && detected.confidence !== "none" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className={`rounded-2xl border p-4 ${confidenceColor(detected.confidence)}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            Auto-Detected Classification
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${confidenceColor(detected.confidence)}`}>
                                            {detected.confidence} confidence
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowOverride(!showOverride)}
                                        className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
                                    >
                                        <Pencil size={12} />
                                        Override
                                        {showOverride ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Aircraft Type</p>
                                        <p className="text-sm font-bold">{aircraftType || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Engine Type</p>
                                        <p className="text-sm font-bold">{engineType || "—"}</p>
                                    </div>
                                    {detected.manufacturer && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Manufacturer</p>
                                            <p className="text-sm font-bold">{detected.manufacturer}</p>
                                        </div>
                                    )}
                                    {detected.category && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Category</p>
                                            <p className="text-sm font-bold">{detected.category}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Override dropdowns */}
                                <AnimatePresence>
                                    {showOverride && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-current/10">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Aircraft Type (Manual)</label>
                                                    <select
                                                        value={aircraftType}
                                                        onChange={(e) => setAircraftType(e.target.value)}
                                                        className="w-full bg-white/80 border border-current/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none text-slate-900"
                                                    >
                                                        <option value="">Select aircraft type...</option>
                                                        {ALL_AIRCRAFT_TYPES.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Engine Type (Manual)</label>
                                                    <select
                                                        value={engineType}
                                                        onChange={(e) => setEngineType(e.target.value)}
                                                        className="w-full bg-white/80 border border-current/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-medium appearance-none text-slate-900"
                                                    >
                                                        <option value="">Select engine type...</option>
                                                        {ALL_ENGINE_TYPES.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── No detection — prompt manual entry ── */}
                <AnimatePresence>
                    {(files.length > 0 || caseId || registration) && detected && detected.confidence === "none" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle size={16} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Could not auto-detect aircraft type
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">
                                    No known aircraft or engine designators were found in your filenames or case info. You can select them manually below, or leave blank to let the system attempt detection from file contents.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aircraft Type</label>
                                        <select
                                            value={aircraftType}
                                            onChange={(e) => setAircraftType(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-300 transition-all font-medium appearance-none"
                                        >
                                            <option value="">Leave for auto-detection...</option>
                                            {ALL_AIRCRAFT_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine Type</label>
                                        <select
                                            value={engineType}
                                            onChange={(e) => setEngineType(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-300 transition-all font-medium appearance-none"
                                        >
                                            <option value="">Leave for auto-detection...</option>
                                            {ALL_ENGINE_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Submit ── */}
                <div className="flex flex-col gap-3 pt-2">
                    <AnimatePresence>
                        {status.error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-600 shadow-sm"
                            >
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <div className="text-[13px] font-medium leading-relaxed">{status.error}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={status.loading}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                                status.loading
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/20 active:scale-[0.98]"
                            }`}
                        >
                            {status.loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Analyzing Docs...
                                </>
                            ) : (
                                <>
                                    Start Analysis
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <AnimatePresence>
                {status.success && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-emerald-800">Process Completed Successfully</p>
                            <p className="text-xs text-emerald-600 mt-1 font-medium whitespace-pre-wrap">{status.output}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
