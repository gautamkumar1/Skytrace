"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TrafficTable from "@/components/adsb/TrafficTable";
import type { OpenSkyStateVector } from "@/lib/opensky";
import {
  Radio,
  Plane,
  MapPin,
  Gauge,
  RefreshCw,
  AlertTriangle,
  Clock,
  List,
  Map,
  Search,
  Loader2,
} from "lucide-react";

const POLL_INTERVAL_MS = 10_000;

const TrafficMap = dynamic(
  () => import("@/components/adsb/TrafficMap").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    ),
  }
);

interface AdsbResponse {
  time: number;
  states: OpenSkyStateVector[];
  bbox: { lamin: number | null; lomin: number | null; lamax: number | null; lomax: number | null };
  icao24?: string | null;
}

const ICAO24_REG = /^[0-9a-fA-F]{6}$/;

function filterStates(
  states: OpenSkyStateVector[],
  query: string
): OpenSkyStateVector[] {
  const q = query.trim();
  if (!q) return states;
  const lower = q.toLowerCase();
  return states.filter((s) => {
    const callsign = (s.callsign ?? "").toLowerCase();
    const icao = s.icao24.toLowerCase();
    return callsign.includes(lower) || icao.includes(lower) || icao === lower;
  });
}

export default function AdsbPage() {
  const [data, setData] = useState<AdsbResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [findIcao, setFindIcao] = useState("");
  const [finding, setFinding] = useState(false);

  const fetchTraffic = useCallback(
    async (icao24?: string) => {
      setError(null);
      try {
        const url = icao24
          ? `/api/adsb?icao24=${encodeURIComponent(icao24)}`
          : "/api/adsb";
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || body.error || `HTTP ${res.status}`);
        }
        const json: AdsbResponse = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
        setFinding(false);
      }
    },
    []
  );

  const handleFindByIcao = useCallback(() => {
    const trimmed = findIcao.trim().toLowerCase().slice(0, 6);
    if (!ICAO24_REG.test(trimmed)) return;
    setFinding(true);
    setLoading(true);
    fetchTraffic(trimmed);
  }, [findIcao, fetchTraffic]);

  useEffect(() => {
    fetchTraffic();
  }, [fetchTraffic]);

  useEffect(() => {
    if (loading || error) return;
    const t = setInterval(() => fetchTraffic(), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [loading, error, fetchTraffic]);

  const rawStates = data?.states ?? [];
  const filteredStates = useMemo(
    () => filterStates(rawStates, searchQuery),
    [rawStates, searchQuery]
  );
  const inFlight = rawStates.filter((s) => !s.on_ground).length;
  const onGround = rawStates.filter((s) => s.on_ground).length;
  const lastUpdate = data?.time
    ? new Date(data.time * 1000).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";
  const isIcao24Query = ICAO24_REG.test(findIcao.trim().slice(0, 6));

  if (loading && !data) {
    return (
      <>
        <Header
          title="Live Traffic"
          subtitle="ADS-B state vectors via Airplanes.live"
        />
        <LoadingSpinner text="Fetching ADS-B state vectors..." />
      </>
    );
  }

  return (
    <>
      <Header
        title="Live Traffic"
        subtitle="ADS-B state vectors via Airplanes.live"
      >
        <button
          onClick={() => {
            setLoading(true);
            fetchTraffic();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 transition-all"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </Header>

      {error && (
        <motion.div
          className="flex items-center gap-3 px-4 py-3 mb-6 mx-2 rounded-xl bg-amber-50 border border-amber-200"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-amber-800">
              Could not load ADS-B data
            </p>
            <p className="text-[12px] text-amber-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchTraffic();
            }}
            className="text-[12px] font-bold text-amber-700 hover:text-amber-900"
          >
            Retry
          </button>
        </motion.div>
      )}

      <motion.div
        className="mb-12 px-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Flight search + view toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by callsign or ICAO24..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:max-w-[180px]">
                <input
                  type="text"
                  value={findIcao}
                  onChange={(e) => setFindIcao(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))}
                  placeholder="ICAO24 (6 hex)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <button
                onClick={handleFindByIcao}
                disabled={finding || !isIcao24Query}
                className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                {finding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plane size={16} />
                )}
                Find aircraft
              </button>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={16} />
              Table
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Map size={16} />
              Map
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card p-6 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Radio size={22} />
              </div>
              <div>
                <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                  {rawStates.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Aircraft in view
                </span>
              </div>
            </div>
          </div>
          <div className="premium-card p-6 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plane size={22} />
              </div>
              <div>
                <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                  {inFlight}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  In flight
                </span>
              </div>
            </div>
          </div>
          <div className="premium-card p-6 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MapPin size={22} />
              </div>
              <div>
                <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                  {onGround}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  On ground
                </span>
              </div>
            </div>
          </div>
          <div className="premium-card p-6 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Clock size={22} />
              </div>
              <div>
                <span className="block text-lg font-semibold text-slate-900 leading-none tracking-tight mb-1 font-mono">
                  {lastUpdate}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Last update
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content: Table or Map */}
        <div className="premium-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                <Gauge size={16} />
              </div>
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                {viewMode === "table" ? "State vectors" : "Live map"}
              </h3>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-400">
                {filteredStates.length}
                {searchQuery ? ` of ${rawStates.length}` : ""} aircraft
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Data from Airplanes.live · refreshes every 10s
            </p>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TrafficTable states={filteredStates} />
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <TrafficMap states={filteredStates} fitBoundsOnUpdate />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
