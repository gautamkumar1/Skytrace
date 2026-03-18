"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import FleetTable from "@/components/fleet/FleetTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/utils";
import type { FleetSummaryRow } from "@/lib/types";
import { Plane } from "lucide-react";

export default function FleetPage() {
    const [data, setData] = useState<FleetSummaryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState<"aircraft_type" | "engine_type">("aircraft_type");

    useEffect(() => {
        apiFetch<FleetSummaryRow[]>("/api/fleet")
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Header
                title="Fleet Overview"
                subtitle="All aircraft cases and their due diligence status"
            />

            {loading ? (
                <LoadingSpinner text="Loading fleet data..." />
            ) : data.length === 0 ? (
                <EmptyState
                    icon={<Plane size={28} />}
                    title="No Cases Found"
                    description="Run a due diligence case using the CLI to see fleet data here."
                />
            ) : (
                <motion.div
                    className="mb-12 px-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 mt-10 gap-6">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Plane size={18} /></div>
                             <h3 className="text-[17px] font-black text-slate-900 uppercase tracking-tight">Fleet Inventory</h3>
                             <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-400">{data.length} Assets</span>
                        </div>

                        <div className="flex items-center bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50 shadow-sm">
                            <button
                                onClick={() => setGroupBy("aircraft_type")}
                                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 rounded-lg cursor-pointer ${
                                    groupBy === "aircraft_type" 
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                                }`}
                            >
                                Aircraft Class
                            </button>
                            <button
                                onClick={() => setGroupBy("engine_type")}
                                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 rounded-lg cursor-pointer ${
                                    groupBy === "engine_type" 
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                                }`}
                            >
                                Powerplant
                            </button>
                        </div>
                    </div>
                    <div className="premium-card overflow-hidden">
                        <FleetTable data={data} groupBy={groupBy} />
                    </div>
                </motion.div>

            )}
        </>
    );
}
