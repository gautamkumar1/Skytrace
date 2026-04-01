/**
 * Aircraft & Engine auto-detection utility.
 *
 * Scans text (filenames, registrations, case IDs, etc.) for known aircraft
 * model and engine designators and returns the best match.
 */

// ─── Aircraft family → canonical type & common engines ──────────────────────

interface AircraftInfo {
    aircraftType: string;
    manufacturer: string;
    category: string;
    engines: string[];
}

const AIRCRAFT_FAMILIES: Record<string, AircraftInfo> = {
    // Airbus Narrowbody
    "A319":   { aircraftType: "A319-100",   manufacturer: "Airbus",  category: "Narrowbody", engines: ["CFM56-5B", "V2500"] },
    "A320":   { aircraftType: "A320-200",   manufacturer: "Airbus",  category: "Narrowbody", engines: ["CFM56-5B", "V2500"] },
    "A321":   { aircraftType: "A321-200",   manufacturer: "Airbus",  category: "Narrowbody", engines: ["CFM56-5B", "V2500"] },
    "A320NEO":{ aircraftType: "A320-200NEO",manufacturer: "Airbus",  category: "Narrowbody", engines: ["LEAP-1A", "PW1100G"] },
    "A321NEO":{ aircraftType: "A321-200NEO",manufacturer: "Airbus",  category: "Narrowbody", engines: ["LEAP-1A", "PW1100G"] },
    // Airbus Widebody
    "A330":   { aircraftType: "A330-200",   manufacturer: "Airbus",  category: "Widebody",   engines: ["CF6-80E1", "Trent 700"] },
    "A340":   { aircraftType: "A340-300",   manufacturer: "Airbus",  category: "Widebody",   engines: ["CFM56-5C"] },
    "A350":   { aircraftType: "A350-900",   manufacturer: "Airbus",  category: "Widebody",   engines: ["Trent XWB"] },
    // Boeing Narrowbody
    "B737":   { aircraftType: "B737-800",   manufacturer: "Boeing",  category: "Narrowbody", engines: ["CFM56-7B"] },
    "737":    { aircraftType: "B737-800",   manufacturer: "Boeing",  category: "Narrowbody", engines: ["CFM56-7B"] },
    "737MAX": { aircraftType: "737-MAX8",   manufacturer: "Boeing",  category: "Narrowbody", engines: ["LEAP-1B"] },
    "737-MAX":{ aircraftType: "737-MAX8",   manufacturer: "Boeing",  category: "Narrowbody", engines: ["LEAP-1B"] },
    "B737MAX":{ aircraftType: "737-MAX8",   manufacturer: "Boeing",  category: "Narrowbody", engines: ["LEAP-1B"] },
    // Boeing Widebody
    "B777":   { aircraftType: "B777-300ER", manufacturer: "Boeing",  category: "Widebody",   engines: ["GE90-115B", "Trent 800"] },
    "777":    { aircraftType: "B777-300ER", manufacturer: "Boeing",  category: "Widebody",   engines: ["GE90-115B", "Trent 800"] },
    "B787":   { aircraftType: "B787-9",     manufacturer: "Boeing",  category: "Widebody",   engines: ["GEnx-1B", "Trent 1000"] },
    "787":    { aircraftType: "B787-9",     manufacturer: "Boeing",  category: "Widebody",   engines: ["GEnx-1B", "Trent 1000"] },
    "B747":   { aircraftType: "B747-400",   manufacturer: "Boeing",  category: "Widebody",   engines: ["CF6-80C2", "PW4000", "RB211-524"] },
    "747":    { aircraftType: "B747-400",   manufacturer: "Boeing",  category: "Widebody",   engines: ["CF6-80C2", "PW4000", "RB211-524"] },
};

// More specific sub-variants (checked first for precision)
const SPECIFIC_AIRCRAFT: Record<string, AircraftInfo> = {
    "A319-100": { aircraftType: "A319-100",    manufacturer: "Airbus",  category: "Narrowbody", engines: ["CFM56-5B", "V2500"] },
    "A320-200": { aircraftType: "A320-200",    manufacturer: "Airbus",  category: "Narrowbody", engines: ["CFM56-5B", "V2500"] },
    "A321-200": { aircraftType: "A321-200",    manufacturer: "Airbus",  category: "Narrowbody", engines: ["CFM56-5B", "V2500"] },
    "B737-700": { aircraftType: "B737-700",    manufacturer: "Boeing",  category: "Narrowbody", engines: ["CFM56-7B"] },
    "B737-800": { aircraftType: "B737-800",    manufacturer: "Boeing",  category: "Narrowbody", engines: ["CFM56-7B"] },
    "737-800":  { aircraftType: "B737-800",    manufacturer: "Boeing",  category: "Narrowbody", engines: ["CFM56-7B"] },
    "737-700":  { aircraftType: "B737-700",    manufacturer: "Boeing",  category: "Narrowbody", engines: ["CFM56-7B"] },
    "737-MAX8": { aircraftType: "737-MAX8",    manufacturer: "Boeing",  category: "Narrowbody", engines: ["LEAP-1B"] },
    "A320NEO":  { aircraftType: "A320-200NEO", manufacturer: "Airbus",  category: "Narrowbody", engines: ["LEAP-1A", "PW1100G"] },
    "A321NEO":  { aircraftType: "A321-200NEO", manufacturer: "Airbus",  category: "Narrowbody", engines: ["LEAP-1A", "PW1100G"] },
    "A330-200": { aircraftType: "A330-200",    manufacturer: "Airbus",  category: "Widebody",   engines: ["CF6-80E1", "Trent 700"] },
    "A330-300": { aircraftType: "A330-300",    manufacturer: "Airbus",  category: "Widebody",   engines: ["CF6-80E1", "Trent 700"] },
    "A350-900": { aircraftType: "A350-900",    manufacturer: "Airbus",  category: "Widebody",   engines: ["Trent XWB"] },
};

