"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TOP_ENGINE_PARTS,
  byFrequencyRank,
  byCostRank,
  type TopEnginePart,
  type AircraftFamily,
  type EngineFamily,
} from "@/data/top-engine-parts";
import { Wrench, ArrowUpDown, DollarSign, Filter } from "lucide-react";

type SortBy = "frequency" | "cost";

function formatCost(min: number, max: number): string {
  if (min >= 1_000_000) return `$${(min / 1e6).toFixed(1)}M–$${(max / 1e6).toFixed(1)}M`;
  if (min >= 1_000) return `$${(min / 1e3).toFixed(0)}k–$${(max / 1e3).toFixed(0)}k`;
  return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
}

function CategoryBadge({ category }: { category: TopEnginePart["category"] }) {
  const styles: Record<string, string> = {
    HPT: "bg-rose-50 text-rose-700 border-rose-200",
    LPT: "bg-amber-50 text-amber-700 border-amber-200",
    Fan: "bg-sky-50 text-sky-700 border-sky-200",
    HPC: "bg-violet-50 text-violet-700 border-violet-200",
    Combustor: "bg-orange-50 text-orange-700 border-orange-200",
    Seals: "bg-slate-100 text-slate-700 border-slate-200",
    Other: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[category] ?? styles.Other}`}
    >
      {category}
    </span>
  );
}

export default function TopPartsReference() {
  const [sortBy, setSortBy] = useState<SortBy>("frequency");
  const [aircraftFilter, setAircraftFilter] = useState<AircraftFamily | "">("");
  const [categoryFilter, setCategoryFilter] = useState<TopEnginePart["category"] | "">("");

  const sorted = useMemo(() => {
    let list = [...TOP_ENGINE_PARTS];
    if (aircraftFilter) {
      list = list.filter(
        (p) => p.aircraft_family === aircraftFilter || p.aircraft_family === "Both"
      );
    }
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    list.sort(sortBy === "frequency" ? byFrequencyRank : byCostRank);
    return list;
  }, [sortBy, aircraftFilter, categoryFilter]);

  return (
    <motion.div
      className="premium-card overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
            <Wrench size={18} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider m-0">
              Top 50 most changed parts
            </h3>
            <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-medium">
              737 & A320 engines · ranked by frequency & cost (AI/industry reference)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={aircraftFilter}
              onChange={(e) => setAircraftFilter(e.target.value as AircraftFamily | "")}
              className="text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-blue-400"
            >
              <option value="">All aircraft</option>
              <option value="737">737</option>
              <option value="A320">A320</option>
              <option value="Both">Both</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TopEnginePart["category"] | "")}
              className="text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-blue-400"
            >
              <option value="">All categories</option>
              <option value="HPT">HPT</option>
              <option value="LPT">LPT</option>
              <option value="Fan">Fan</option>
              <option value="HPC">HPC</option>
              <option value="Combustor">Combustor</option>
              <option value="Seals">Seals</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setSortBy("frequency")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                sortBy === "frequency"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ArrowUpDown size={12} />
              Frequency
            </button>
            <button
              onClick={() => setSortBy("cost")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                sortBy === "cost"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <DollarSign size={12} />
              Cost
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {sortBy === "frequency" ? "Freq. rank" : "Cost rank"}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Part name
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Category
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Aircraft
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Engine
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Est. cost (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((part) => (
              <tr
                key={part.id}
                className="border-b border-slate-50 last:border-0 hover:bg-blue-50/20 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <span className="text-[13px] font-bold text-slate-700 tabular-nums">
                    {sortBy === "frequency" ? part.frequency_rank : part.cost_rank}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {part.part_name}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <CategoryBadge category={part.category} />
                </td>
                <td className="px-5 py-3.5 text-[12px] font-medium text-slate-600">
                  {part.aircraft_family}
                </td>
                <td className="px-5 py-3.5 text-[12px] font-mono text-slate-600">
                  {part.engine_family}
                </td>
                <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                  {formatCost(part.cost_estimate_usd_min, part.cost_estimate_usd_max)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        Cost estimates are AI/industry order-of-magnitude reference only. Replace with actual MRO/supplier data when available.
      </div>
    </motion.div>
  );
}
