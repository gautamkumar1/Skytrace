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
                    className="app-shell"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                    <motion.main
                        className="app-shell__main"
                        animate={{ marginLeft: collapsed ? 68 : 256 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <div className="app-shell__content">{children}</div>
                    </motion.main>
                </motion.div>
            )}
        </>
    );
}
