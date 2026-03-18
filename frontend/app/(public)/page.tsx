"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Shield, Plane, FileText, Gauge, Cpu, BarChart3,
    ArrowRight, CheckCircle, Upload, Brain, LineChart,
    Menu, X, ChevronRight, Globe, Lock, Zap,
    Scale, Users
} from "lucide-react";

const NAV_LINKS = [
    { label: "Our Approach", href: "#approach" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
];

const FEATURES = [
    {
        icon: Brain,
        title: "AI-Powered Findings",
        desc: "Automated analysis of technical records surfaces critical issues, flags, and advisories — reducing manual review time by over 80%.",
        color: "#be123c",
    },
    {
        icon: Plane,
        title: "Fleet Management",
        desc: "Centralised view of all aircraft under review with real-time status tracking, document counts, and finding summaries per tail.",
        color: "#1a5276",
    },
    {
        icon: Gauge,
        title: "Engine Health Monitoring",
        desc: "Track EGT margins, oil consumption, vibration levels, and cycle counts across engine types with trend analysis.",
        color: "#059669",
    },
    {
        icon: Cpu,
        title: "Digital Twin Aircraft",
        desc: "Interactive 3D aircraft model with real-time diagnostic overlays showing part-level status from AI-analysed records.",
        color: "#0284c7",
    },
    {
        icon: FileText,
        title: "Document Intelligence",
        desc: "Ingest maintenance logs, shop visit reports, and ADs. AI extracts structured data and cross-references against regulatory databases.",
        color: "#7c3aed",
    },
    {
        icon: BarChart3,
        title: "Risk Dashboards",
        desc: "Severity distributions, confidence scoring, and portfolio-level risk views designed for lessors, MROs, and technical teams.",
        color: "#d97706",
    },
];

const STEPS = [
    {
        step: "01",
        icon: Upload,
        title: "Upload Records",
        desc: "Upload maintenance records, shop visit reports, engine trend data and ADs in any format — PDF, Excel, or structured feeds.",
    },
    {
        step: "02",
        icon: Brain,
        title: "AI Analysis",
        desc: "Our engine analyses every document, extracting findings, cross-referencing regulatory data, and scoring severity with evidence.",
    },
    {
        step: "03",
        icon: LineChart,
        title: "Human in the loop",
        desc: "Experts review, approve, flag, or reject findings with full audit trails. Export board-ready reports for redelivery, negotiations, or audits.",
    },
];

const STATS = [
    { value: "50K+", label: "Documents Processed" },
    { value: "12K+", label: "Findings Generated" },
    { value: "98.7%", label: "Accuracy Rate" },
    { value: "80%", label: "Time Saved" },
];

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans" style={{ fontFamily: "var(--font-geist-sans, 'Manrope', system-ui, sans-serif)" }}>

            {/* ═══════════════ NAVIGATION ═══════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 no-underline">
                        <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                            <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" fill="#1a5276" opacity="0.12" />
                            <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" stroke="#1a5276" strokeWidth="1.5" fill="none" />
                            <path d="M8 19.5L18 10l10 3-6 4.5 4 5.5H14l-3-2.5-3 2z" fill="#2980b9" />
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-[#1a2a3a] tracking-tight leading-none">OriginTace.AI</span>
                            <span className="text-[9px] font-semibold text-[#2980b9] uppercase tracking-[0.15em] leading-none mt-0.5">Know what you own</span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <a key={link.href} href={link.href} className="text-[13px] font-medium text-[#4a5568] hover:text-[#1a5276] transition-colors no-underline">
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="text-[13px] font-semibold text-[#1a5276] hover:text-[#2980b9] transition-colors no-underline px-4 py-2">
                            Sign In
                        </Link>
                        <Link href="/signup" className="text-[13px] font-semibold text-white bg-[#1a5276] hover:bg-[#1e6091] px-5 py-2.5 rounded-lg transition-all no-underline shadow-sm hover:shadow-md">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu toggle */}
                    <button className="md:hidden p-2 text-[#4a5568]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
                        {NAV_LINKS.map((link) => (
                            <a key={link.href} href={link.href} className="block text-sm text-[#4a5568] font-medium no-underline py-1" onClick={() => setMobileMenuOpen(false)}>
                                {link.label}
                            </a>
                        ))}
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link href="/login" className="text-sm font-semibold text-[#1a5276] no-underline py-1">Sign In</Link>
                            <Link href="/signup" className="text-sm font-semibold text-white bg-[#1a5276] px-4 py-2.5 rounded-lg no-underline text-center">Get Started</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#f0f5fa] via-[#f8fafb] to-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#2980b9]/[0.03] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1a5276]/[0.02] rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[1200px] mx-auto px-6 relative">
                    <div className="max-w-[680px]">
                        {/* Differentiator badges: Highly regulated • Human in the loop */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="inline-flex items-center gap-2 bg-white border border-[#e0e8f0] rounded-full px-4 py-1.5 shadow-sm">
                                <Scale className="w-3.5 h-3.5 text-[#1a5276]" />
                                <span className="text-[11px] font-semibold text-[#1a2a3a] tracking-wide">Highly regulated</span>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-white border border-[#e0e8f0] rounded-full px-4 py-1.5 shadow-sm">
                                <Users className="w-3.5 h-3.5 text-[#1a5276]" />
                                <span className="text-[11px] font-semibold text-[#1a2a3a] tracking-wide">Human in the loop</span>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-[#2980b9]/08 border border-[#2980b9]/20 rounded-full px-4 py-1.5">
                                <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
                                <span className="text-[11px] font-semibold text-[#4a5568] tracking-wide uppercase">50K+ Records Processed</span>
                            </div>
                        </div>

                        <h1 className="text-[40px] md:text-[52px] leading-[1.1] font-extrabold text-[#1a2a3a] tracking-tight mb-5">
                            Aircraft due diligence,<br />
                            <span className="text-[#2980b9]">powered by AI.</span>
                        </h1>

                        <p className="text-[17px] md:text-lg text-[#5a6b7d] leading-relaxed mb-4 max-w-[600px]">
                            AI is the engine. Our proprietary advantage is <strong className="text-[#1a2a3a]">how we serve this highly regulated industry</strong> in a novel, cost-effective way — with <strong className="text-[#1a2a3a]">humans always in the loop</strong>.
                        </p>
                        <p className="text-[15px] text-[#6b7c8d] leading-relaxed mb-8 max-w-[560px]">
                            <strong className="text-[#1a2a3a]">OriginTrace.ai</strong> captures high-value physical asset history in permanent digital form. An immutable record layer captures every event from manufacture to today; an AI decision layer surfaces what matters. When an aircraft changes hands, the buyer gets instant, human-in-the-loop, verifiable provenance — not weeks of document archaeology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-[#1a5276] hover:bg-[#1e6091] text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl transition-all no-underline shadow-md hover:shadow-lg">
                                Start Free Trial
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f5fa] text-[#1a5276] font-semibold text-[15px] px-7 py-3.5 rounded-xl border border-[#d0dae5] transition-all no-underline">
                                Sign In
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="mt-10 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {["AJ", "KR", "MS", "TE"].map((initials, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a5276] to-[#2980b9] flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm">
                                        {initials}
                                    </div>
                                ))}
                            </div>
                            <div className="text-[12px] text-[#5a6b7d]">
                                <span className="font-bold text-[#1a2a3a]">Trusted by 40+</span> leasing companies and MROs worldwide
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ TRUST BAR ═══════════════ */}
            <section className="py-10 bg-white border-y border-[#eef2f6]">
                <div className="max-w-[1200px] mx-auto px-6">
                    <p className="text-center text-[11px] font-semibold text-[#9ca3af] uppercase tracking-[0.15em] mb-6">Trusted by industry leaders</p>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40">
                        {["GECAS", "AerCap", "Avolon", "SMBC", "BOC Aviation", "Air Lease Corp"].map((name) => (
                            <span key={name} className="text-[14px] md:text-[16px] font-bold text-[#2c3e50] tracking-wide">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ HIGHLY REGULATED + HUMAN IN THE LOOP ═══════════════ */}
            <section id="approach" className="py-14 md:py-16 bg-[#f0f5fa] border-b border-[#e5eaf0]">
                <div className="max-w-[1200px] mx-auto px-6">
                    <p className="text-center text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-6">What makes us different</p>
                    <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#1a2a3a] tracking-tight text-center mb-10 max-w-[640px] mx-auto">
                        Built for a highly regulated industry — with human-in-the-loop at the core
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[800px] mx-auto">
                        <div className="bg-white rounded-2xl border border-[#e0e8f0] p-6 md:p-7 shadow-sm flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-[#1a5276]/10 flex items-center justify-center mb-4">
                                <Scale className="w-6 h-6 text-[#1a5276]" />
                            </div>
                            <h3 className="text-[17px] font-bold text-[#1a2a3a] mb-2 tracking-tight">Highly regulated by design</h3>
                            <p className="text-[13px] text-[#5a6b7d] leading-[1.7]">
                                Aviation demands traceability, compliance, and auditability. We don’t hide behind a black box — our workflows, evidence chains, and approvals are built for EASA, FAA, and lessor requirements from day one.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-[#e0e8f0] p-6 md:p-7 shadow-sm flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-[#1a5276]/10 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-[#1a5276]" />
                            </div>
                            <h3 className="text-[17px] font-bold text-[#1a2a3a] mb-2 tracking-tight">Human in the loop</h3>
                            <p className="text-[13px] text-[#5a6b7d] leading-[1.7]">
                                AI accelerates analysis; experts own the decisions. Approve, flag, or reject findings with full audit trails. Our platform augments your team — it never replaces judgement where it matters most.
                            </p>
                        </div>
                    </div>
                    <p className="text-center text-[13px] text-[#5a6b7d] mt-8 max-w-[560px] mx-auto leading-relaxed">
                        <strong className="text-[#1a2a3a]">AI is the engine.</strong> Our proprietary edge is how we deliver this in a novel, cost-effective way that fits the way aviation actually works.
                    </p>
                </div>
            </section>

            {/* ═══════════════ FEATURES ═══════════════ */}
            <section id="features" className="py-20 md:py-28 bg-[#f8fafb]">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-14 md:mb-16">
                        <p className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-3">Platform Capabilities</p>
                        <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1a2a3a] tracking-tight mb-4">
                            Everything you need for<br className="hidden md:block" /> technical due diligence
                        </h2>
                        <p className="text-[15px] text-[#5a6b7d] max-w-[520px] mx-auto leading-relaxed">
                            From document ingestion to board-ready reports — a complete toolkit built for aviation professionals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="bg-white rounded-2xl border border-[#e8edf2] p-7 transition-all duration-200 hover:border-[#cdd8e4] hover:shadow-md group"
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                                    style={{ backgroundColor: f.color + "0d", color: f.color }}
                                >
                                    <f.icon className="w-[22px] h-[22px]" />
                                </div>
                                <h3 className="text-[16px] font-bold text-[#1a2a3a] mb-2 tracking-tight">{f.title}</h3>
                                <p className="text-[13px] text-[#5a6b7d] leading-[1.7]">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section id="how-it-works" className="py-20 md:py-28 bg-white">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-14 md:mb-16">
                        <p className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-3">How It Works</p>
                        <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1a2a3a] tracking-tight mb-4">
                            From records to insights in minutes
                        </h2>
                        <p className="text-[15px] text-[#5a6b7d] max-w-[480px] mx-auto leading-relaxed">
                            Three steps to transform how your team handles technical due diligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        {STEPS.map((s, i) => (
                            <div key={s.step} className="relative text-center md:text-left">
                                {/* Connector line */}
                                {i < STEPS.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] right-[-40px] h-px bg-[#d0dae5]" />
                                )}
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f0f5fa] border border-[#d0dae5]/60 mb-5 mx-auto md:mx-0">
                                    <s.icon className="w-7 h-7 text-[#2980b9]" />
                                </div>
                                <div className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.15em] mb-2">{s.step}</div>
                                <h3 className="text-[18px] font-bold text-[#1a2a3a] mb-2 tracking-tight">{s.title}</h3>
                                <p className="text-[13px] text-[#5a6b7d] leading-[1.7] max-w-[320px] mx-auto md:mx-0">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ STATS ═══════════════ */}
            <section className="py-16 md:py-20 bg-[#1a2a3a]">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
                        {STATS.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-[36px] md:text-[42px] font-extrabold text-white tracking-tight leading-none mb-2">{s.value}</div>
                                <div className="text-[12px] md:text-[13px] font-medium text-[#8fa3b8] uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHY / ABOUT ═══════════════ */}
            <section id="about" className="py-20 md:py-28 bg-[#f8fafb]">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div>
                            <p className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-3">Why OriginTrace</p>
                            <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1a2a3a] tracking-tight mb-5">
                                Built for a highly regulated industry,<br className="hidden md:block" /> with humans in the loop
                            </h2>
                            <p className="text-[15px] text-[#5a6b7d] leading-relaxed mb-8">
                                AI powers the analysis. What we do differently is <strong className="text-[#1a2a3a]">how we serve this highly regulated space</strong> in a novel, cost-effective way: traceable workflows, expert-in-the-loop approvals, and compliance built in from the start — so you get speed without sacrificing control.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: Lock, text: "SOC 2 compliant data handling with on-prem deployment options" },
                                    { icon: Globe, text: "Support for EASA, FAA, CAAC and other regulatory frameworks" },
                                    { icon: Zap, text: "Results in minutes, not weeks — with full evidence traceability" },
                                ].map((item) => (
                                    <div key={item.text} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#2980b9]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <item.icon className="w-4 h-4 text-[#2980b9]" />
                                        </div>
                                        <span className="text-[13px] text-[#4a5568] leading-relaxed">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side visual */}
                        <div className="bg-white rounded-2xl border border-[#e8edf2] p-8 shadow-sm">
                            <div className="space-y-5">
                                {[
                                    { label: "Document Processing Accuracy", pct: 98.7, color: "#059669" },
                                    { label: "Finding Detection Rate", pct: 94.2, color: "#2980b9" },
                                    { label: "Time Reduction vs Manual", pct: 82, color: "#1a5276" },
                                ].map((bar) => (
                                    <div key={bar.label}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[12px] font-semibold text-[#2c3e50]">{bar.label}</span>
                                            <span className="text-[12px] font-bold" style={{ color: bar.color }}>{bar.pct}%</span>
                                        </div>
                                        <div className="h-2 bg-[#f0f3f7] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-[#eef2f6] grid grid-cols-3 gap-4 text-center">
                                {[
                                    { val: "250+", label: "Aircraft reviewed" },
                                    { val: "15+", label: "Engine types" },
                                    { val: "24/7", label: "Processing" },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <div className="text-[20px] font-extrabold text-[#1a2a3a]">{s.val}</div>
                                        <div className="text-[10px] font-medium text-[#8b99a8] uppercase tracking-wider mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ CTA ═══════════════ */}
            <section className="py-20 md:py-24 bg-gradient-to-br from-[#1a5276] to-[#1a2a3a] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2980b9]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-[1200px] mx-auto px-6 text-center relative">
                    <h2 className="text-[28px] md:text-[38px] font-extrabold text-white tracking-tight mb-4">
                        Ready to transform your<br className="hidden md:block" /> due diligence process?
                    </h2>
                    <p className="text-[15px] text-[#8fb3d0] max-w-[480px] mx-auto mb-8 leading-relaxed">
                        Join 40+ leasing companies and MROs who trust OriginTrace for faster, more accurate aircraft evaluations.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f5fa] text-[#1a5276] font-semibold text-[15px] px-8 py-3.5 rounded-xl transition-all no-underline shadow-md hover:shadow-lg">
                            Start Free Trial
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/25 hover:border-white/50 font-semibold text-[15px] px-8 py-3.5 rounded-xl transition-all no-underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer className="py-12 bg-[#0f1c2e] border-t border-white/5">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                                <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" fill="#2980b9" opacity="0.2" />
                                <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" stroke="#2980b9" strokeWidth="1.5" fill="none" />
                                <path d="M8 19.5L18 10l10 3-6 4.5 4 5.5H14l-3-2.5-3 2z" fill="#2980b9" />
                            </svg>
                            <span className="text-[14px] font-bold text-white/70">OriginTace.AI</span>
                        </div>

                        <div className="flex flex-wrap gap-6 text-[12px] text-white/40 font-medium">
                            <a href="#" className="hover:text-white/70 transition-colors no-underline">Privacy Policy</a>
                            <a href="#" className="hover:text-white/70 transition-colors no-underline">Terms of Service</a>
                            <a href="#" className="hover:text-white/70 transition-colors no-underline">Security</a>
                            <a href="#" className="hover:text-white/70 transition-colors no-underline">Contact</a>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
                        <span className="text-[11px] text-white/25">© 2026 OriginTrace Technologies Ltd. All rights reserved.</span>
                        <span className="text-[11px] text-white/20">SOC 2 Type II Certified · GDPR Compliant</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
