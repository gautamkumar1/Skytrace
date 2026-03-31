"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Plane,
    Gauge,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Radio,
    Plug,
    Box,
    Globe,
} from "lucide-react";

const mainNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/fleet", icon: Plane, label: "Fleet" },
    { href: "/engine-health", icon: Gauge, label: "Engines" },
    { href: "/llp", icon: ShieldCheck, label: "Life Limited Parts" },
    { href: "/aircraft", icon: Plane, label: "Aircraft" },
    { href: "/drone-compliance", icon: Box, label: "Drone Trace" },
];

const secondaryNavItems = [
    { href: "/integrations", icon: Plug, label: "Integrations" },
    { href: "/adsb", icon: Radio, label: "Live Traffic" },
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
            className="fixed top-0 left-0 bottom-0 bg-[#f8fbff] flex flex-col z-50 overflow-hidden border-r border-[#0f172a]/[0.06] shadow-[1px_0_0_rgba(15,23,42,0.02)]"
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
            <div className={`flex items-center justify-center ${collapsed ? "min-h-[72px]" : "min-h-[110px]"} px-2 overflow-hidden`}>
                <Link href="/" className="flex items-center justify-center no-underline w-full h-full">
                    <img 
                        src="/images/origintraceLogo.png" 
                        alt="OriginTrace Logo" 
                        className={`${collapsed ? "w-16 h-16" : "w-full h-auto max-h-[80px]"} object-contain scale-[2.2] transition-transform duration-300 hover:scale-[1.5]`}
                    />
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 overflow-y-auto modern-scrollbar">
                <div className="space-y-1">
                    {!collapsed && (
                        <span className="block px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Main Menu</span>
                    )}
                    <ul className="list-none m-0 p-0 space-y-1">
                        {mainNavItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                                            active
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                        }`}
                                    >
                                        <item.icon size={19} className={`shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
                                        {!collapsed && (
                                            <motion.span
                                                className="text-[13.5px] font-semibold whitespace-nowrap"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                        {active && !collapsed && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-200"
                                            />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                        {/* Secondary items – just below Aircraft, grey / de-emphasized */}
                        {secondaryNavItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive(item.href)
                                            ? "bg-slate-500/90 text-white"
                                            : "bg-slate-400/60 text-white hover:bg-slate-600/80"
                                    }`}
                                >
                                    <item.icon
                                        size={19}
                                        className={`shrink-0 ${isActive(item.href) ? "text-white" : "text-white/85 group-hover:text-white"}`}
                                    />
                                    {!collapsed && (
                                        <motion.span
                                            className="text-[13px] font-medium whitespace-nowrap text-white"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                    {isActive(item.href) && !collapsed && (
                                        <motion.div
                                            layoutId={`active-indicator-${item.label}`}
                                            className="absolute right-3 w-1.5 h-1.5 rounded-full bg-slate-400"
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Toggle footer */}
            <div className={`mt-auto p-4 border-t border-[#0f172a]/[0.04] flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
                {!collapsed && (
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Collapse Sidebar</span>
                )}
                <button
                    className={`flex items-center justify-center rounded-xl border border-slate-100 hover:bg-blue-50 transition-all ${
                        collapsed ? "w-10 h-10 text-slate-400 hover:text-blue-600" : "w-8 h-8 text-slate-400 hover:text-blue-600"
                    }`}
                    onClick={onToggle}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </motion.aside>
    );
}
