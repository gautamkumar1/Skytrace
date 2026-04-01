/**
 * Top 50 most frequently changed / highest-cost engine parts for 737 & A320.
 * Ranked by change frequency (1 = most often replaced) and cost (1 = highest).
 * Cost estimates are AI/industry-order-of-magnitude placeholders for reference only.
 * Sources: LLP lists, MRO literature (CFM56, V2500), typical overhaul scope.
 */

export type AircraftFamily = "737" | "A320" | "Both";
export type EngineFamily = "CFM56-7B" | "CFM56-5B" | "V2500" | "CFM56" | "V2500/CFM56";

export interface TopEnginePart {
  id: string;
  part_name: string;
  frequency_rank: number; // 1 = most often changed
  cost_rank: number; // 1 = highest cost
  cost_estimate_usd_min: number;
  cost_estimate_usd_max: number;
  aircraft_family: AircraftFamily;
  engine_family: EngineFamily;
  category: "HPT" | "LPT" | "Fan" | "HPC" | "Combustor" | "Seals" | "Other";
}

export const TOP_ENGINE_PARTS: TopEnginePart[] = [
  // High-frequency, high-cost (HPT / hot section)
  { id: "1", part_name: "HPT Stage 1 Blade Set", frequency_rank: 1, cost_rank: 1, cost_estimate_usd_min: 450000, cost_estimate_usd_max: 650000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "2", part_name: "HPT Stage 1 Disk", frequency_rank: 2, cost_rank: 2, cost_estimate_usd_min: 380000, cost_estimate_usd_max: 520000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "3", part_name: "HPT Stage 2 Blade Set", frequency_rank: 3, cost_rank: 3, cost_estimate_usd_min: 320000, cost_estimate_usd_max: 480000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "4", part_name: "HPT Stage 1 Nozzle / Stator", frequency_rank: 4, cost_rank: 6, cost_estimate_usd_min: 180000, cost_estimate_usd_max: 280000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "5", part_name: "HPT Stage 2 Disk", frequency_rank: 5, cost_rank: 4, cost_estimate_usd_min: 280000, cost_estimate_usd_max: 400000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "6", part_name: "HPT Stage 2 Nozzle", frequency_rank: 6, cost_rank: 8, cost_estimate_usd_min: 120000, cost_estimate_usd_max: 200000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "7", part_name: "HPT Shroud / Seal Segment Set", frequency_rank: 7, cost_rank: 12, cost_estimate_usd_min: 65000, cost_estimate_usd_max: 110000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  { id: "8", part_name: "HPT Blade Retainer / Lock", frequency_rank: 8, cost_rank: 25, cost_estimate_usd_min: 22000, cost_estimate_usd_max: 45000, aircraft_family: "Both", engine_family: "CFM56", category: "HPT" },
  // LPT
  { id: "9", part_name: "LPT Stage 1 Blade Set", frequency_rank: 9, cost_rank: 5, cost_estimate_usd_min: 200000, cost_estimate_usd_max: 320000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "10", part_name: "LPT Stage 2 Blade Set", frequency_rank: 10, cost_rank: 7, cost_estimate_usd_min: 150000, cost_estimate_usd_max: 250000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "11", part_name: "LPT Stage 3 Blade Set", frequency_rank: 11, cost_rank: 9, cost_estimate_usd_min: 100000, cost_estimate_usd_max: 180000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "12", part_name: "LPT Stage 4 Blade Set", frequency_rank: 12, cost_rank: 11, cost_estimate_usd_min: 70000, cost_estimate_usd_max: 130000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "13", part_name: "LPT Stage 5 Blade Set", frequency_rank: 13, cost_rank: 14, cost_estimate_usd_min: 50000, cost_estimate_usd_max: 95000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "14", part_name: "LPT Nozzle (Stage 1)", frequency_rank: 14, cost_rank: 10, cost_estimate_usd_min: 85000, cost_estimate_usd_max: 150000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "15", part_name: "LPT Disk (Stage 1)", frequency_rank: 15, cost_rank: 13, cost_estimate_usd_min: 55000, cost_estimate_usd_max: 100000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  { id: "16", part_name: "LPT Seal / Ring Set", frequency_rank: 16, cost_rank: 20, cost_estimate_usd_min: 28000, cost_estimate_usd_max: 55000, aircraft_family: "Both", engine_family: "CFM56", category: "LPT" },
  // Fan
  { id: "17", part_name: "Fan Blade Set (Stage 1)", frequency_rank: 17, cost_rank: 15, cost_estimate_usd_min: 48000, cost_estimate_usd_max: 85000, aircraft_family: "Both", engine_family: "CFM56", category: "Fan" },
  { id: "18", part_name: "Fan Disk", frequency_rank: 18, cost_rank: 16, cost_estimate_usd_min: 45000, cost_estimate_usd_max: 80000, aircraft_family: "Both", engine_family: "CFM56", category: "Fan" },
  { id: "19", part_name: "Fan Frame / Case", frequency_rank: 19, cost_rank: 22, cost_estimate_usd_min: 25000, cost_estimate_usd_max: 50000, aircraft_family: "Both", engine_family: "CFM56", category: "Fan" },
  { id: "20", part_name: "Fan Outlet Guide Vane Set", frequency_rank: 20, cost_rank: 28, cost_estimate_usd_min: 18000, cost_estimate_usd_max: 38000, aircraft_family: "Both", engine_family: "CFM56", category: "Fan" },
  // HPC / Booster
  { id: "21", part_name: "HPC Stage 1–2 Blade Set", frequency_rank: 21, cost_rank: 17, cost_estimate_usd_min: 42000, cost_estimate_usd_max: 72000, aircraft_family: "Both", engine_family: "CFM56", category: "HPC" },
  { id: "22", part_name: "HPC Variable Guide Vane Set", frequency_rank: 22, cost_rank: 19, cost_estimate_usd_min: 32000, cost_estimate_usd_max: 60000, aircraft_family: "Both", engine_family: "CFM56", category: "HPC" },
  { id: "23", part_name: "HPC Stage 3–6 Stator Vane Set", frequency_rank: 23, cost_rank: 21, cost_estimate_usd_min: 30000, cost_estimate_usd_max: 52000, aircraft_family: "Both", engine_family: "CFM56", category: "HPC" },
  { id: "24", part_name: "HPC Drum / Spool Assembly", frequency_rank: 24, cost_rank: 18, cost_estimate_usd_min: 38000, cost_estimate_usd_max: 65000, aircraft_family: "Both", engine_family: "CFM56", category: "HPC" },
  { id: "25", part_name: "HPC Seal Pack", frequency_rank: 25, cost_rank: 30, cost_estimate_usd_min: 15000, cost_estimate_usd_max: 32000, aircraft_family: "Both", engine_family: "CFM56", category: "HPC" },
  // Combustor
  { id: "26", part_name: "Combustor Liner", frequency_rank: 26, cost_rank: 23, cost_estimate_usd_min: 24000, cost_estimate_usd_max: 48000, aircraft_family: "Both", engine_family: "CFM56", category: "Combustor" },
  { id: "27", part_name: "Fuel Nozzle Set", frequency_rank: 27, cost_rank: 26, cost_estimate_usd_min: 20000, cost_estimate_usd_max: 42000, aircraft_family: "Both", engine_family: "CFM56", category: "Combustor" },
  { id: "28", part_name: "Combustor Dome / Cap", frequency_rank: 28, cost_rank: 29, cost_estimate_usd_min: 16000, cost_estimate_usd_max: 35000, aircraft_family: "Both", engine_family: "CFM56", category: "Combustor" },
  { id: "29", part_name: "Igniter Plug (pair)", frequency_rank: 29, cost_rank: 45, cost_estimate_usd_min: 4000, cost_estimate_usd_max: 12000, aircraft_family: "Both", engine_family: "CFM56", category: "Combustor" },
  // Seals & other
  { id: "30", part_name: "HPT/LPT Interstage Seal", frequency_rank: 30, cost_rank: 24, cost_estimate_usd_min: 22000, cost_estimate_usd_max: 44000, aircraft_family: "Both", engine_family: "CFM56", category: "Seals" },
  { id: "31", part_name: "Bearing Compartment Seal Set", frequency_rank: 31, cost_rank: 27, cost_estimate_usd_min: 19000, cost_estimate_usd_max: 40000, aircraft_family: "Both", engine_family: "CFM56", category: "Seals" },
  { id: "32", part_name: "HPT Rotor Shaft", frequency_rank: 32, cost_rank: 31, cost_estimate_usd_min: 14000, cost_estimate_usd_max: 30000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "33", part_name: "LPC Inlet Guide Vane Set", frequency_rank: 33, cost_rank: 33, cost_estimate_usd_min: 12000, cost_estimate_usd_max: 26000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "34", part_name: "Exhaust Nozzle / Mixer", frequency_rank: 34, cost_rank: 34, cost_estimate_usd_min: 11000, cost_estimate_usd_max: 24000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "35", part_name: "V2500 HPT Stage 1 Blade Set", frequency_rank: 35, cost_rank: 32, cost_estimate_usd_min: 13000, cost_estimate_usd_max: 28000, aircraft_family: "A320", engine_family: "V2500", category: "HPT" },
  { id: "36", part_name: "V2500 HPT Stage 2 Blade Set", frequency_rank: 36, cost_rank: 35, cost_estimate_usd_min: 10000, cost_estimate_usd_max: 22000, aircraft_family: "A320", engine_family: "V2500", category: "HPT" },
  { id: "37", part_name: "V2500 LPT Blade Set (multi-stage)", frequency_rank: 37, cost_rank: 36, cost_estimate_usd_min: 9500, cost_estimate_usd_max: 20000, aircraft_family: "A320", engine_family: "V2500", category: "LPT" },
  { id: "38", part_name: "V2500 Fan Blade Set", frequency_rank: 38, cost_rank: 37, cost_estimate_usd_min: 9000, cost_estimate_usd_max: 19000, aircraft_family: "A320", engine_family: "V2500", category: "Fan" },
  { id: "39", part_name: "V2500 HPC Blade / Vane Set", frequency_rank: 39, cost_rank: 38, cost_estimate_usd_min: 8500, cost_estimate_usd_max: 18000, aircraft_family: "A320", engine_family: "V2500", category: "HPC" },
  { id: "40", part_name: "Oil Seal / Carbon Seal", frequency_rank: 40, cost_rank: 40, cost_estimate_usd_min: 7000, cost_estimate_usd_max: 15000, aircraft_family: "Both", engine_family: "CFM56", category: "Seals" },
  { id: "41", part_name: "EGT Thermocouple Harness", frequency_rank: 41, cost_rank: 48, cost_estimate_usd_min: 3000, cost_estimate_usd_max: 9000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "42", part_name: "VSV Actuator", frequency_rank: 42, cost_rank: 41, cost_estimate_usd_min: 6500, cost_estimate_usd_max: 14000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "43", part_name: "TBV Actuator", frequency_rank: 43, cost_rank: 42, cost_estimate_usd_min: 6000, cost_estimate_usd_max: 13000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "44", part_name: "Bearing (HPT/LPT)", frequency_rank: 44, cost_rank: 39, cost_estimate_usd_min: 7500, cost_estimate_usd_max: 16000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "45", part_name: "N2 Speed Sensor", frequency_rank: 45, cost_rank: 47, cost_estimate_usd_min: 3500, cost_estimate_usd_max: 10000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "46", part_name: "N1 Speed Sensor", frequency_rank: 46, cost_rank: 46, cost_estimate_usd_min: 3800, cost_estimate_usd_max: 9500, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "47", part_name: "TCC / Clearance Control Valve", frequency_rank: 47, cost_rank: 43, cost_estimate_usd_min: 5500, cost_estimate_usd_max: 12000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "48", part_name: "Accessory Gearbox Seal", frequency_rank: 48, cost_rank: 44, cost_estimate_usd_min: 4500, cost_estimate_usd_max: 11000, aircraft_family: "Both", engine_family: "CFM56", category: "Seals" },
  { id: "49", part_name: "Oil Pump / Scavenge Pump", frequency_rank: 49, cost_rank: 49, cost_estimate_usd_min: 2500, cost_estimate_usd_max: 8000, aircraft_family: "Both", engine_family: "CFM56", category: "Other" },
  { id: "50", part_name: "Gasket / O-Ring Kit (overhaul)", frequency_rank: 50, cost_rank: 50, cost_estimate_usd_min: 2000, cost_estimate_usd_max: 6000, aircraft_family: "Both", engine_family: "CFM56", category: "Seals" },
];

/** Sort by frequency (most often changed first) */
export function byFrequencyRank(a: TopEnginePart, b: TopEnginePart): number {
  return a.frequency_rank - b.frequency_rank;
}

/** Sort by cost rank (highest cost first) */
export function byCostRank(a: TopEnginePart, b: TopEnginePart): number {
  return a.cost_rank - b.cost_rank;
}
