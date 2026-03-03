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
} from "lucide-react";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/fleet", icon: Plane, label: "Fleet Overview" },
    { href: "/findings", icon: AlertTriangle, label: "AI Findings" },
    { href: "/engine-health", icon: Gauge, label: "Engine Health" },
    { href: "/documents", icon: FileText, label: "Documents" },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <motion.aside
            className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
            animate={{ width: collapsed ? 68 : 256 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        >
            {/* Brand */}
            <div className="sidebar__brand" style={{
                flexDirection: collapsed ? "column" : "row",
                alignItems: "center",
                gap: collapsed ? 8 : 0,
                padding: collapsed ? "14px 8px" : "18px 16px",
            }}>
                <div className="sidebar__logo">
                    <Plane className="sidebar__logo-icon" />
                    {!collapsed && (
                        <motion.div
                            className="sidebar__brand-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className="sidebar__brand-title">Aviation AI</span>
                            <span className="sidebar__brand-subtitle">Due Diligence</span>
                        </motion.div>
                    )}
                </div>
                <button
                    className="sidebar__toggle"
                    onClick={onToggle}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar__nav">
                <ul className="sidebar__nav-list">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`sidebar__link ${isActive(item.href) ? "sidebar__link--active" : ""}`}
                            >
                                <item.icon size={18} className="sidebar__link-icon" />
                                {!collapsed && (
                                    <motion.span
                                        className="sidebar__link-label"
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.aside>
    );
}
