import * as Location from 'expo-location';

interface ExifData {
  GPSLatitude?: number;
  GPSLongitude?: number;
  GPSLatitudeRef?: string;
  GPSLongitudeRef?: string;
  [key: string]: any;
}

/**
 * Extracts GPS coordinates from EXIF data returned by expo-image-picker.
 * EXIF stores lat/lng as positive values with separate ref fields
 * (N/S for latitude, E/W for longitude) to indicate the hemisphere.
 */
export function extractGpsFromExif(
  exif: ExifData | null | undefined,
): { latitude: number; longitude: number } | null {
  if (!exif) return null;

  const lat = exif.GPSLatitude;
  const lng = exif.GPSLongitude;

  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (lat === 0 && lng === 0) return null;

  const latitude = exif.GPSLatitudeRef === 'S' ? -lat : lat;
  const longitude = exif.GPSLongitudeRef === 'W' ? -lng : lng;

  return { latitude, longitude };
}

/**
 * Reverse geocodes GPS coordinates to a US state name.
 * Returns the state name (e.g., "California") or null if the location
 * is not in the US or reverse geocoding fails.
 */
export async function reverseGeocodeToState(coords: {
  latitude: number;
  longitude: number;
}): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results.length === 0) return null;

    const place = results[0];
    // expo-location returns the state/province in the `region` field
    if (place.isoCountryCode !== 'US' && place.country !== 'United States') {
      return null;
    }

    return place.region ?? null;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return null;
  }
}
