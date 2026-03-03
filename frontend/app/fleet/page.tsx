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
                    className="page-section"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="page-section__header">
                        <h3 className="page-section__title">
                            Fleet Summary
                            <span className="page-section__count">{data.length} cases</span>
                        </h3>
                    </div>
                    <FleetTable data={data} />
                </motion.div>
            )}
        </>
    );
}
