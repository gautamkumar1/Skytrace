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
                    className="mb-[26px] px-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-3.5 mt-10">
                        <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                            Fleet Summary
                            <span className="rounded-full bg-[#f0f3f7] px-2 py-0.5 text-[11px] font-semibold text-slate-500">{data.length} cases</span>
                        </h3>
                    </div>
                    <FleetTable data={data} />
                </motion.div>
            )}
        </>
    );
}
