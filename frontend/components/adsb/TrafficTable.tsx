"use client";

import type { OpenSkyStateVector } from "@/lib/opensky";
import { Plane, MapPin, Gauge, ArrowUp, Circle } from "lucide-react";

interface TrafficTableProps {
  states: OpenSkyStateVector[];
}

function formatAltitude(m: number | null): string {
  if (m == null) return "—";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatSpeed(ms: number | null): string {
  if (ms == null) return "—";
  const kts = ms * 1.94384;
  return `${Math.round(kts)} kt`;
}

function formatHeading(deg: number | null): string {
  if (deg == null) return "—";
  return `${Math.round(deg)}°`;
}

function formatVerticalRate(ms: number | null): string {
  if (ms == null) return "—";
  const sign = ms >= 0 ? "+" : "";
  return `${sign}${Math.round(ms)} m/s`;
}

function formatCoords(lat: number | null, lon: number | null): string {
  if (lat == null || lon == null) return "—";
  return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
}

export default function TrafficTable({ states }: TrafficTableProps) {
  if (states.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
          <Plane size={28} />
        </div>
        <p className="text-[14px] font-semibold text-slate-600">No aircraft in this area</p>
        <p className="text-[12px] text-slate-400 mt-1">Try a different bounding box or time.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-px">
      <table className="w-full border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Callsign / ICAO24
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Country
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Position
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Altitude
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Speed
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Heading
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Vert. rate
            </th>
            <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              State
            </th>
          </tr>
        </thead>
        <tbody>
          {states.map((s) => (
            <tr
              key={s.icao24 + (s.last_contact ?? 0)}
              className="group border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500 shrink-0">
                    <Plane size={14} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-slate-900 font-mono">
                      {(s.callsign ?? "").trim() || "—"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{s.icao24}</span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-[13px] font-medium text-slate-600">
                {s.origin_country || "—"}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-[12px] font-mono text-slate-600">
                  <MapPin size={12} className="text-slate-300 shrink-0" />
                  {formatCoords(s.latitude, s.longitude)}
                </div>
              </td>
              <td className="px-5 py-4 text-[12px] font-semibold text-slate-700">
                {formatAltitude(s.baro_altitude ?? s.geo_altitude)}
              </td>
              <td className="px-5 py-4 text-[12px] font-semibold text-slate-700">
                {formatSpeed(s.velocity)}
              </td>
              <td className="px-5 py-4 text-[12px] font-medium text-slate-600">
                {formatHeading(s.true_track)}
              </td>
              <td className="px-5 py-4 text-[12px] font-medium text-slate-600">
                {formatVerticalRate(s.vertical_rate)}
              </td>
              <td className="px-5 py-4">
                {s.on_ground ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                    <Circle size={10} />
                    On ground
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold">
                    <ArrowUp size={10} />
                    In flight
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
