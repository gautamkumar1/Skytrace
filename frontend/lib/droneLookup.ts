/**
 * Drone & UAV auto-detection utility.
 * 
 * Specialized for the 2026 EU Origin Tracing requirements.
 */

export interface DroneInfo {
    model: string;
    manufacturer: string;
    category: "C0" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "Other";
    maxTakeOffMass: number; // in kg
    euComplianceReady: boolean;
}

export const DRONE_FAMILIES: Record<string, DroneInfo> = {
    "MATRICE 300": { model: "Matrice 300 RTK", manufacturer: "DJI", category: "C2", maxTakeOffMass: 9, euComplianceReady: true },
    "MATRICE 350": { model: "Matrice 350 RTK", manufacturer: "DJI", category: "C2", maxTakeOffMass: 9.2, euComplianceReady: true },
    "MAVIC 3 ENTERPRISE": { model: "Mavic 3E", manufacturer: "DJI", category: "C2", maxTakeOffMass: 0.9, euComplianceReady: true },
    "ANAFI USA": { model: "Anafi USA", manufacturer: "Parrot", category: "C1", maxTakeOffMass: 0.5, euComplianceReady: true },
    "SKYDIO X10": { model: "Skydio X10", manufacturer: "Skydio", category: "C2", maxTakeOffMass: 2.1, euComplianceReady: true },
    "WINGTRAONE": { model: "WingtraOne GEN II", manufacturer: "Wingtra", category: "C2", maxTakeOffMass: 3.7, euComplianceReady: true },
};

export interface BatchOriginInfo {
    batchId: string;
    partName: string;
    quantity: number;
    originSource: string;
    isEUApproved: boolean;
    verificationDate: string;
}

/**
 * Detects drone info from text sources (filenames, IDs, etc.)
 */
export function detectDroneInfo(...sources: string[]): DroneInfo | null {
    const combined = sources.join(" ").toUpperCase();
    
    for (const [pattern, info] of Object.entries(DRONE_FAMILIES)) {
        if (combined.includes(pattern)) {
            return info;
        }
    }
    
    return null;
}

/**
 * Returns a list of mock batches for demonstration.
 */
export function getMockDroneBatches(): BatchOriginInfo[] {
    return [
        {
            batchId: "BAT-2026-001X",
            partName: "Propeller Blades (Carbon)",
            quantity: 500,
            originSource: "AeroFab EU - Germany",
            isEUApproved: true,
            verificationDate: "2026-02-15"
        },
        {
            batchId: "BAT-2026-042Y",
            partName: "ESC Module Gen 4",
            quantity: 120,
            originSource: "SinoTech - Shenzhen (Non-EU)",
            isEUApproved: false,
            verificationDate: "2026-03-01"
        },
        {
            batchId: "BAT-2026-099Z",
            partName: "LiPo Battery 6S 22000mAh",
            quantity: 80,
            originSource: "VoltPower - France",
            isEUApproved: true,
            verificationDate: "2026-03-10"
        }
    ];
}
