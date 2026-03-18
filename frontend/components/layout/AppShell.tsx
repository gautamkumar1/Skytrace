"use client";

import Sidebar from "./Sidebar";
import LoadingScreen from "../ui/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Show loading screen for 2 seconds on initial load
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence>
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <LoadingScreen />
                    </motion.div>
                )}
            </AnimatePresence>

            {!loading && (
                <motion.div
                    className="flex min-h-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                    <motion.main
                        className="flex-1 min-h-screen flex flex-col bg-white"
                        animate={{ marginLeft: collapsed ? 72 : 240 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="flex-1 w-full h-full overflow-hidden pt-0 animate-[fadeIn_0.35s_ease-out]">
                            {children}
                        </div>
                    </motion.main>
                </motion.div>
            )}
        </>
    );
}
