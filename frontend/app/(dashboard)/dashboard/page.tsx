"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Header from "@/components/layout/Header";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    STOP: { bar: "#be123c", label: "Critical", bg: "rgba(190,18,60,0.08)", ring: "rgba(190,18,60,0.2)" },
    FLAG: { bar: "#d97706", label: "Flagged", bg: "rgba(217,119,6,0.08)", ring: "rgba(217,119,6,0.2)" },
    ADVISORY: { bar: "#0284c7", label: "Advisory", bg: "rgba(2,132,199,0.08)", ring: "rgba(2,132,199,0.2)" },
    CLEAR: { bar: "#059669", label: "Clear", bg: "rgba(5,150,105,0.08)", ring: "rgba(5,150,105,0.2)" },
  };

  const stopCount = data.severity_counts["STOP"] || 0;
  const flagCount = data.severity_counts["FLAG"] || 0;

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Fleet operations overview"
      />

      {/* ── Stat Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5 mt-10 px-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3.5 px-5 py-[18px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-[1px] relative group text-[#1e4d8a]">
          <div className="w-10 h-10 rounded-lg bg-[#1e4d8a]/10 flex items-center justify-center shrink-0"><Plane size={18} /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">{data.total_cases}</span>
            <span className="text-xs font-semibold text-slate-500 mt-[3px]">Active Cases</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-5 py-[18px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-[1px] relative group text-rose-600">
          <div className="w-10 h-10 rounded-lg bg-rose-600/10 flex items-center justify-center shrink-0"><Shield size={18} /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">{data.total_findings}</span>
            <span className="text-xs font-semibold text-slate-500 mt-[3px]">AI Findings</span>
          </div>
          {stopCount > 0 && (
            <span className="absolute top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-rose-500 bg-rose-50 animate-pulse">{stopCount} critical</span>
          )}
        </div>

        <div className="flex items-center gap-3.5 px-5 py-[18px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-[1px] relative group text-emerald-600">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center shrink-0"><FileText size={18} /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">{data.total_documents}</span>
            <span className="text-xs font-semibold text-slate-500 mt-[3px]">Documents</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-5 py-[18px] bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-[1px] relative group text-sky-600">
          <div className="w-10 h-10 rounded-lg bg-sky-600/10 flex items-center justify-center shrink-0"><Activity size={18} /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">{data.total_engine_metrics}</span>
            <span className="text-xs font-semibold text-slate-500 mt-[3px]">Engine Metrics</span>
          </div>
        </div>
      </motion.div>

      {/* ── Alert Banner (only if critical findings) ── */}
      {stopCount > 0 && (
        <motion.div
          className="flex items-center gap-3 px-4.5 py-3 mb-5 bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50 rounded-xl border-l-[3px] border-l-rose-500 px-4"
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

      {/* ── Main Content: 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-[18px] mb-6 px-2">
        {/* Left column: Severity + Quick Actions */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Severity Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-slate-400" />
                <h3 className="text-[12.5px] font-bold text-slate-800 uppercase tracking-[0.05em] m-0">Risk Distribution</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{data.total_findings}</span>
            </div>

            <div>
              {/* Donut Chart */}
              <div className="relative mb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={severities.map((sev) => ({
                        name: sevColors[sev].label,
                        value: data.severity_counts[sev] || 0,
                        sev,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={300}
                      animationDuration={800}
                      animationEasing="ease-out"
                      stroke="none"
                    >
                      {severities.map((sev) => (
                        <Cell key={sev} fill={sevColors[sev].bar} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center pointer-events-none">
                  <span className="text-[26px] font-extrabold text-slate-900 leading-none tracking-tight">{data.total_findings}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] mt-0.5">Total</span>
                </div>
              </div>

              {/* Legend items */}
              <div className="grid grid-cols-2 gap-2">
                {severities.map((sev) => {
                  const count = data.severity_counts[sev] || 0;
                  const pct = data.total_findings > 0
                    ? Math.round((count / data.total_findings) * 100)
                    : 0;
                  return (
                    <div
                      key={sev}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-md border bg-slate-50/50"
                      style={{ borderColor: sevColors[sev].ring }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sevColors[sev].bar }}
                      />
                      <div className="flex flex-col">
                        <span className="text-base font-extrabold text-slate-900 leading-tight">{count}</span>
                        <span className="text-[10.5px] font-medium text-slate-400 tracking-wide">{sevColors[sev].label} · {pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-slate-400" />
                <h3 className="text-[12.5px] font-bold text-slate-800 uppercase tracking-[0.05em] m-0">Quick Actions</h3>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              {[
                { href: "/fleet", icon: <Plane size={18} />, title: "Fleet Overview", desc: "Aircraft & case statuses" },
                { href: "/findings", icon: <AlertTriangle size={18} />, title: "Findings", desc: "Review & submit feedback" },
                { href: "/engine-health", icon: <Gauge size={18} />, title: "Engine Health", desc: "Performance monitoring" },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="group flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-slate-50 transition-all text-decoration-none">
                  <div className="w-[34px] h-[34px] rounded-md bg-slate-100 text-[#1e4d8a] flex items-center justify-center shrink-0 transition-all group-hover:bg-[#1e4d8a] group-hover:text-white">{action.icon}</div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[13px] font-semibold text-slate-800">{action.title}</span>
                    <span className="text-[11px] text-slate-400 mt-[1px]">{action.desc}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 shrink-0 transition-all group-hover:text-[#1e4d8a] group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right column: Recent Findings */}
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between p-4 px-5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                <h3 className="text-[12.5px] font-bold text-slate-800 uppercase tracking-[0.05em] m-0">Recent Findings</h3>
              </div>
              <Link href="/findings" className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#1e4d8a] hover:text-[#1a3a6a] transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {data.recent_findings.length === 0 ? (
              <div className="py-12 px-5 text-center">
                <Plane size={28} className="text-slate-300 mx-auto mb-2.5" />
                <p className="text-sm font-semibold text-slate-400 mb-1">No findings yet</p>
                <p className="text-xs text-slate-300 m-0">Run a due diligence case to see results here</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.recent_findings.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                  >
                    <Link href={`/cases/${f.case_id}`} className="block px-5 py-3.5 border-b border-slate-200 last:border-b-0 hover:bg-sky-50/50 transition-colors text-decoration-none">
                      <div className="flex items-center justify-between mb-1.5">
                        <SeverityBadge severity={f.severity} size="sm" />
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {formatConfidence(f.confidence)}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-slate-800 mb-1 leading-snug">{truncate(f.title, 65)}</p>
                      <div className="text-[11.5px] text-slate-400 flex items-center gap-1.5">
                        <span className="font-semibold text-[#1e4d8a] font-mono text-[11px]">{f.registration}</span>
                        <span className="text-slate-300">·</span>
                        <span>{f.category}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
