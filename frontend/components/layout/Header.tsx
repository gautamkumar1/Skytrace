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
}

export default function Header({ title, subtitle }: HeaderProps) {
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
        <header className="header">
            <div className="header__left">
                <h1 className="header__title">{title}</h1>
                {subtitle && <p className="header__subtitle">{subtitle}</p>}
            </div>
            <div className="header__right">
                <div className="search-global" ref={wrapperRef}>
                    <div className="search-global__input-wrap">
                        <Search size={16} className="search-global__icon" />
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
                            placeholder="Search cases, findings..."
                            className="search-global__input"
                            id="global-search"
                            autoComplete="off"
                        />
                        {loading && (
                            <Loader2 size={14} className="search-global__spinner" />
                        )}
                        {query && !loading && (
                            <button
                                className="search-global__clear"
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
                        <div className="search-global__dropdown">
                            {results.length === 0 && !loading ? (
                                <div className="search-global__empty">
                                    <Search size={18} />
                                    <span>No results for &ldquo;{query}&rdquo;</span>
                                </div>
                            ) : (
                                <>
                                    <div className="search-global__header">
                                        {results.length} result{results.length !== 1 ? "s" : ""}
                                    </div>
                                    <div className="search-global__list">
                                        {results.map((result, i) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                className={`search-global__item ${i === activeIndex ? "search-global__item--active" : ""}`}
                                                onClick={() => navigateTo(result)}
                                                onMouseEnter={() => setActiveIndex(i)}
                                            >
                                                <div className="search-global__item-icon">
                                                    {getTypeIcon(result.type)}
                                                </div>
                                                <div className="search-global__item-content">
                                                    <span className="search-global__item-title">
                                                        {result.title}
                                                    </span>
                                                    <span className="search-global__item-sub">
                                                        {result.subtitle}
                                                    </span>
                                                </div>
                                                <span className="search-global__item-type">
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

                <button className="header__notification" aria-label="Notifications">
                    <Bell size={18} />
                    <span className="header__notification-dot" />
                </button>
            </div>
        </header>
    );
}
