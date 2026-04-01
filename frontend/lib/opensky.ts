/**
 * OpenSky Network REST API client for ADS-B aircraft state vectors.
 * Free, no API key required for anonymous use. Rate limit: ~1 req/10s.
 * @see https://openskynetwork.github.io/opensky-api/
 */

const OPENSKY_BASE = "https://opensky-network.org/api";

/** State vector indices in OpenSky /states/all response array */
export const STATE_INDEX = {
  icao24: 0,
  callsign: 1,
  origin_country: 2,
  time_position: 3,
  last_contact: 4,
  longitude: 5,
  latitude: 6,
  baro_altitude: 7,
  on_ground: 8,
  velocity: 9,
  true_track: 10,
  vertical_rate: 11,
  sensors: 12,
  geo_altitude: 13,
} as const;

export interface OpenSkyStateVector {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  geo_altitude: number | null;
}

export interface OpenSkyStatesResponse {
  time: number;
  states: (string | number | boolean | number[] | null)[][] | null;
}

/** Default bounding box: Continental US (avoids huge global response) */
export const DEFAULT_BBOX = {
  lamin: 24.0,
  lomin: -125.0,
  lamax: 50.0,
  lomax: -66.0,
};

function parseState(row: (string | number | boolean | number[] | null)[]): OpenSkyStateVector {
  const get = <T>(key: keyof typeof STATE_INDEX): T =>
    (row[STATE_INDEX[key]] as T) ?? (null as T);
  return {
    icao24: String(get<string>("icao24") ?? "").toLowerCase(),
    callsign: typeof get<string>("callsign") === "string" ? get<string>("callsign").trim() || null : null,
    origin_country: String(get<string>("origin_country") ?? ""),
    time_position: typeof get<number>("time_position") === "number" ? get<number>("time_position") : null,
    last_contact: Number(get<number>("last_contact")) || 0,
    longitude: typeof get<number>("longitude") === "number" ? get<number>("longitude") : null,
    latitude: typeof get<number>("latitude") === "number" ? get<number>("latitude") : null,
    baro_altitude: typeof get<number>("baro_altitude") === "number" ? get<number>("baro_altitude") : null,
    on_ground: Boolean(get<boolean>("on_ground")),
    velocity: typeof get<number>("velocity") === "number" ? get<number>("velocity") : null,
    true_track: typeof get<number>("true_track") === "number" ? get<number>("true_track") : null,
    vertical_rate: typeof get<number>("vertical_rate") === "number" ? get<number>("vertical_rate") : null,
    geo_altitude: typeof get<number>("geo_altitude") === "number" ? get<number>("geo_altitude") : null,
  };
}

export interface FetchStatesParams {
  lamin?: number;
  lomin?: number;
  lamax?: number;
  lomax?: number;
  /** Fetch specific aircraft by ICAO24 (hex, 6 chars). When set, bbox is ignored (global lookup). */
  icao24?: string;
}

/**
 * Fetch state vectors from OpenSky.
 * - With icao24: returns that aircraft globally (no bbox).
 * - Without icao24: use bbox to limit scope (default continental US).
 * Anonymous rate limit: do not call more than once per 10 seconds.
 */
export async function fetchOpenSkyStates(
  params: FetchStatesParams = {}
): Promise<{ time: number; states: OpenSkyStateVector[] }> {
  const url = new URL(`${OPENSKY_BASE}/states/all`);
  const { icao24 } = params;

  if (icao24 && icao24.trim().length >= 6) {
    url.searchParams.set("icao24", icao24.trim().toLowerCase().slice(0, 6));
  } else {
    const { lamin, lomin, lamax, lomax } = { ...DEFAULT_BBOX, ...params };
    url.searchParams.set("lamin", String(lamin));
    url.searchParams.set("lomin", String(lomin));
    url.searchParams.set("lamax", String(lamax));
    url.searchParams.set("lomax", String(lomax));
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenSky API error ${res.status}: ${text || res.statusText}`);
  }

  const data: OpenSkyStatesResponse = await res.json();
  const states = (data.states ?? []).map((row) => parseState(row));
  return { time: data.time, states };
}
