"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Plane,
    AlertTriangle,
    Gauge,
    FileText,
    ChevronLeft,
    ChevronRight,
    Cpu,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/fleet", icon: Plane, label: "Fleet Overview" },
    { href: "/findings", icon: AlertTriangle, label: "AI Findings" },
    { href: "/engine-health", icon: Gauge, label: "Engine Health" },
    { href: "/avionics", icon: Cpu, label: "Avionics" },
    { href: "/documents", icon: FileText, label: "Documents" },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <motion.aside
            className="fixed top-0 left-0 bottom-0 bg-[#e6f0fa] flex flex-col z-50 overflow-hidden shadow-[1px_0_0_rgba(0,0,0,0.05)]"
            animate={{ width: collapsed ? 68 : 225 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        >
            {/* Brand */}
            <div className={`flex justify-between border-b border-[#f1f5f9] min-h-[64px] ${collapsed ? "flex-col items-center gap-2 py-3.5 px-2" : "flex-row items-center gap-0 py-[18px] px-4"}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <svg
                        className="shrink-0 w-8 h-8"
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Shield shape */}
                        <path
                            d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z"
                            fill="#1a5276"
                            opacity="0.12"
                        />
                        <path
                            d="M18 2L4 8v10c0 9.1 6 17 14 18 8-1 14-8.9 14-18V8L18 2z"
                            stroke="#1a5276"
                            strokeWidth="1.5"
                            fill="none"
                        />
                        {/* Stylized wing / aircraft */}
                        <path
                            d="M8 19.5L18 10l10 3-6 4.5 4 5.5H14l-3-2.5-3 2z"
                            fill="#2980b9"
                        />
                    </svg>
                    {!collapsed && (
                        <motion.div
                            className="flex flex-col whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className="text-[15px] font-extrabold text-[#1a2a3a] tracking-tight">OriginTrace.ai</span>
                            <span className="text-[10px] text-[#2980b9] font-bold tracking-widest uppercase">Due Diligence</span>
                        </motion.div>
                    )}
                </div>
                <button
                    className="bg-slate-50 border border-slate-200 rounded-sm text-slate-500 cursor-pointer p-[5px] flex items-center justify-center transition-all shrink-0 hover:bg-slate-100 hover:text-slate-900"
                    onClick={onToggle}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
                <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md no-underline text-[13.5px] transition-all relative ${active
                                            ? "bg-[#f0f9ff] text-[#1a5276] font-bold before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[22px] before:bg-[#2980b9] before:rounded-r-sm"
                                            : "text-slate-500 font-semibold hover:bg-[#f8fafb] hover:text-[#1a2a3a]"
                                        }`}
                                >
                                    <item.icon size={18} className="shrink-0" />
                                    {!collapsed && (
                                        <motion.span
                                            className="whitespace-nowrap"
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </motion.aside>
    );
}
