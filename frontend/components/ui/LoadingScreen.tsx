"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap } from "lucide-react";

/**
 * Corporate Standard Loading Screen for OriginTrace.ai
 * Focuses on professional branding, due diligence, and high-end typography.
 */

function CloudSVG({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 40" fill="none" className={className}>
            <circle cx="20" cy="30" r="10" fill="white" fillOpacity="0.8" />
            <circle cx="40" cy="25" r="15" fill="white" fillOpacity="0.6" />
            <circle cx="60" cy="30" r="10" fill="white" fillOpacity="0.8" />
        </svg>
    );
}

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200">

            {/* Animated Subtle Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{ top: `${20 + (i * 25)}%`, left: "-20%" }}
                        initial={{ x: "-10vw", opacity: 0.3 }}
                        animate={{ x: "120vw" }}
                        transition={{
                            duration: 20 + (i * 5),
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 4
                        }}
                    >
                        <CloudSVG className="w-64" />
                    </motion.div>
                ))}
            </div>

            {/* Corporate Glass Container */}
            <div className="relative z-10 w-full max-w-lg px-8">
                <motion.div
                    className="relative overflow-hidden bg-white/30 backdrop-blur-3xl rounded-[48px] p-14 shadow-[0_32px_80px_rgba(7,89,133,0.1)] text-center"
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Brand Identity Section */}
                    <div className="mb-12 space-y-6">
                        {/* Animated Brand Pulse */}
                        <motion.div
                            className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-3xl shadow-xl border border-sky-100"
                            animate={{
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 0 0 0 rgba(7, 89, 133, 0.1)",
                                    "0 0 0 20px rgba(7, 89, 133, 0)",
                                    "0 0 0 0 rgba(7, 89, 133, 0)"
                                ]
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ShieldCheck className="w-10 h-10 text-sky-600" />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center justify-center gap-2"
                            >
                                <span className="text-4xl font-extrabold tracking-tight text-sky-950">
                                    OriginTrace<span className="text-sky-500">.ai</span>
                                </span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-950/5 rounded-full border border-sky-950/10"
                            >
                                <Zap className="w-3.5 h-3.5 text-sky-600" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-sky-800">
                                    Due Diligence Suite
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Loading Information */}
                    <div className="space-y-6">
                        <motion.p
                            className="text-sky-900/60 text-sm font-semibold tracking-wide"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            Initializing technical audit framework...
                        </motion.p>

                        {/* Premium Corporate Progress Indicator */}
                        <div className="relative h-2 w-full bg-sky-900/5 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 via-sky-600 to-sky-400 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                style={{ backgroundSize: "200% 100%" }}
                            />
                            {/* Shimmer effect on bar */}
                            <motion.div
                                className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </div>

                    {/* Sleek edge reflection */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
                </motion.div>
            </div>

            <style jsx>{`
        /* Custom styles if needed for standard components */
      `}</style>
        </div>
    );
}
