"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Header from "@/components/layout/Header";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FileUploader from "@/components/dashboard/FileUploader";
import AnalysisReport from "@/components/dashboard/AnalysisReport";
import { apiFetch, formatConfidence, truncate } from "@/lib/utils";
import type { FindingSeverity } from "@/lib/types";
import {
  Plane,
  AlertTriangle,
  FileText,
  Gauge,
  ArrowRight,
  Shield,
  Activity,
  ChevronRight,
  BarChart3,
  Clock,
  Zap,
  Upload,
  X,
} from "lucide-react";


interface DashboardData {
  total_cases: number;
  total_findings: number;
  total_documents: number;
  total_engine_metrics: number;
  severity_counts: Record<string, number>;
  recent_findings: {
    id: string;
    case_id: string;
    severity: FindingSeverity;
    category: string;
    title: string;
    confidence: number;
    registration: string;
    aircraft_type: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"dashboard" | "upload">("dashboard");

  useEffect(() => {
    apiFetch<DashboardData>("/api/stats")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  if (error) {
    return (
      <>
        <Header title="Dashboard" subtitle="Overview of your fleet operations" />
        <div className="flex flex-col items-center justify-center gap-[10px] px-5 py-[56px] text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#f0f3f7] text-slate-400 mb-1.5"><AlertTriangle size={28} /></div>
          <h3 className="m-0 text-[17px] font-bold text-[#0c1d36]">Connection Error</h3>
          <p className="m-0 text-[13.5px] leading-[1.55] text-slate-500 max-w-[420px]">
            Could not connect to the database. Ensure{" "}
            <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded font-mono">DATABASE_URL</code> is set in{" "}
            <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded font-mono">frontend/.env.local</code>.
          </p>
          <p className="text-xs text-slate-400 mt-2">{error}</p>
        </div>
      </>
    );
  }

  if (!data) return null;

  const totalFindings = data.total_findings || 1;
  const severities = ["STOP", "FLAG", "ADVISORY", "CLEAR"] as const;
  const sevColors: Record<string, { bar: string; label: string; bg: string; ring: string }> = {
    STOP: { bar: "#be123c", label: "Significant Risk", bg: "rgba(190,18,60,0.08)", ring: "rgba(190,18,60,0.2)" },
    FLAG: { bar: "#d97706", label: "Flagged", bg: "rgba(217,119,6,0.08)", ring: "rgba(217,119,6,0.2)" },
    ADVISORY: { bar: "#0284c7", label: "Advisory", bg: "rgba(2,132,199,0.08)", ring: "rgba(2,132,199,0.2)" },
    CLEAR: { bar: "#059669", label: "Clear", bg: "rgba(5,150,105,0.08)", ring: "rgba(5,150,105,0.2)" },
  };

  const stopCount = data.severity_counts["STOP"] || 0;
  const flagCount = data.severity_counts["FLAG"] || 0;

  const calculateEfficiency = (severityCounts: Record<string, number>, totalFindings: number) => {
    if (totalFindings === 0) return 100;
    const deductions: Record<string, number> = { STOP: 12, FLAG: 5, ADVISORY: 2, CLEAR: 0 };
    let score = 100;
    Object.entries(severityCounts).forEach(([sev, count]) => {
      score -= (deductions[sev] || 0) * count;
    });
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const efficiency = calculateEfficiency(data.severity_counts, data.total_findings);
  const efficiencyColor = efficiency > 90 ? "decoration-emerald-400/50" : (efficiency > 75 ? "decoration-blue-400/50" : (efficiency > 60 ? "decoration-amber-400/50" : "decoration-rose-400/50"));

  return (
    <>
      <Header
        title={view === "dashboard" ? "Dashboard" : "Aviation Analysis"}
        subtitle={view === "dashboard" ? "Fleet operations overview" : "Ingest and analyze documents"}
      >
        {view === "dashboard" ? (
          <button
            onClick={() => setView("upload")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Upload size={18} />
            New Analysis
          </button>
        ) : (
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
          >
            <ArrowRight className="rotate-180" size={18} />
            Back to Dashboard
          </button>
        )}
      </Header>

      <AnimatePresence mode="wait">
        {view === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FileUploader 
              onClose={() => setView("dashboard")} 
              onSuccess={(data) => {
                const id = data?.case_id ?? "";
                router.push(id ? `/cases/${encodeURIComponent(id)}` : "/dashboard");
              }}
            />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Stat Cards ── */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-10 px-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Plane size={22} /></div>
                  <div>
                    <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">{data.total_cases}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Assets</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><AlertTriangle size={22} /></div>
                  <div>
                    <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">{data.total_findings}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk Points</span>
                  </div>
                </div>
                {stopCount > 0 && (
                  <div className="absolute top-0 right-0 p-2">
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-glow" />
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><FileText size={22} /></div>
                  <div>
                    <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">{data.total_documents}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Sources</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Gauge size={22} /></div>
                  <div>
                    <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">{data.total_engine_metrics}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health Metrics</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Alert Banner ── */}
            {stopCount > 0 && (
              <motion.div
                className="mx-2 flex items-center gap-3 px-4.5 py-3 mb-5 bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50 rounded-xl border-l-[3px] border-l-rose-500 px-4 mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="w-[30px] h-[30px] rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Zap size={16} />
                </div>
                <div className="flex-1 text-[13px] font-medium text-slate-800">
                  <strong className="font-bold text-rose-500">{stopCount} critical finding{stopCount > 1 ? "s" : ""}</strong> require{stopCount === 1 ? "s" : ""} immediate attention
                  {flagCount > 0 && <span className="text-slate-500"> · {flagCount} flagged for review</span>}
                </div>
                <Link href="/findings" className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 px-3.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 transition-all whitespace-nowrap">
                  Review now <ArrowRight size={13} />
                </Link>
              </motion.div>
            )}

            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 px-2 mt-4">
              <motion.div
                className="flex flex-col gap-6"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="p-8 bg-slate-200/40 rounded-3xl border border-slate-400/40 relative overflow-hidden backdrop-blur-sm shadow-xl shadow-blue-900/5">
                  {/* Subtle radial glow background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/5 blur-[80px] pointer-events-none rounded-full" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 border border-blue-600/20 shadow-sm"><BarChart3 size={16} /></div>
                      <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">Risk Profile</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100/50 shadow-sm">
                      <Activity size={10} />
                      Live Feed
                    </div>
                  </div>

                  <div className="relative mb-10 flex justify-center z-10">
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={severities.map((sev) => ({
                            name: sevColors[sev].label,
                            value: data.severity_counts[sev] || 0,
                            sev,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={72}
                          outerRadius={105}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={8}
                        >
                          {severities.map((sev) => (
                            <Cell 
                              key={sev} 
                              fill={sevColors[sev].bar} 
                              className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none group">
                      <div className="relative">
                         <span className="block text-4xl font-black text-slate-900 leading-none tracking-tighter mb-1 drop-shadow-sm">{data.total_findings}</span>
                         <div className="absolute -inset-2 bg-blue-400/10 blur-xl opacity-0 transition-opacity" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Findings</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    {severities.map((sev) => {
                      const count = data.severity_counts[sev] || 0;
                      const pct = data.total_findings > 0 ? Math.round((count / data.total_findings) * 100) : 0;
                      return (
                        <motion.div 
                          key={sev}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="flex flex-col p-3.5 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group overflow-hidden relative"
                        >
                          {/* Severity colored accent indicator */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: sevColors[sev].bar }} />
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{sevColors[sev].label}</span>
                            <span className="text-[12px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-md">{count}</span>
                          </div>
                          
                          <div className="mt-auto">
                             <div className="flex items-baseline gap-1">
                                <span className="text-[22px] font-black text-slate-900 leading-none">{pct}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">%</span>
                             </div>
                             <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100/80 overflow-hidden">
                                <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${pct}%` }}
                                   transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                                   className="h-full rounded-full"
                                   style={{ backgroundColor: sevColors[sev].bar }}
                                />
                             </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-slate-200/40 border border-slate-200/60 rounded-2xl shadow-sm">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Zap size={16} className="text-blue-400" /></div>
                     <span className="text-[16px] font-bold uppercase tracking-widest text-blue-600">Fleet Health</span>
                   </div>
                   <p className="text-[15px] text-blue-600 leading-relaxed font-bold mb-6">
                     Your fleet is currently operating at <span className={`text-blue-600 font-black underline ${efficiencyColor}`}>{efficiency}% technical efficiency</span>. Review critical findings to improve score.
                   </p>
                   <Link href="/fleet" className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-[12px] font-bold transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                     View detailed report
                   </Link>
                </div>
              </motion.div>

              <motion.div
                className="min-w-0"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="bg-slate-200/40 border border-slate-400/40 rounded-3xl shadow-sm h-full flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between p-8 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-500"><Clock size={16} /></div>
                      <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Recent Technical Findings</h3>
                    </div>
                    <Link href="/findings" className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                      Full feed <ArrowRight size={12} className="inline ml-1" />
                    </Link>
                  </div>

                  {data.recent_findings.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-200 mb-4"><Plane size={32} /></div>
                      <h4 className="text-[15px] font-bold text-slate-900 mb-1">All clear at the moment</h4>
                      <p className="text-[13px] text-slate-400 max-w-xs font-medium">No technical findings have been reported in the last 7 days.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 overflow-y-auto">
                      {[...data.recent_findings]
                        .sort((a, b) => {
                          if (a.severity === "STOP" && b.severity !== "STOP") return -1;
                          if (a.severity !== "STOP" && b.severity === "STOP") return 1;
                          return 0;
                        })
                        .map((f, i) => (
                        <Link key={f.id} href={`/cases/${f.case_id}`} className="block group p-8 hover:bg-blue-50/30 transition-all">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="space-y-1">
                              <p className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{f.title}</p>
                              <div className="flex items-center gap-3 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                                 <span className="text-slate-700 font-extrabold">{f.registration}</span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                 <span className="text-slate-600 font-bold">{f.category}</span>
                              </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-2">
                              <SeverityBadge severity={f.severity} size="sm" />
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{formatConfidence(f.confidence)} Score</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-auto p-6 bg-slate-50/10 border-t border-slate-50 text-center">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing last {data.recent_findings.length} findings · System synchronized</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