// ─── Engine designator patterns ─────────────────────────────────────────────

const ENGINE_PATTERNS: string[] = [
    "LEAP-1A", "LEAP-1B", "LEAP1A", "LEAP1B",
    "PW1100G", "PW1100",
    "CFM56-5B", "CFM56-5C", "CFM56-7B", "CFM565B", "CFM567B",
    "V2500", "V2527", "V2533",
    "CF6-80E1", "CF6-80C2", "CF680",
    "GE90-115B", "GE90",
    "GEnx-1B", "GEnx",
    "Trent 700", "Trent 800", "Trent 1000", "Trent XWB",
    "RB211-524", "RB211",
    "PW4000",
];

// ─── Public API ─────────────────────────────────────────────────────────────

export interface DetectedInfo {
    aircraftType: string | null;
    engineType: string | null;
    manufacturer: string | null;
    category: string | null;
    engineOptions: string[];
    confidence: "high" | "medium" | "low" | "none";
}

/**
 * Scan one or more text sources for known aircraft and engine designators.
 * @param sources — array of strings to scan (filenames, registrations, etc.)
 */
export function detectAircraftInfo(...sources: string[]): DetectedInfo {
    const combined = sources.join(" ").toUpperCase();
    const result: DetectedInfo = {
        aircraftType: null,
        engineType: null,
        manufacturer: null,
        category: null,
        engineOptions: [],
        confidence: "none",
    };

    // 1. Try specific sub-variants first (most precise match)
    for (const [pattern, info] of Object.entries(SPECIFIC_AIRCRAFT)) {
        if (combined.includes(pattern.toUpperCase())) {
            result.aircraftType = info.aircraftType;
            result.manufacturer = info.manufacturer;
            result.category = info.category;
            result.engineOptions = info.engines;
            result.confidence = "high";
            break;
        }
    }

    // 2. Fall back to broader family match
    if (!result.aircraftType) {
        // Sort by key length descending so longer/more-specific keys match first
        const sortedFamilies = Object.entries(AIRCRAFT_FAMILIES).sort(
            (a, b) => b[0].length - a[0].length
        );
        for (const [pattern, info] of sortedFamilies) {
            if (combined.includes(pattern.toUpperCase())) {
                result.aircraftType = info.aircraftType;
                result.manufacturer = info.manufacturer;
                result.category = info.category;
                result.engineOptions = info.engines;
                result.confidence = "medium";
                break;
            }
        }
    }

    // 3. Detect engine type from text
    for (const enginePattern of ENGINE_PATTERNS) {
        if (combined.includes(enginePattern.toUpperCase())) {
            result.engineType = enginePattern;
            // If we also matched aircraft, bump confidence
            if (result.aircraftType) {
                result.confidence = "high";
            } else {
                result.confidence = "low";
            }
            break;
        }
    }

    // 4. If aircraft matched but no explicit engine, default to first option
    if (result.aircraftType && !result.engineType && result.engineOptions.length > 0) {
        result.engineType = result.engineOptions[0];
    }

    return result;
}

/**
 * All known aircraft types for manual selection dropdown.
 */
export const ALL_AIRCRAFT_TYPES = [
    "A319-100",
    "A320-200",
    "A320-200NEO",
    "A321-200",
    "A321-200NEO",
    "A330-200",
    "A330-300",
    "A340-300",
    "A350-900",
    "B737-700",
    "B737-800",
    "737-MAX8",
    "B747-400",
    "B777-300ER",
    "B787-9",
];

/**
 * All known engine types for manual selection dropdown.
 */
export const ALL_ENGINE_TYPES = [
    "CFM56-5B",
    "CFM56-5C",
    "CFM56-7B",
    "CF6-80C2",
    "CF6-80E1",
    "GE90-115B",
    "GEnx-1B",
    "LEAP-1A",
    "LEAP-1B",
    "PW1100G",
    "PW4000",
    "RB211-524",
    "Trent 700",
    "Trent 800",
    "Trent 1000",
    "Trent XWB",
    "V2500",
];
