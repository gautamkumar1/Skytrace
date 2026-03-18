"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Plane, AlertTriangle, Activity, X, Loader2 } from "lucide-react";

interface SearchResult {
    type: "case" | "finding" | "engine";
    id: string;
    title: string;
    subtitle: string;
    href: string;
    severity?: string;
}

interface HeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Debounced search
    const search = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.trim().length < 2) {
            setResults([]);
            setOpen(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(Array.isArray(data) ? data : []);
                    setOpen(true);
                }
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 250);
    }, []);

    useEffect(() => {
        search(query);
    }, [query, search]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard nav
    function handleKeyDown(e: React.KeyboardEvent) {
        if (!open || results.length === 0) {
            if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            navigateTo(results[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    }

    function navigateTo(result: SearchResult) {
        setOpen(false);
        setQuery("");
        setResults([]);
        router.push(result.href);
    }

    function getTypeIcon(type: string) {
        switch (type) {
            case "case": return <Plane size={14} />;
            case "finding": return <AlertTriangle size={14} />;
            case "engine": return <Activity size={14} />;
            default: return <Search size={14} />;
        }
    }

    function getTypeLabel(type: string) {
        switch (type) {
            case "case": return "Case";
            case "finding": return "Finding";
            case "engine": return "Engine";
            default: return type;
        }
    }

    return (
        <header className="flex items-center justify-between px-10 h-[72px] bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-blue-100/50 -mt-6 -mx-8 mb-6">
            <div className="flex flex-col">
                <h1 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-none mb-1">{title}</h1>
                {subtitle && <p className="text-[12px] text-slate-400 font-medium">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-5">
                {children}
                <div className="relative group" ref={wrapperRef}>
                    <div className="relative flex items-center">
                        <Search size={15} className={`absolute left-4 transition-colors ${open ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setActiveIndex(-1);
                            }}
                            onFocus={() => {
                                if (results.length > 0) setOpen(true);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search by Registration, Case ID, or Finding type..."
                            className="bg-blue-50/40 border border-blue-100 rounded-xl text-slate-900 py-3 px-12 text-[13px] w-[360px] outline-none transition-all focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-600/5 focus:w-[420px] placeholder:text-slate-400 font-medium shadow-sm"
                            id="global-search"
                            autoComplete="off"
                        />

                        {loading && (
                            <Loader2 size={14} className="absolute right-2.5 text-blue-600 animate-spin" />
                        )}
                        {query && !loading && (
                            <button
                                className="absolute right-2 text-slate-300 hover:text-blue-600 bg-transparent border-0 p-1 cursor-pointer rounded-sm flex items-center justify-center transition-all hover:bg-blue-50"
                                onClick={() => {
                                    setQuery("");
                                    setResults([]);
                                    setOpen(false);
                                    inputRef.current?.focus();
                                }}
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute top-[calc(100%+8px)] right-0 w-[340px] bg-white border border-blue-100 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                            {results.length === 0 && !loading ? (
                                <div className="p-8 text-center text-slate-400 text-[13px] flex flex-col items-center gap-2 font-medium">
                                    <Search size={18} className="text-blue-100" />
                                    <span>No results for &ldquo;{query}&rdquo;</span>
                                </div>
                            ) : (
                                <>
                                    <div className="px-3.5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-blue-50/50 border-b border-blue-50">
                                        {results.length} result{results.length !== 1 ? "s" : ""}
                                    </div>
                                    <div className="max-h-[380px] overflow-y-auto overflow-x-hidden modern-scrollbar">
                                        {results.map((result, i) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                className={`w-full flex items-start gap-3 px-3.5 py-3 bg-transparent border-0 border-b border-blue-50 last:border-b-0 cursor-pointer text-left transition-all hover:bg-blue-50 ${i === activeIndex ? "bg-blue-50" : ""}`}
                                                onClick={() => navigateTo(result)}
                                                onMouseEnter={() => setActiveIndex(i)}
                                            >
                                                <div className="text-blue-400 flex items-center justify-center w-7 h-7 bg-blue-50 rounded-md shrink-0 border border-blue-100">
                                                    {getTypeIcon(result.type)}
                                                </div>
                                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                    <span className="text-[13px] font-semibold text-slate-700 truncate">
                                                        {result.title}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 truncate font-medium">
                                                        {result.subtitle}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest shrink-0 mt-0.5">
                                                    {getTypeLabel(result.type)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
