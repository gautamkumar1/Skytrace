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
        <div className="empty-state">
          <div className="empty-state__icon"><AlertTriangle size={28} /></div>
          <h3 className="empty-state__title">Connection Error</h3>
          <p className="empty-state__description">
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
        className="kpi-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="kpi" style={{ "--kpi-color": "#1e4d8a" } as React.CSSProperties}>
          <div className="kpi__icon"><Plane size={18} /></div>
          <div className="kpi__data">
            <span className="kpi__number">{data.total_cases}</span>
            <span className="kpi__title">Active Cases</span>
          </div>
        </div>

        <div className="kpi" style={{ "--kpi-color": "#e11d48" } as React.CSSProperties}>
          <div className="kpi__icon"><Shield size={18} /></div>
          <div className="kpi__data">
            <span className="kpi__number">{data.total_findings}</span>
            <span className="kpi__title">AI Findings</span>
          </div>
          {stopCount > 0 && (
            <span className="kpi__tag kpi__tag--danger">{stopCount} critical</span>
          )}
        </div>

        <div className="kpi" style={{ "--kpi-color": "#059669" } as React.CSSProperties}>
          <div className="kpi__icon"><FileText size={18} /></div>
          <div className="kpi__data">
            <span className="kpi__number">{data.total_documents}</span>
            <span className="kpi__title">Documents</span>
          </div>
        </div>

        <div className="kpi" style={{ "--kpi-color": "#0284c7" } as React.CSSProperties}>
          <div className="kpi__icon"><Activity size={18} /></div>
          <div className="kpi__data">
            <span className="kpi__number">{data.total_engine_metrics}</span>
            <span className="kpi__title">Engine Metrics</span>
          </div>
        </div>
      </motion.div>

      {/* ── Alert Banner (only if critical findings) ── */}
      {stopCount > 0 && (
        <motion.div
          className="dash-alert"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="dash-alert__icon">
            <Zap size={16} />
          </div>
          <div className="dash-alert__text">
            <strong>{stopCount} critical finding{stopCount > 1 ? "s" : ""}</strong> require{stopCount === 1 ? "s" : ""} immediate attention
            {flagCount > 0 && <span className="dash-alert__sub"> · {flagCount} flagged for review</span>}
          </div>
          <Link href="/findings" className="dash-alert__action">
            Review now <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* ── Main Content: 2-column layout ── */}
      <div className="dash-grid">
        {/* Left column: Severity + Quick Actions */}
        <motion.div
          className="dash-col-left"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Severity Breakdown */}
          <div className="dash-card">
            <div className="dash-card__header">
              <div className="dash-card__header-left">
                <BarChart3 size={15} className="dash-card__header-icon" />
                <h3 className="dash-card__title">Risk Distribution</h3>
              </div>
              <span className="dash-card__count">{data.total_findings}</span>
            </div>

            <div className="dash-severity">
              {/* Donut Chart */}
              <div className="dash-severity__chart">
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
                <div className="dash-severity__chart-center">
                  <span className="dash-severity__chart-value">{data.total_findings}</span>
                  <span className="dash-severity__chart-label">Total</span>
                </div>
              </div>

              {/* Legend items */}
              <div className="dash-severity__legend">
                {severities.map((sev) => {
                  const count = data.severity_counts[sev] || 0;
                  const pct = data.total_findings > 0
                    ? Math.round((count / data.total_findings) * 100)
                    : 0;
                  return (
                    <div
                      key={sev}
                      className="dash-severity__item"
                      style={{ borderColor: sevColors[sev].ring }}
                    >
                      <div
                        className="dash-severity__dot"
                        style={{ backgroundColor: sevColors[sev].bar }}
                      />
                      <div className="dash-severity__item-info">
                        <span className="dash-severity__item-count">{count}</span>
                        <span className="dash-severity__item-label">{sevColors[sev].label} · {pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card">
            <div className="dash-card__header">
              <div className="dash-card__header-left">
                <Zap size={15} className="dash-card__header-icon" />
                <h3 className="dash-card__title">Quick Actions</h3>
              </div>
            </div>
            <div className="dash-actions">
              {[
                { href: "/fleet", icon: <Plane size={18} />, title: "Fleet Overview", desc: "Aircraft & case statuses" },
                { href: "/findings", icon: <AlertTriangle size={18} />, title: "Findings", desc: "Review & submit feedback" },
                { href: "/engine-health", icon: <Gauge size={18} />, title: "Engine Health", desc: "Performance monitoring" },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="dash-action">
                  <div className="dash-action__icon">{action.icon}</div>
                  <div className="dash-action__text">
                    <span className="dash-action__title">{action.title}</span>
                    <span className="dash-action__desc">{action.desc}</span>
                  </div>
                  <ChevronRight size={16} className="dash-action__arrow" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right column: Recent Findings */}
        <motion.div
          className="dash-col-right"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="dash-card dash-card--flush">
            <div className="dash-card__header dash-card__header--bordered">
              <div className="dash-card__header-left">
                <Clock size={15} className="dash-card__header-icon" />
                <h3 className="dash-card__title">Recent Findings</h3>
              </div>
              <Link href="/findings" className="dash-card__link">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {data.recent_findings.length === 0 ? (
              <div className="dash-empty">
                <Plane size={28} className="dash-empty__icon" />
                <p className="dash-empty__title">No findings yet</p>
                <p className="dash-empty__desc">Run a due diligence case to see results here</p>
              </div>
            ) : (
              <div className="dash-findings">
                {data.recent_findings.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                  >
                    <Link href={`/cases/${f.case_id}`} className="dash-finding">
                      <div className="dash-finding__top">
                        <SeverityBadge severity={f.severity} size="sm" />
                        <span className="dash-finding__confidence">
                          {formatConfidence(f.confidence)}
                        </span>
                      </div>
                      <p className="dash-finding__title">{truncate(f.title, 65)}</p>
                      <div className="dash-finding__meta">
                        <span className="dash-finding__reg">{f.registration}</span>
                        <span className="dash-finding__sep">·</span>
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
