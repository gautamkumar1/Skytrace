/**
 * Offline lookup: country name from (lat, lon) using bounding boxes.
 * Covers major countries; order favours smaller/overlapping regions where needed.
 * No external API — used to fill origin_country when ADS-B source doesn't provide it.
 */

interface BBox {
  name: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

// Bounding boxes: minLat, maxLat, minLon, maxLon (rough rectangles per country)
const BOXES: BBox[] = [
  { name: "United States", minLat: 24.5, maxLat: 49.4, minLon: -125, maxLon: -66.9 },
  { name: "Canada", minLat: 41.7, maxLat: 83.1, minLon: -141, maxLon: -52.6 },
  { name: "Mexico", minLat: 14.5, maxLat: 32.7, minLon: -118.4, maxLon: -86.7 },
  { name: "United Kingdom", minLat: 49.9, maxLat: 60.9, minLon: -8.2, maxLon: 1.8 },
  { name: "Ireland", minLat: 51.4, maxLat: 55.4, minLon: -10.5, maxLon: -6 },
  { name: "France", minLat: 41.3, maxLat: 51.1, minLon: -5.1, maxLon: 9.6 },
  { name: "Spain", minLat: 35.9, maxLat: 43.8, minLon: -9.3, maxLon: 4.3 },
  { name: "Germany", minLat: 47.3, maxLat: 55.1, minLon: 5.9, maxLon: 15 },
  { name: "Italy", minLat: 36.6, maxLat: 47.1, minLon: 6.6, maxLon: 18.5 },
  { name: "Netherlands", minLat: 50.8, maxLat: 53.5, minLon: 3.4, maxLon: 7.2 },
  { name: "Belgium", minLat: 49.5, maxLat: 51.5, minLon: 2.5, maxLon: 6.4 },
  { name: "Portugal", minLat: 36.9, maxLat: 42.2, minLon: -9.5, maxLon: -6.2 },
  { name: "Poland", minLat: 49, maxLat: 54.8, minLon: 14.1, maxLon: 24.2 },
  { name: "Turkey", minLat: 36, maxLat: 42.1, minLon: 26, maxLon: 44.8 },
  { name: "Brazil", minLat: -33.8, maxLat: 5.3, minLon: -73.9, maxLon: -34.8 },
  { name: "Argentina", minLat: -55.1, maxLat: -21.8, minLon: -73.6, maxLon: -53.6 },
  { name: "Chile", minLat: -55.9, maxLat: -17.5, minLon: -75.6, maxLon: -66.5 },
  { name: "Colombia", minLat: -4.2, maxLat: 12.6, minLon: -79, maxLon: -66.9 },
  { name: "China", minLat: 18.2, maxLat: 53.6, minLon: 73.6, maxLon: 134.8 },
  { name: "Japan", minLat: 24.2, maxLat: 45.5, minLon: 123, maxLon: 153.9 },
  { name: "India", minLat: 8.1, maxLat: 35.5, minLon: 68.2, maxLon: 97.4 },
  { name: "Australia", minLat: -43.6, maxLat: -10.1, minLon: 113.3, maxLon: 153.6 },
  { name: "South Korea", minLat: 33.1, maxLat: 43, minLon: 124.6, maxLon: 131.9 },
  { name: "Indonesia", minLat: -11, maxLat: 6.1, minLon: 95, maxLon: 141 },
  { name: "Thailand", minLat: 5.6, maxLat: 20.5, minLon: 97.4, maxLon: 105.6 },
  { name: "Philippines", minLat: 4.6, maxLat: 21.1, minLon: 117, maxLon: 126.6 },
  { name: "Vietnam", minLat: 8.2, maxLat: 23.4, minLon: 102.1, maxLon: 109.5 },
  { name: "Malaysia", minLat: 0.9, maxLat: 7.4, minLon: 99.6, maxLon: 119.3 },
  { name: "Singapore", minLat: 1.2, maxLat: 1.5, minLon: 103.6, maxLon: 104.1 },
  { name: "United Arab Emirates", minLat: 22.6, maxLat: 26.1, minLon: 51.6, maxLon: 56.4 },
  { name: "Saudi Arabia", minLat: 16.4, maxLat: 32.2, minLon: 34.5, maxLon: 55.7 },
  { name: "Israel", minLat: 29.5, maxLat: 33.3, minLon: 34.3, maxLon: 35.9 },
  { name: "Egypt", minLat: 22, maxLat: 31.7, minLon: 24.7, maxLon: 37.0 },
  { name: "South Africa", minLat: -34.8, maxLat: -22.1, minLon: 16.5, maxLon: 32.9 },
  { name: "Nigeria", minLat: 4.3, maxLat: 13.9, minLon: 2.7, maxLon: 14.7 },
  { name: "Kenya", minLat: -4.7, maxLat: 5.0, minLon: 33.9, maxLon: 41.9 },
  { name: "Morocco", minLat: 27.7, maxLat: 35.9, minLon: -13.2, maxLon: -1.0 },
  { name: "Algeria", minLat: 19.0, maxLat: 37.1, minLon: -8.7, maxLon: 11.9 },
  { name: "Russia", minLat: 41.2, maxLat: 81.9, minLon: 19.6, maxLon: 180 },
  { name: "Kazakhstan", minLat: 40.6, maxLat: 55.4, minLon: 46.5, maxLon: 87.3 },
  { name: "Ukraine", minLat: 44.4, maxLat: 52.4, minLon: 22.1, maxLon: 40.2 },
  { name: "Iceland", minLat: 63.4, maxLat: 66.5, minLon: -24.5, maxLon: -13.5 },
  { name: "Norway", minLat: 58.0, maxLat: 71.2, minLon: 4.6, maxLon: 31.1 },
  { name: "Sweden", minLat: 55.3, maxLat: 69.1, minLon: 11.1, maxLon: 24.2 },
  { name: "Finland", minLat: 59.8, maxLat: 70.1, minLon: 20.6, maxLon: 31.6 },
  { name: "Denmark", minLat: 54.6, maxLat: 57.8, minLon: 8.1, maxLon: 15.2 },
  { name: "Greece", minLat: 34.8, maxLat: 41.7, minLon: 19.4, maxLon: 29.6 },
  { name: "Czech Republic", minLat: 48.6, maxLat: 51.0, minLon: 12.1, maxLon: 18.9 },
  { name: "Austria", minLat: 46.4, maxLat: 49.0, minLon: 9.5, maxLon: 17.2 },
  { name: "Switzerland", minLat: 45.8, maxLat: 47.8, minLon: 5.9, maxLon: 10.5 },
  { name: "Cuba", minLat: 19.8, maxLat: 23.2, minLon: -84.9, maxLon: -74.1 },
  { name: "Dominican Republic", minLat: 17.5, maxLat: 19.9, minLon: -72.0, maxLon: -68.3 },
  { name: "Jamaica", minLat: 17.7, maxLat: 18.5, minLon: -78.4, maxLon: -76.2 },
  { name: "Puerto Rico", minLat: 17.9, maxLat: 18.5, minLon: -67.3, maxLon: -65.2 },
  { name: "Bahamas", minLat: 20.9, maxLat: 27.4, minLon: -79.0, maxLon: -72.7 },
  { name: "Guatemala", minLat: 13.7, maxLat: 17.8, minLon: -92.2, maxLon: -88.2 },
  { name: "Panama", minLat: 7.2, maxLat: 9.6, minLon: -83.0, maxLon: -77.2 },
  { name: "Costa Rica", minLat: 8.0, maxLat: 11.2, minLon: -87.0, maxLon: -82.5 },
  { name: "Venezuela", minLat: 0.6, maxLat: 12.2, minLon: -73.4, maxLon: -59.8 },
  { name: "Ecuador", minLat: -5.0, maxLat: 1.4, minLon: -81.0, maxLon: -75.2 },
  { name: "Peru", minLat: -18.4, maxLat: 0.2, minLon: -81.3, maxLon: -68.7 },
  { name: "New Zealand", minLat: -47.3, maxLat: -34.4, minLon: 166.2, maxLon: 179.0 },
  { name: "Pakistan", minLat: 23.7, maxLat: 37.1, minLon: 61.0, maxLon: 77.0 },
  { name: "Bangladesh", minLat: 20.7, maxLat: 26.6, minLon: 88.0, maxLon: 92.7 },
  { name: "Hong Kong", minLat: 22.2, maxLat: 22.6, minLon: 113.8, maxLon: 114.4 },
  { name: "Taiwan", minLat: 21.9, maxLat: 25.3, minLon: 120.0, maxLon: 122.0 },
];

export function getCountryFromLatLon(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "";
  for (const b of BOXES) {
    if (lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon) {
      return b.name;
    }
  }
  return "";
}
