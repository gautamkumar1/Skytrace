/**
 * Airplanes.live REST API client for ADS-B aircraft data.
 * Free, no API key. Rate limit: 1 request per second.
 * @see https://airplanes.live/api-guide/
 */

import type { OpenSkyStateVector } from "./opensky";
import { getCountryFromLatLon } from "./country-from-coords";

const BASE = "https://api.airplanes.live/v2";

/** Default center (US) and max radius in nautical miles (API max 250) */
export const DEFAULT_POINT = { lat: 39.5, lon: -98.5, radiusNm: 250 };

interface AirplanesAircraft {
  hex?: string;
  flight?: string;
  r?: string;
  t?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number;
  baro_rate?: number;
  gs?: number;
  track?: number;
  seen?: number;
  [key: string]: unknown;
}

interface AirplanesResponse {
  ctime?: number;
  now?: number; // milliseconds
  total?: number;
  ac?: AirplanesAircraft[];
  aircraft?: AirplanesAircraft[];
  msg?: string;
}

function toStateVector(a: AirplanesAircraft, nowSec: number): OpenSkyStateVector {
  const hex = (a.hex ?? "").toString().replace(/^~/, "").toLowerCase().slice(0, 6);
  const lat = typeof a.lat === "number" ? a.lat : null;
  const lon = typeof a.lon === "number" ? a.lon : null;
  const baro = typeof a.alt_baro === "number" ? a.alt_baro : null;
  // gs from Airplanes.live is in knots; we store velocity in m/s for consistency with UI
  const gsKt = typeof a.gs === "number" ? a.gs : null;
  const gs = gsKt != null ? gsKt / 1.94384 : null;
  const track = typeof a.track === "number" ? a.track : null;
  const baroRate = typeof a.baro_rate === "number" ? a.baro_rate : null;
  const seen = typeof a.seen === "number" ? a.seen : 0;
  const lastContact = Math.floor(nowSec - seen);
  const onGround = (gsKt != null && gsKt < 30) || baro === 0;
  const origin_country =
    lat != null && lon != null ? getCountryFromLatLon(lat, lon) : "";

  return {
    icao24: hex,
    callsign: (a.flight ?? "").toString().trim() || null,
    origin_country,
    time_position: lat != null && lon != null ? lastContact : null,
    last_contact: lastContact,
    longitude: lon,
    latitude: lat,
    baro_altitude: baro,
    on_ground: onGround,
    velocity: gs,
    true_track: track,
    vertical_rate: baroRate,
    geo_altitude: baro,
  };
}

/**
 * Fetch aircraft within radius of a point. Rate limit: 1 req/sec.
 */
export async function fetchAirplanesLiveByPoint(
  lat: number,
  lon: number,
  radiusNm: number
): Promise<{ time: number; states: OpenSkyStateVector[] }> {
  const radius = Math.min(Math.max(1, Math.round(radiusNm)), 250);
  const url = `${BASE}/point/${lat}/${lon}/${radius}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airplanes.live API error ${res.status}: ${text || res.statusText}`);
  }

  const data: AirplanesResponse = await res.json();
  const nowMs = data.now ?? Date.now();
  const now = Math.floor(nowMs / 1000);
  const list = data.ac ?? data.aircraft ?? [];
  const states = list
    .filter((a) => a.hex && (a.lat != null || a.lon != null))
    .map((a) => toStateVector(a, now));
  return { time: now, states };
}

/**
 * Fetch a single aircraft by ICAO24 hex. Rate limit: 1 req/sec.
 */
export async function fetchAirplanesLiveByHex(
  icao24: string
): Promise<{ time: number; states: OpenSkyStateVector[] }> {
  const hex = icao24.trim().toLowerCase().slice(0, 6);
  if (!hex) return { time: Math.floor(Date.now() / 1000), states: [] };
  const url = `${BASE}/hex/${hex}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airplanes.live API error ${res.status}: ${text || res.statusText}`);
  }

  const data: AirplanesResponse = await res.json();
  const nowMs = data.now ?? Date.now();
  const now = Math.floor(nowMs / 1000);
  const list = data.ac ?? data.aircraft ?? [];
  const states = list.map((a) => toStateVector(a, now));
  return { time: now, states };
}
