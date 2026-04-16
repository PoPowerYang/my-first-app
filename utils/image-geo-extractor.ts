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
/**
 * Extracts the date the photo was taken from EXIF data.
 * Tries DateTimeOriginal, then DateTimeDigitized, then DateTime.
 * EXIF date format: "YYYY:MM:DD HH:MM:SS"
 */
export function extractDateFromExif(
  exif: ExifData | null | undefined,
): string | null {
  if (!exif) return null;

  const raw = exif.DateTimeOriginal ?? exif.DateTimeDigitized ?? exif.DateTime;
  if (typeof raw !== 'string' || !raw) return null;

  // Convert "YYYY:MM:DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SS"
  const iso = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3').replace(' ', 'T');
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;

  return date.toISOString();
}

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

const STATE_ABBREV_TO_NAME: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico',
};

/**
 * Reverse geocodes GPS coordinates to a subdivision name for the given country.
 * For the US, handles both full names and abbreviations returned by the geocoder.
 * For other countries, uses the region name directly from the geocoder.
 */
export async function reverseGeocodeToState(
  coords: { latitude: number; longitude: number },
  expectedCountryCode: string = 'US',
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results.length === 0) return null;

    const place = results[0];
    const isoCode = place.isoCountryCode ?? '';

    if (isoCode !== expectedCountryCode) {
      return null;
    }

    const region = place.region ?? null;
    if (!region) return null;

    // For US, convert abbreviation to full name if needed
    if (expectedCountryCode === 'US') {
      return STATE_ABBREV_TO_NAME[region] ?? region;
    }

    // For UK, the geocoder returns constituent country names at the "country" level
    // but "region" may return sub-regions; use the region as-is
    return region;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return null;
  }
}
