// Real-Time Distance Calculation & Google Maps Utilities

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
  googleMapsUrl?: string;
}

export interface DistanceCalculationResult {
  distanceKm: number; // e.g. 3.8
  etaMinutes: number; // e.g. 9
  etaMins: number; // alias for e.g. 9
  formattedDistance: string; // e.g. "3.8 km"
  formattedEta: string; // e.g. "9 min"
}

/**
 * Parses Google Maps share links or raw coordinate strings
 * e.g. "https://www.google.com/maps/place/Pune/@18.52043,73.856743,15z"
 * e.g. "https://maps.google.com/?q=18.5204,73.8567"
 * e.g. "18.5204, 73.8567"
 */
export function parseGoogleMapsUrl(inputUrl: string): { lat: number; lng: number; address?: string } | null {
  if (!inputUrl || typeof inputUrl !== "string") return null;

  const clean = inputUrl.trim();

  // Pattern 1: Raw "18.5204, 73.8567"
  const rawCoordsRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/;
  const rawMatch = clean.match(rawCoordsRegex);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Pattern 2: @18.5204,73.8567 in Google Maps URL
  const atMatch = clean.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Pattern 3: ?q=18.5204,73.8567 or ll=18.5204,73.8567
  const qMatch = clean.match(/[?&](q|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[2]);
    const lng = parseFloat(qMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Pattern 4: destination=18.5204,73.8567
  const destMatch = clean.match(/destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (destMatch) {
    const lat = parseFloat(destMatch[1]);
    const lng = parseFloat(destMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

/**
 * Haversine formula to compute great circle distance in Kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates estimated road distance (haversine * 1.25 road factor)
 * and estimated travel time (using ~28 km/h city driving speed + traffic padding)
 * Supports both (point1, point2) and (lat1, lon1, lat2, lon2) signature.
 */
export function calculateRoadDistanceAndEta(
  lat1OrPoint1: number | { lat: number; lng: number },
  lon1OrPoint2: number | { lat: number; lng: number },
  lat2?: number,
  lon2?: number
): DistanceCalculationResult {
  let lat1: number, lon1: number, l2: number, lo2: number;

  if (typeof lat1OrPoint1 === "object" && typeof lon1OrPoint2 === "object") {
    lat1 = lat1OrPoint1.lat;
    lon1 = lat1OrPoint1.lng;
    l2 = lon1OrPoint2.lat;
    lo2 = lon1OrPoint2.lng;
  } else {
    lat1 = lat1OrPoint1 as number;
    lon1 = lon1OrPoint2 as number;
    l2 = lat2 || 0;
    lo2 = lon2 || 0;
  }

  const straightDist = calculateHaversineDistance(lat1, lon1, l2, lo2);
  
  // Real road factor multiplier in city environments
  const roadMultiplier = straightDist < 5 ? 1.3 : straightDist < 20 ? 1.22 : 1.18;
  const distanceKm = Number((straightDist * roadMultiplier).toFixed(1));

  // Travel time in minutes: ~28 km/h average speed in city + 2 mins initial padding
  const avgSpeedKmH = 28;
  const travelHours = distanceKm / avgSpeedKmH;
  const etaMinutes = Math.max(2, Math.round(travelHours * 60 + 2));

  return {
    distanceKm: Math.max(0.2, distanceKm),
    etaMinutes,
    etaMins: etaMinutes,
    formattedDistance: `${Math.max(0.2, distanceKm)} km`,
    formattedEta: `${etaMinutes} min`,
  };
}

/**
 * Generates a direct Google Maps Directions navigation URL
 */
export function getGoogleMapsDirectionsUrl(
  originLat?: number,
  originLng?: number,
  destLat?: number,
  destLng?: number,
  destAddress?: string
): string {
  if (originLat && originLng && destLat && destLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  if (destLat && destLng) {
    return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
  }
  if (destAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destAddress)}`;
  }
  return "https://maps.google.com";
}

/**
 * Reverse geocode latitude & longitude to formatted address using OpenStreetMap Nominatim
 */
export async function reverseGeocodeAddress(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "JeevanSetuHealthcare/1.0",
        },
      }
    );
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Forward geocode query to lat/lng search using Nominatim
 */
export async function searchAddressGeocode(query: string): Promise<Array<{ lat: number; lng: number; displayName: string }>> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          "User-Agent": "JeevanSetuHealthcare/1.0",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
    }));
  } catch (err) {
    return [];
  }
}

export async function geocodeHospitalAddress(parts: {
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
}): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const queries: string[] = [];

  const fullAddr = [parts.address, parts.city, parts.pinCode, parts.state, "India"]
    .filter(Boolean)
    .join(", ");
  if (fullAddr) queries.push(fullAddr);

  if (parts.city && parts.pinCode) {
    queries.push(`${parts.city}, ${parts.pinCode}, ${parts.state || "Maharashtra"}, India`);
  }

  if (parts.pinCode) {
    queries.push(`${parts.pinCode}, India`);
  }

  if (parts.city) {
    queries.push(`${parts.city}, ${parts.state || "Maharashtra"}, India`);
  }

  for (const q of queries) {
    const results = await searchAddressGeocode(q);
    if (results && results.length > 0) {
      return results[0];
    }
  }

  return null;
}

