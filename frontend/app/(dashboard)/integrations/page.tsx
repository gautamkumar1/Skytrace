"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Cloud, Database, Radio, Wrench, CheckCircle2, Clock, FileText, Book, Globe, Shield } from "lucide-react";

type IntegrationStatus = "connected" | "pending";

interface Integration {
    id: string;
    name: string;
    description: string;
    region?: string;
    status: IntegrationStatus;
    icon: React.ReactNode;
}

function StatusPill({ status }: { status: IntegrationStatus }) {
    if (status === "connected") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Pending setup
        </span>
    );
}

function IntegrationCard({ integration }: { integration: Integration }) {
    return (
        <motion.div
            className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        {integration.icon}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="m-0 text-[13px] font-bold text-slate-900">{integration.name}</h3>
                            <StatusPill status={integration.status} />
                        </div>
                        <p className="m-0 mt-1 text-[11px] text-slate-500 font-medium">
                            {integration.description}
                            {integration.region ? (
                                <span className="text-slate-400"> · {integration.region}</span>
                            ) : null}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function IntegrationsPage() {
    const integrations: Integration[] = [
        {
            id: "aws-s3",
            name: "AWS S3",
            description: "Document storage",
            region: "us-east-1",
            status: "connected",
            icon: <Cloud className="w-5 h-5" />,
        },
        {
            id: "snowflake",
            name: "Snowflake",
            description: "Data warehouse · Records analytics",
            status: "connected",
            icon: <Database className="w-5 h-5" />,
        },
        {
            id: "adsb",
            name: "ADS-B Exchange",
            description: "Real-time fleet positions",
            status: "connected",
            icon: <Radio className="w-5 h-5" />,
        },
        {
            id: "amos",
            name: "AMOS",
            description: "MRO data feed",
            status: "pending",
            icon: <Wrench className="w-5 h-5" />,
        },
        {
            id: "easa-ad",
            name: "EASA AD",
            description: "Airworthiness Directives",
            status: "connected",
            icon: <FileText className="w-5 h-5" />,
        },
        {
            id: "faa-registry",
            name: "FAA Registry",
            description: "Aircraft Registration Data",
            status: "connected",
            icon: <Book className="w-5 h-5" />,
        },
        {
            id: "icao",
            name: "ICAO",
            description: "Aviation Standards & Data",
            status: "connected",
            icon: <Globe className="w-5 h-5" />,
        },
        {
            id: "ofac",
            name: "OFAC Direct API",
            description: "Sanctions & Compliance screening",
            status: "connected",
            icon: <Shield className="w-5 h-5" />,
        },
    ];

    return (
        <>
            <Header title="Integrations" subtitle="Connected platforms powering ingestion and analytics" />

            <div className="px-2 mt-10">
                <div className="max-w-[980px]">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {integrations.map((i) => (
                            <IntegrationCard key={i.id} integration={i} />
                        ))}
                    </motion.div>

                    <div className="mt-6 text-[11px] text-slate-500">
                        Integrations shown here reflect what’s available in the current environment. “Pending setup” items can be enabled as data feeds are onboarded.
                    </div>
                </div>
            </div>
        </>
    );
}

