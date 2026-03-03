"use client";

import { motion } from "framer-motion";

/* ─── Sleek Private Jet SVG ─── */
function PrivateJetSVG({ style }: { style?: React.CSSProperties }) {
    return (
        <svg
            style={style}
            viewBox="0 0 200 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Shadow / ground reflection */}
            <ellipse cx="100" cy="62" rx="60" ry="3" fill="#0c1d36" opacity="0.06" />

            {/* ── Fuselage ── sleek elongated body */}
            <path
                d="M28 35 Q28 28 42 27 L155 27 Q172 27 178 32 L185 35 Q178 38 172 38 L42 38 Q28 38 28 35 Z"
                fill="url(#fuselageGrad)"
                stroke="#8a9bb3"
                strokeWidth="0.7"
            />

            {/* Fuselage highlight (top reflection) */}
            <path
                d="M45 28 L155 28 Q168 28 173 30 L50 30 Q44 30 45 28 Z"
                fill="white"
                opacity="0.35"
            />

            {/* ── Nose cone ── sharp aerodynamic */}
            <path
                d="M178 32 L195 34 Q198 35 195 36 L178 38 Z"
                fill="url(#noseGrad)"
            />

            {/* ── Cockpit windshield ── */}
            <path
                d="M170 29.5 L180 33 L180 34 L170 31 Z"
                fill="#5ba8d9"
                opacity="0.85"
            />
            <path
                d="M165 29.5 L170 29.5 L170 31 L165 31.5 Z"
                fill="#4a9acc"
                opacity="0.7"
            />

            {/* ── Tail vertical stabilizer ── tall, swept */}
            <path
                d="M32 27 L22 8 L36 8 Q40 8 40 12 L38 27 Z"
                fill="url(#tailGrad)"
            />
            {/* Tail tip accent */}
            <path
                d="M22 8 L28 8 L32 14 L26 14 Z"
                fill="#c9a84c"
                opacity="0.9"
            />

            {/* ── Tail horizontal stabilizers ── */}
            <path
                d="M30 33 L18 24 L38 26 L36 33 Z"
                fill="#e8edf3"
                stroke="#c8d3e0"
                strokeWidth="0.3"
            />
            <path
                d="M30 35 L18 42 L38 40 L36 35 Z"
                fill="#e8edf3"
                stroke="#c8d3e0"
                strokeWidth="0.3"
            />

            {/* ── Main wings ── swept delta style */}
            {/* Top wing */}
            <path
                d="M85 27 L70 10 L120 10 Q125 10 125 14 L110 27 Z"
                fill="url(#wingGrad)"
                stroke="#b8c6d6"
                strokeWidth="0.3"
            />
            {/* Bottom wing */}
            <path
                d="M85 38 L70 55 L120 55 Q125 55 125 51 L110 38 Z"
                fill="url(#wingGrad)"
                stroke="#b8c6d6"
                strokeWidth="0.3"
            />

            {/* ── Winglets ── upward curved tips */}
            <path
                d="M70 10 L66 4 L72 4 L74 10 Z"
                fill="#1e4d8a"
                opacity="0.8"
            />
            <path
                d="M70 55 L66 61 L72 61 L74 55 Z"
                fill="#1e4d8a"
                opacity="0.8"
            />

            {/* ── Engine (rear-mounted, left) ── */}
            <ellipse cx="42" cy="23" rx="10" ry="3.5" fill="#3d4f63" />
            <ellipse cx="33" cy="23" rx="3" ry="3" fill="#1e293b" />
            <circle cx="33" cy="23" r="2" fill="#475569" />
            {/* Engine pylon */}
            <rect x="40" y="26" width="4" height="2" rx="0.5" fill="#94a3b8" opacity="0.6" />

            {/* ── Engine (rear-mounted, right) ── */}
            <ellipse cx="42" cy="42" rx="10" ry="3.5" fill="#3d4f63" />
            <ellipse cx="33" cy="42" rx="3" ry="3" fill="#1e293b" />
            <circle cx="33" cy="42" r="2" fill="#475569" />
            {/* Engine pylon */}
            <rect x="40" y="37" width="4" height="2" rx="0.5" fill="#94a3b8" opacity="0.6" />

            {/* ── Cabin windows ── evenly spaced */}
            {[60, 68, 76, 84, 92, 100, 108, 116, 124, 132, 140, 148, 155].map((x, i) => (
                <rect
                    key={i}
                    x={x}
                    y="29.5"
                    width="3.5"
                    height="2.5"
                    rx="1.2"
                    fill="#334155"
                    opacity="0.35"
                />
            ))}

            {/* ── Gold pinstripe ── luxury accent line */}
            <line x1="38" y1="35" x2="180" y2="35" stroke="#c9a84c" strokeWidth="0.7" opacity="0.5" />
            {/* Navy cheatline */}
            <line x1="38" y1="33.5" x2="180" y2="33.5" stroke="#1e4d8a" strokeWidth="0.6" opacity="0.4" />

            {/* ── Door outline ── */}
            <rect x="162" y="28.5" width="4" height="7" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.4" opacity="0.5" />

            {/* ── Gradients ── */}
            <defs>
                <linearGradient id="fuselageGrad" x1="28" y1="27" x2="28" y2="40">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#f5f7fa" />
                    <stop offset="100%" stopColor="#e4e9f0" />
                </linearGradient>
                <linearGradient id="noseGrad" x1="178" y1="32" x2="198" y2="35">
                    <stop offset="0%" stopColor="#f0f4f8" />
                    <stop offset="100%" stopColor="#b0bcc8" />
                </linearGradient>
                <linearGradient id="tailGrad" x1="22" y1="8" x2="40" y2="27">
                    <stop offset="0%" stopColor="#1e4d8a" />
                    <stop offset="60%" stopColor="#1a3a63" />
                    <stop offset="100%" stopColor="#122b4d" />
                </linearGradient>
                <linearGradient id="wingGrad" x1="70" y1="10" x2="125" y2="10">
                    <stop offset="0%" stopColor="#eef2f7" />
                    <stop offset="100%" stopColor="#f5f7fa" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ─── Cloud SVG ─── */
function CloudSVG({ style }: { style?: React.CSSProperties }) {
    return (
        <svg style={style} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="25" rx="40" ry="12" fill="white" opacity="0.5" />
            <ellipse cx="35" cy="20" rx="22" ry="14" fill="white" opacity="0.6" />
            <ellipse cx="60" cy="18" rx="25" ry="16" fill="white" opacity="0.55" />
            <ellipse cx="45" cy="15" rx="18" ry="12" fill="white" opacity="0.7" />
        </svg>
    );
}

/* ─── Main Loading Screen ─── */
export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            {/* Sky gradient background */}
            <div className="loading-screen__sky" />

            {/* Animated clouds - scrolling left to simulate forward movement */}
            <motion.div
                className="loading-screen__cloud loading-screen__cloud--1"
                initial={{ x: "100vw" }}
                animate={{ x: "-200px" }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 0 }}
            >
                <CloudSVG style={{ width: 160, opacity: 0.4 }} />
            </motion.div>

            <motion.div
                className="loading-screen__cloud loading-screen__cloud--2"
                initial={{ x: "110vw" }}
                animate={{ x: "-250px" }}
                transition={{ duration: 5, ease: "linear", repeat: Infinity, repeatDelay: 0, delay: 0.8 }}
            >
                <CloudSVG style={{ width: 200, opacity: 0.3 }} />
            </motion.div>

            <motion.div
                className="loading-screen__cloud loading-screen__cloud--3"
                initial={{ x: "105vw" }}
                animate={{ x: "-180px" }}
                transition={{ duration: 3.5, ease: "linear", repeat: Infinity, repeatDelay: 0, delay: 1.5 }}
            >
                <CloudSVG style={{ width: 120, opacity: 0.25 }} />
            </motion.div>

            <motion.div
                className="loading-screen__cloud loading-screen__cloud--4"
                initial={{ x: "120vw" }}
                animate={{ x: "-220px" }}
                transition={{ duration: 6, ease: "linear", repeat: Infinity, repeatDelay: 0, delay: 0.3 }}
            >
                <CloudSVG style={{ width: 140, opacity: 0.2 }} />
            </motion.div>

            {/* Airplane — takeoff animation: accelerates along runway then lifts off */}
            <motion.div
                className="loading-screen__airplane"
                initial={{ x: "-15vw", y: "0vh", rotate: 0, scale: 0.85 }}
                animate={{
                    x: ["-15vw", "10vw", "25vw", "40vw"],
                    y: ["0vh", "0vh", "-12vh", "-28vh"],
                    rotate: [0, 0, -12, -18],
                    scale: [0.85, 1, 1.05, 1.1],
                }}
                transition={{
                    duration: 2.8,
                    ease: [0.22, 0.1, 0.36, 1],
                    times: [0, 0.35, 0.65, 1],
                }}
            >
                <PrivateJetSVG style={{ width: 220 }} />
            </motion.div>

            {/* Runway / ground */}
            <motion.div
                className="loading-screen__ground"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.2, duration: 1.0, ease: "easeOut" }}
            >
                {/* Runway markings */}
                <div className="loading-screen__runway">
                    <div className="loading-screen__runway-line" />
                    <div className="loading-screen__runway-dashes">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className="loading-screen__runway-dash" />
                        ))}
                    </div>
                    <div className="loading-screen__runway-line" />
                </div>
            </motion.div>

            {/* Contrail / exhaust trail */}
            <motion.div
                className="loading-screen__contrail"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: [0, 0.5, 0.25], width: "45vw" }}
                transition={{ delay: 0.8, duration: 2.0, ease: "easeOut" }}
            />

            {/* Text overlay */}
            <div className="loading-screen__text">
                <motion.p
                    className="loading-screen__title"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Cleared for Takeoff
                </motion.p>
                <motion.p
                    className="loading-screen__subtitle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    Pre-flight checks complete · Connecting to fleet operations
                </motion.p>

                {/* Progress bar */}
                <motion.div
                    className="loading-screen__progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <motion.div
                        className="loading-screen__progress-fill"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.8, duration: 1.8, ease: "easeInOut" }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
