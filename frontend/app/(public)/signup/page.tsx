"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        password: "",
    });

    const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => router.push("/dashboard"), 800);
    };

    const passwordChecks = [
        { label: "At least 8 characters", valid: form.password.length >= 8 },
        { label: "Contains a number", valid: /\d/.test(form.password) },
        { label: "Contains uppercase", valid: /[A-Z]/.test(form.password) },
    ];

    return (
        <div className="min-h-screen bg-[#f0f5fa] font-sans flex" style={{ fontFamily: "var(--font-geist-sans, 'Manrope', system-ui, sans-serif)" }}>

            {/* Left Panel — Branding */}
            <div className="hidden lg:flex flex-col justify-between w-[480px] bg-gradient-to-br from-[#1a5276] to-[#0f2d44] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2980b9]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#2980b9]/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                    <Link href="/" className="flex items-center gap-2.5 no-underline mb-16">
                        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                            <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" fill="white" opacity="0.1" />
                            <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
                            <path d="M8 19.5L18 10l10 3-6 4.5 4 5.5H14l-3-2.5-3 2z" fill="white" opacity="0.7" />
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-white tracking-tight leading-none">OriginTrace</span>
                            <span className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.15em] leading-none mt-0.5">Due Diligence</span>
                        </div>
                    </Link>

                    <h2 className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-4">
                        Start your free trial.
                    </h2>
                    <p className="text-[15px] text-white/50 leading-relaxed max-w-[320px] mb-10">
                        Get instant access to AI-powered aircraft due diligence. No credit card required.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {[
                            "Upload unlimited maintenance records",
                            "AI analysis in under 5 minutes",
                            "Interactive fleet dashboards",
                            "Export board-ready reports",
                        ].map((text) => (
                            <div key={text} className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="text-[13px] text-white/60">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="flex items-center gap-3 text-[11px] text-white/30">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        <span>SOC 2 Type II Certified · 256-bit encryption</span>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-[400px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8">
                        <Link href="/" className="flex items-center gap-2 no-underline">
                            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                                <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" fill="#1a5276" opacity="0.12" />
                                <path d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z" stroke="#1a5276" strokeWidth="1.5" fill="none" />
                                <path d="M8 19.5L18 10l10 3-6 4.5 4 5.5H14l-3-2.5-3 2z" fill="#2980b9" />
                            </svg>
                            <span className="text-[14px] font-bold text-[#1a2a3a]">OriginTrace</span>
                        </Link>
                    </div>

                    <h1 className="text-[24px] font-extrabold text-[#1a2a3a] tracking-tight mb-1">Create your account</h1>
                    <p className="text-[14px] text-[#5a6b7d] mb-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#2980b9] font-semibold no-underline hover:text-[#1a5276] transition-colors">
                            Sign in
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#2c3e50] uppercase tracking-wider mb-2">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={update("name")}
                                placeholder="John Smith"
                                required
                                className="w-full h-12 px-4 bg-white border border-[#d0dae5] rounded-xl text-[14px] text-[#1a2a3a] placeholder:text-[#b0bac5] outline-none transition-all focus:border-[#2980b9] focus:shadow-[0_0_0_3px_rgba(41,128,185,0.08)]"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-[#2c3e50] uppercase tracking-wider mb-2">Work Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={update("email")}
                                placeholder="john@aercap.com"
                                required
                                className="w-full h-12 px-4 bg-white border border-[#d0dae5] rounded-xl text-[14px] text-[#1a2a3a] placeholder:text-[#b0bac5] outline-none transition-all focus:border-[#2980b9] focus:shadow-[0_0_0_3px_rgba(41,128,185,0.08)]"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-[#2c3e50] uppercase tracking-wider mb-2">Company</label>
                            <input
                                type="text"
                                value={form.company}
                                onChange={update("company")}
                                placeholder="AerCap Holdings"
                                required
                                className="w-full h-12 px-4 bg-white border border-[#d0dae5] rounded-xl text-[14px] text-[#1a2a3a] placeholder:text-[#b0bac5] outline-none transition-all focus:border-[#2980b9] focus:shadow-[0_0_0_3px_rgba(41,128,185,0.08)]"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-semibold text-[#2c3e50] uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={update("password")}
                                    placeholder="Create a secure password"
                                    required
                                    className="w-full h-12 px-4 pr-11 bg-white border border-[#d0dae5] rounded-xl text-[14px] text-[#1a2a3a] placeholder:text-[#b0bac5] outline-none transition-all focus:border-[#2980b9] focus:shadow-[0_0_0_3px_rgba(41,128,185,0.08)]"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#5a6b7d] transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Password strength */}
                            {form.password.length > 0 && (
                                <div className="mt-2.5 flex gap-3">
                                    {passwordChecks.map((c) => (
                                        <div key={c.label} className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${c.valid ? "text-emerald-600" : "text-[#b0bac5]"}`}>
                                            <CheckCircle className="w-3 h-3" />
                                            {c.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#1a5276] hover:bg-[#1e6091] text-white font-semibold text-[14px] rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[11px] text-[#9ca3af]">
                        By creating an account, you agree to our{" "}
                        <a href="#" className="text-[#5a6b7d] no-underline hover:text-[#2980b9]">Terms</a>
                        {" "}and{" "}
                        <a href="#" className="text-[#5a6b7d] no-underline hover:text-[#2980b9]">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
