// Turns map coordinates into a readable place ("Mavoor Road, Kozhikode") with OpenStreetMap's Nominatim.
// Their policy allows light use from one server with an identifying User-Agent, at most 1 request a second,
// so results are cached and failures simply return null. Swap for Google Maps Geocoding when there is a key.

const CACHE_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { value: Place | null; until: number }>();
let lastCall = 0;

export interface Place {
  /** Short: the neighbourhood or road, and the town. */
  label: string;
  /** Longer, for "your location is…". */
  address: string;
}

interface Nominatim {
  display_name?: string;
  address?: Record<string, string>;
}

export async function reverseGeocode(lat: number, lng: number): Promise<Place | null> {
  // About 11 m: close enough to share a lookup, far enough apart to tell streets apart.
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.value;
  if (Date.now() - lastCall < 1000) return null;
  lastCall = Date.now();

  let value: Place | null = null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;
    const res = await fetch(url, { headers: { "User-Agent": "MedicoToHome/1.0 (+https://medicotohome.com)" }, signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = (await res.json()) as Nominatim;
      const a = data.address ?? {};
      const near = a.road ?? a.neighbourhood ?? a.suburb ?? a.quarter ?? a.village ?? a.hamlet;
      const town = a.city ?? a.town ?? a.municipality ?? a.city_district ?? a.county ?? a.state_district;
      const label = [near, town].filter((x, i, all) => x && all.indexOf(x) === i).join(", ");
      const address = [a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road, a.neighbourhood ?? a.suburb, a.village ?? a.town ?? a.city, a.state_district ?? a.county, a.postcode]
        .filter((x, i, all) => x && all.indexOf(x) === i)
        .join(", ");
      if (label) value = { label, address: address || data.display_name || label };
    }
  } catch {
    value = null;
  }
  cache.set(key, { value, until: Date.now() + (value ? CACHE_MS : 60_000) });
  return value;
}
