/**
 * GET /api/adsb — Proxy to Airplanes.live for ADS-B data.
 * Query params: lat, lon, radiusNm (optional; default US center, 250 nm).
 * Optional: icao24 (6-char hex) to fetch a single aircraft.
 * Rate limit: 1 req/sec (Airplanes.live). Requests are serialized so only one
 * call to Airplanes.live runs at a time, with minimum 1.2s between starts.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  fetchAirplanesLiveByPoint,
  fetchAirplanesLiveByHex,
  DEFAULT_POINT,
} from "@/lib/airplanes-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_INTERVAL_MS = 1200;
let lastCallTime = 0;
let queue: Promise<void> = Promise.resolve();

function waitForRateLimit(): Promise<void> {
  return new Promise((resolve) => {
    const elapsed = Date.now() - lastCallTime;
    const wait = elapsed >= MIN_INTERVAL_MS ? 0 : MIN_INTERVAL_MS - elapsed;
    if (wait <= 0) {
      lastCallTime = Date.now();
      resolve();
      return;
    }
    setTimeout(() => {
      lastCallTime = Date.now();
      resolve();
    }, wait);
  });
}

function parseFloatParam(req: NextRequest, key: string): number | undefined {
  const v = req.nextUrl.searchParams.get(key);
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function runFetch(req: NextRequest): Promise<NextResponse> {
  const icao24 = req.nextUrl.searchParams.get("icao24")?.trim();

  if (icao24 && icao24.length >= 6) {
    const { time, states } = await fetchAirplanesLiveByHex(icao24.slice(0, 6));
    return NextResponse.json({
      time,
      states,
      bbox: { lamin: null, lomin: null, lamax: null, lomax: null },
      icao24: icao24.slice(0, 6),
    });
  }

  const lat = parseFloatParam(req, "lat") ?? DEFAULT_POINT.lat;
  const lon = parseFloatParam(req, "lon") ?? DEFAULT_POINT.lon;
  const radiusNm = parseFloatParam(req, "radiusNm") ?? DEFAULT_POINT.radiusNm;

  const { time, states } = await fetchAirplanesLiveByPoint(lat, lon, radiusNm);

  return NextResponse.json({
    time,
    states,
    bbox: { lamin: null, lomin: null, lamax: null, lomax: null },
    icao24: null,
  });
}

export async function GET(req: NextRequest) {
  const myTurn = queue
    .then(() => waitForRateLimit())
    .then(() => runFetch(req));
  queue = myTurn.then(() => {}).catch(() => {});

  try {
    return await myTurn;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("ADS-B API error:", message);
    return NextResponse.json(
      { error: "Failed to fetch ADS-B data", detail: message },
      { status: 502 }
    );
  }
}
