"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
    Shield, Plane, FileText, Gauge, Cpu, BarChart3,
    ArrowRight, CheckCircle, Upload, Brain, LineChart,
    Menu, X, ChevronRight, Globe, Lock, Zap,
    Scale, Users, Box, Layers, ShieldCheck
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
        title: "Proprietary AI-Powered Findings",
        desc: "AI analysis of technical records surfaces critical issues, flags, and advisories — reducing manual review time by up to 80%.",
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
        desc: "Track EGT margins, oil consumption, vibration levels, and cycle counts across engine types with trend analysis(v2).",
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
        desc: "Ingest maintenance logs, shop visit reports, and ADs. Our AI extracts structured data and cross-references against regulatory databases.",
        color: "#7c3aed",
    },
    {
        icon: BarChart3,
        title: "Risk Dashboards",
        desc: "Severity distributions, confidence scoring, and portfolio-level risk views for technical and compliance teams.",
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
        title: "Human in the Loop",
        desc: "Experts review, approve, flag, or reject findings with full audit trails. Export board-ready reports for redelivery, negotiations, or audits.",
    },
];

const STATS = [
    { value: "XX", label: "Documents Processed" },
    { value: "XX", label: "Findings Generated" },
    { value: "95 %", label: "Accuracy Rate (Beta)" },
    { value: "80%", label: "Time Saved (Beta)" },
];

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans" style={{ fontFamily: "var(--font-geist-sans, 'Manrope', system-ui, sans-serif)" }}>

            {/* ═══════════════ NAVIGATION ═══════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 no-underline">
                        <img 
                            src="/images/origintraceLogo.png" 
                            alt="OriginTrace Logo" 
                            className="h-40 w-auto object-contain"
                        />
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

                <div className="max-w-[1200px] mx-auto px-6 relative flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <div className="flex-1 max-w-[640px]">
                        {/* Differentiator badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="inline-flex items-center gap-2 bg-white border border-[#e0e8f0] rounded-full px-4 py-1.5 shadow-sm">
                                <Users className="w-3.5 h-3.5 text-[#1a5276]" />
                                <span className="text-[13px] font-semibold text-[#1a2a3a] tracking-wide">Human in the Loop</span>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-white border border-[#e0e8f0] rounded-full px-4 py-1.5 shadow-sm">
                                <Scale className="w-3.5 h-3.5 text-[#1a5276]" />
                                <span className="text-[13px] font-semibold text-[#1a2a3a] tracking-wide">Designed for Regulation</span>
                            </div>
                        </div>

                        <h1 className="text-[48px] md:text-[64px] lg:text-[72px] leading-[1.05] font-extrabold text-[#1a2a3a] tracking-tight mb-4">
                            OriginTrace<span className="text-[#2980b9]">.AI</span>
                        </h1>
                        <p className="text-[20px] md:text-[24px] text-[#2980b9] font-bold tracking-tight mb-6 max-w-[640px]">
                            Aircraft Records Risk Intelligence — Human in the Loop at AI speed and volume.
                        </p>
                        <p className="text-[15px] text-gray-800 leading-relaxed mb-8 max-w-[560px] font-semibold">
                            Capture high-value asset history in permanent digital form. An immutable record layer plus a proprietary AI decision layer — with experts always in the loop for verification and control.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f5fa] text-[#1a5276] font-semibold text-[15px] px-7 py-3.5 rounded-xl border border-[#d0dae5] transition-all no-underline">
                                Sign In
                            </Link>
                            <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-[#1a5276] hover:bg-[#1e6091] text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl transition-all no-underline shadow-md hover:shadow-lg">
                                Start Free Trial
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual on Right Side */}
                    <div className="flex-[1.2] w-full max-w-[440px] lg:max-w-[500px] relative lg:mr-0 lg:scale-90">
                        {/* Soft ambient glow to blend the globe */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#2980b9]/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative animate-float" style={{
                            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in'
                        }}>
                            <Image
                                src="/images/hero1.png"
                                alt="OriginTrace Global Intelligence"
                                width={520}
                                height={64}
                                priority
                                className=""
                                style={{
                                    mixBlendMode: 'multiply',
                                    filter: 'brightness(1.0) contrast(1.10)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ DESIGNED FOR REGULATION + HUMAN IN THE LOOP ═══════════════ */}
            <section id="approach" className="py-14 md:py-16 bg-[#f0f5fa] border-b border-[#e5eaf0]">
                <div className="max-w-[1200px] mx-auto px-6">
                    <p className="text-center text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-6">What makes us different</p>
                    <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#1a2a3a] tracking-tight text-center mb-10 max-w-[640px] mx-auto">
                        Designed for Regulation — with Human-in-the-Loop at the core
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[850px] mx-auto">
                        <div className="bg-white rounded-2xl border border-[#e0e8f0] p-6 md:p-7 shadow-sm flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-[#1a5276]/10 flex items-center justify-center mb-4">
                                <Scale className="w-6 h-6 text-[#1a5276]" />
                            </div>
                            <h3 className="text-[17px] font-bold text-[#1a2a3a] mb-2 tracking-tight">Designed for Regulation</h3>
                            <p className="text-[14px] text-[#5a6b7d] leading-[1.7] font-semibold">
                                Traceability, compliance, and auditability built in. Our workflows, evidence chains, and approvals are designed for regulated environments from day one.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-[#e0e8f0] p-6 md:p-7 shadow-sm flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-[#1a5276]/10 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-[#1a5276]" />
                            </div>
                            <h3 className="text-[17px] font-bold text-[#1a2a3a] mb-2 tracking-tight">Human in the Loop</h3>
                            <p className="text-[14px] text-[#5a6b7d] leading-[1.7] font-semibold">
                                OriginTrace AI accelerates analysis; experts own the decisions. Approve, flag, or reject findings with full audit trails. Our platform augments your team — it never replaces judgement where it matters most.
                            </p>
                        </div>
                    </div>
                    <p className="text-center text-[14px] font-semibold text-[#5a6b7d] mt-8 max-w-[560px] mx-auto leading-relaxed">
                        <strong className="text-[#1a2a3a]">Proprietary AI is the engine.</strong> We deliver speed and volume with Human-in-the-Loop control — so you get results without sacrificing Human oversight.
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
                            From document ingestion to board-ready reports — a complete toolkit for risk scored document intelligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className={`bg-white rounded-2xl border border-[#e8edf2] p-7 transition-all duration-200 hover:border-[#cdd8e4] hover:shadow-md group ${i === FEATURES.length - 1 && FEATURES.length % 3 === 1 ? "lg:col-start-2" : ""
                                    }`}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                                    style={{ backgroundColor: f.color + "0d", color: f.color }}
                                >
                                    <f.icon className="w-[22px] h-[22px]" />
                                </div>
                                <h3 className="text-[16px] font-bold text-[#1a2a3a] mb-2 tracking-tight">{f.title}</h3>
                                <p className="text-[14px] font-semibold text-[#5a6b7d] leading-[1.7]">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ DRONE/UAV COMPLIANCE SECTION ═══════════════ */}
            <section id="drone-uav" className="py-24 md:py-32 bg-white relative overflow-hidden border-b border-[#e5eaf0]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-[1200px] mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1a5276]/5 border border-[#1a5276]/10 mb-8">
                                <Box className="w-4 h-4 text-[#1a5276]" />
                                <span className="text-[13px] font-bold text-[#1a5276] uppercase tracking-[0.1em]">Commercial Drone Sector</span>
                            </div>

                            <h2 className="text-[36px] md:text-[48px] font-extrabold text-[#1a2a3a] tracking-tight leading-[1.1] mb-6">
                                Global Drone & UAV<br />
                                <span className="text-blue-600">Origin Tracing</span>
                            </h2>

                            <p className="text-[17px] text-[#5a6b7d] leading-[1.7] mb-10 max-w-[540px] font-medium">
                                Preparing the industry for the <strong className="text-[#1a2a3a]">Mid-2026 EU Regulatory Mandate</strong>. Trace component batches from factory to flight with immutable source verification.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                {[
                                    { icon: Layers, title: "Batch Tracking", desc: "Scale compliance by tracking part batches, not just individual units." },
                                    { icon: ShieldCheck, title: "EU Approved Sources", desc: "Automated verification against EASA approved source lists." },
                                    { icon: Globe, title: "Global Traceability", desc: "Cross-border component lineage via distributed ledger technology." },
                                    { icon: Cpu, title: "Sensor Integrity", desc: "Verify authenticity of critical IMUs, GPS, and optical sensors." },
                                ].map((feature) => (
                                    <div key={feature.title} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <feature.icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-[#1a2a3a] mb-1">{feature.title}</h4>
                                            <p className="text-[13px] text-[#5a6b7d] leading-relaxed font-medium">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-[#1a2a3a] hover:bg-slate-800 text-white font-bold text-[15px] px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl">
                                    Register for 2026 Beta
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1a2a3a] border border-slate-200 font-bold text-[15px] px-8 py-4 rounded-xl transition-all">
                                    View Demo Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="flex-1 order-1 lg:order-2 w-full max-w-[500px] lg:max-w-none">
                            <div className="relative">
                                {/* Visual representation of a Drone/UAV */}
                                <div className="absolute inset-0 bg-blue-600/5 blur-[80px] rounded-full scale-125 translate-y-10" />
                                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/10 overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Globe className="w-64 h-64 text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-10">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[12px] font-bold text-emerald-400 uppercase tracking-widest">Compliance Engine Active</span>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Batch Verification</span>
                                                    <span className="text-xs font-bold text-emerald-400">98.2% Secured</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-emerald-500 w-[98.2%]" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">EU Sources</div>
                                                    <div className="text-2xl font-bold text-white tracking-tight">2,840</div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Audit Logs</div>
                                                    <div className="text-2xl font-bold text-white tracking-tight">124k</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-white/5">
                                            <p className="text-[13px] text-white/50 leading-relaxed font-medium">
                                                "Our UAV manufacturing line is expected to reduce  overhead by 65% while ensuring EU origin traceability."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section id="how-it-works" className="py-24 md:py-32 bg-[#f8fafb] border-y border-[#e5eaf0]/60 relative overflow-hidden">
                {/* Subtle background decorative element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2980b9]/[0.02] rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-[1200px] mx-auto px-6 relative">
                    <div className="text-center mb-16 md:mb-20">
                        <p className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-4">The Process</p>
                        <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#1a2a3a] tracking-tight mb-5">
                            From records to insights in minutes
                        </h2>
                        <p className="text-[15px] text-[#5a6b7d] max-w-[600px] mx-auto leading-relaxed font-medium">
                            Three streamlined steps to transform how your team handles technical due diligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        {STEPS.map((s, i) => (
                            <div key={s.step} className="group relative">
                                {/* Connector line with custom dots */}
                                {i < STEPS.length - 1 && (
                                    <div className="hidden md:block absolute top-[40px] left-[80px] right-[-48px] lg:right-[-64px] h-[2px] z-0">
                                        <div className="w-full h-full border-b-[2px] border-dashed border-[#d0dae5]" />
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-col items-center md:items-start">
                                    {/* Icon container with shadow and hover lift */}
                                    <div className="w-20 h-20 rounded-[22px] bg-white border border-[#d0dae5] shadow-[0_4px_12px_rgba(26,82,118,0.06)] flex items-center justify-center mb-8 transition-all duration-300 group-hover:shadow-[0_12px_24px_rgba(26,82,118,0.12)] group-hover:-translate-y-1 group-hover:border-[#1a5276]/30">
                                        <div className="w-full h-full rounded-[21px] flex items-center justify-center bg-gradient-to-br from-white to-[#f0f5fa]">
                                            <s.icon className="w-8 h-8 text-[#1a5276] transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-start">
                                        <div className="inline-flex items-center gap-2 mb-3">
                                            <span className="text-[13px] font-semibold text-[#2980b9]/40 tracking-widest">{s.step}</span>
                                            <div className="w-8 h-[1px] bg-[#d0dae5]" />
                                        </div>
                                        <h3 className="text-[20px] font-extrabold text-[#1a2a3a] mb-3 tracking-tight group-hover:text-[#1a5276] transition-colors">
                                            {s.title}
                                        </h3>
                                        <p className="text-[14px] font-semibold text-[#5a6b7d] leading-[1.7] max-w-[320px] text-center md:text-left font-medium opacity-90">
                                            {s.desc}
                                        </p>
                                    </div>
                                </div>
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
                            <p className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-3">Why OriginTrace.ai ?</p>
                            <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1a2a3a] tracking-tight mb-5">
                                Designed for Regulation,<br className="hidden md:block" /> with humans in the loop
                            </h2>
                            <p className="text-[15px] text-[#5a6b7d] leading-relaxed mb-8">
                                Proprietary AI powers the analysis. We deliver in a novel, cost-effective way: traceable workflows, expert-in-the-loop approvals, and <strong className="text-[#1a2a3a]">compliance designed in from the start</strong> — so you get speed without sacrificing Human control.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: Lock, text: "SOC 2 compliant data handling with on-prem deployment options" },
                                    { icon: Scale, text: "Designed for Regulation — traceability and auditability built in" },
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
                            <div className="text-[11px] font-bold text-[#2980b9] uppercase tracking-[0.2em] mb-6">Trial Engagement Types</div>
                            <div className="space-y-4">
                                {[
                                    { title: "Single MSN Proof-of-Value", desc: "Full feature deep-dive on one aircraft asset's technical history.", color: "#059669" },
                                    { title: "Portfolio Risk Screening", desc: "Rapid bulk-analysis of 10+ assets for high-level technical risk.", color: "#2980b9" },
                                    { title: "Governance Engine Audit", desc: "Testing the immutable traceability and audit-readiness of AI findings.", color: "#1a5276" },
                                ].map((trial) => (
                                    <div key={trial.title} className="p-4 rounded-xl border border-[#f0f3f7] bg-[#f8fafc] hover:border-[#1a5276]/20 transition-colors group text-left">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: trial.color }} />
                                            <h4 className="text-[14px] font-bold text-[#1a2a3a] group-hover:text-[#1a5276] transition-colors">{trial.title}</h4>
                                        </div>
                                        <p className="text-[12px] text-[#5a6b7d] leading-relaxed font-medium pl-5">{trial.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-[#eef2f6] grid grid-cols-3 gap-4 text-center">
                                {[
                                    { val: "Traceable", label: "Source-linked" },
                                    { val: "Verifiable", label: "Human-in-loop" },
                                    { val: "Audit-Ready", label: "Compliance-first" },
                                ].map((s) => (
                                    <div key={s.val}>
                                        <div className="text-[17px] font-extrabold text-[#1a2a3a] leading-tight">{s.val}</div>
                                        <div className="text-[10px] font-medium text-[#8b99a8] uppercase tracking-wider mt-1.5">{s.label}</div>
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
                        Get AI speed and volume with Human-in-the-Loop control. Designed for Regulation.
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
                        <div className="flex items-center gap-3">
                            <img 
                                src="/images/origintraceLogo.png" 
                                alt="OriginTrace Logo" 
                                className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                            />
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
