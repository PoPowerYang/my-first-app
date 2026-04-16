import type { Region } from 'react-native-maps';

export interface CountryRegion {
  name: string;
  shortName: string;
  icon: string;
  states: string[];
  mapRegion: Region;
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  subdivisionLabel: string;
  subdivisionLabelPlural: string;
  subdivisions: string[];
  regions: CountryRegion[];
  initialMapRegion: Region;
  hasGeoJson: boolean;
}

// ────────────────────────── United States ──────────────────────────

const US_SUBDIVISIONS = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const US_REGIONS: CountryRegion[] = [
  {
    name: 'Northeast',
    shortName: 'NE',
    icon: 'city-variant',
    states: [
      'Connecticut', 'Delaware', 'Maine', 'Maryland', 'Massachusetts',
      'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania',
      'Rhode Island', 'Vermont', 'District of Columbia',
    ],
    mapRegion: { latitude: 42.0, longitude: -74.0, latitudeDelta: 10.0, longitudeDelta: 10.0 },
  },
  {
    name: 'South',
    shortName: 'S',
    icon: 'palm-tree',
    states: [
      'Alabama', 'Arkansas', 'Florida', 'Georgia', 'Kentucky', 'Louisiana',
      'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina',
      'Tennessee', 'Texas', 'Virginia', 'West Virginia',
    ],
    mapRegion: { latitude: 33.0, longitude: -86.0, latitudeDelta: 16.0, longitudeDelta: 16.0 },
  },
  {
    name: 'Midwest',
    shortName: 'MW',
    icon: 'barley',
    states: [
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota',
      'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin',
    ],
    mapRegion: { latitude: 42.0, longitude: -90.0, latitudeDelta: 14.0, longitudeDelta: 14.0 },
  },
  {
    name: 'West',
    shortName: 'W',
    icon: 'mountain',
    states: [
      'Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho',
      'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming',
    ],
    mapRegion: { latitude: 40.0, longitude: -112.0, latitudeDelta: 22.0, longitudeDelta: 22.0 },
  },
];

// ────────────────────────── Canada ──────────────────────────

const CA_SUBDIVISIONS = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon',
];

const CA_REGIONS: CountryRegion[] = [
  {
    name: 'Atlantic',
    shortName: 'ATL',
    icon: 'waves',
    states: ['Newfoundland and Labrador', 'Prince Edward Island', 'Nova Scotia', 'New Brunswick'],
    mapRegion: { latitude: 46.5, longitude: -63.0, latitudeDelta: 10.0, longitudeDelta: 10.0 },
  },
  {
    name: 'Central',
    shortName: 'CTR',
    icon: 'office-building',
    states: ['Quebec', 'Ontario'],
    mapRegion: { latitude: 48.0, longitude: -78.0, latitudeDelta: 14.0, longitudeDelta: 14.0 },
  },
  {
    name: 'Prairies',
    shortName: 'PRA',
    icon: 'barley',
    states: ['Manitoba', 'Saskatchewan', 'Alberta'],
    mapRegion: { latitude: 52.0, longitude: -108.0, latitudeDelta: 14.0, longitudeDelta: 14.0 },
  },
  {
    name: 'West Coast',
    shortName: 'WC',
    icon: 'pine-tree',
    states: ['British Columbia'],
    mapRegion: { latitude: 54.0, longitude: -125.0, latitudeDelta: 14.0, longitudeDelta: 14.0 },
  },
  {
    name: 'North',
    shortName: 'N',
    icon: 'snowflake',
    states: ['Yukon', 'Northwest Territories', 'Nunavut'],
    mapRegion: { latitude: 65.0, longitude: -110.0, latitudeDelta: 20.0, longitudeDelta: 20.0 },
  },
];

// ────────────────────────── Australia ──────────────────────────

const AU_SUBDIVISIONS = [
  'New South Wales', 'Victoria', 'Queensland', 'South Australia',
  'Western Australia', 'Tasmania', 'Northern Territory',
  'Australian Capital Territory',
];

const AU_REGIONS: CountryRegion[] = [
  {
    name: 'Eastern',
    shortName: 'E',
    icon: 'city-variant',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Australian Capital Territory', 'Tasmania'],
    mapRegion: { latitude: -33.0, longitude: 150.0, latitudeDelta: 16.0, longitudeDelta: 16.0 },
  },
  {
    name: 'Western',
    shortName: 'W',
    icon: 'terrain',
    states: ['Western Australia', 'South Australia', 'Northern Territory'],
    mapRegion: { latitude: -25.0, longitude: 130.0, latitudeDelta: 24.0, longitudeDelta: 24.0 },
  },
];

// ────────────────────────── United Kingdom ──────────────────────────

const GB_SUBDIVISIONS = [
  'England', 'Scotland', 'Wales', 'Northern Ireland',
];

const GB_REGIONS: CountryRegion[] = [
  {
    name: 'Great Britain',
    shortName: 'GB',
    icon: 'crown',
    states: ['England', 'Scotland', 'Wales'],
    mapRegion: { latitude: 54.0, longitude: -2.0, latitudeDelta: 10.0, longitudeDelta: 10.0 },
  },
  {
    name: 'Ireland',
    shortName: 'NI',
    icon: 'clover',
    states: ['Northern Ireland'],
    mapRegion: { latitude: 54.6, longitude: -6.8, latitudeDelta: 3.0, longitudeDelta: 3.0 },
  },
];

// ────────────────────────── Japan ──────────────────────────

const JP_SUBDIVISIONS = [
  'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
  'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
  'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano',
  'Gifu', 'Shizuoka', 'Aichi',
  'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama',
  'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
  'Tokushima', 'Kagawa', 'Ehime', 'Kochi',
  'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa',
];

const JP_REGIONS: CountryRegion[] = [
  {
    name: 'Hokkaido',
    shortName: 'HK',
    icon: 'snowflake',
    states: ['Hokkaido'],
    mapRegion: { latitude: 43.0, longitude: 143.0, latitudeDelta: 6.0, longitudeDelta: 6.0 },
  },
  {
    name: 'Tohoku',
    shortName: 'TH',
    icon: 'pine-tree',
    states: ['Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima'],
    mapRegion: { latitude: 39.5, longitude: 140.0, latitudeDelta: 5.0, longitudeDelta: 5.0 },
  },
  {
    name: 'Kanto',
    shortName: 'KT',
    icon: 'city-variant',
    states: ['Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa'],
    mapRegion: { latitude: 36.0, longitude: 139.5, latitudeDelta: 3.0, longitudeDelta: 3.0 },
  },
  {
    name: 'Chubu',
    shortName: 'CB',
    icon: 'mountain',
    states: ['Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu', 'Shizuoka', 'Aichi'],
    mapRegion: { latitude: 36.0, longitude: 137.5, latitudeDelta: 5.0, longitudeDelta: 5.0 },
  },
  {
    name: 'Kansai',
    shortName: 'KS',
    icon: 'torii-gate',
    states: ['Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama'],
    mapRegion: { latitude: 34.5, longitude: 135.5, latitudeDelta: 3.0, longitudeDelta: 3.0 },
  },
  {
    name: 'Chugoku',
    shortName: 'CG',
    icon: 'bridge',
    states: ['Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi'],
    mapRegion: { latitude: 34.5, longitude: 133.0, latitudeDelta: 4.0, longitudeDelta: 4.0 },
  },
  {
    name: 'Shikoku',
    shortName: 'SK',
    icon: 'island',
    states: ['Tokushima', 'Kagawa', 'Ehime', 'Kochi'],
    mapRegion: { latitude: 33.5, longitude: 133.5, latitudeDelta: 3.0, longitudeDelta: 3.0 },
  },
  {
    name: 'Kyushu',
    shortName: 'KQ',
    icon: 'volcano',
    states: ['Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'],
    mapRegion: { latitude: 32.5, longitude: 131.0, latitudeDelta: 6.0, longitudeDelta: 6.0 },
  },
];

// ────────────────────────── Germany ──────────────────────────

const DE_SUBDIVISIONS = [
  'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern',
  'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland',
  'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
];

const DE_REGIONS: CountryRegion[] = [
  {
    name: 'Northern',
    shortName: 'N',
    icon: 'waves',
    states: ['Schleswig-Holstein', 'Hamburg', 'Lower Saxony', 'Bremen', 'Mecklenburg-Vorpommern'],
    mapRegion: { latitude: 53.5, longitude: 10.0, latitudeDelta: 5.0, longitudeDelta: 5.0 },
  },
  {
    name: 'Eastern',
    shortName: 'E',
    icon: 'wall',
    states: ['Berlin', 'Brandenburg', 'Saxony', 'Saxony-Anhalt', 'Thuringia'],
    mapRegion: { latitude: 51.5, longitude: 12.5, latitudeDelta: 5.0, longitudeDelta: 5.0 },
  },
  {
    name: 'Western',
    shortName: 'W',
    icon: 'factory',
    states: ['North Rhine-Westphalia', 'Hesse', 'Rhineland-Palatinate', 'Saarland'],
    mapRegion: { latitude: 50.5, longitude: 8.0, latitudeDelta: 4.0, longitudeDelta: 4.0 },
  },
  {
    name: 'Southern',
    shortName: 'S',
    icon: 'castle',
    states: ['Baden-Württemberg', 'Bavaria'],
    mapRegion: { latitude: 48.5, longitude: 11.0, latitudeDelta: 4.0, longitudeDelta: 4.0 },
  },
];

// ────────────────────────── All Countries ──────────────────────────

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    subdivisionLabel: 'State',
    subdivisionLabelPlural: 'States',
    subdivisions: US_SUBDIVISIONS,
    regions: US_REGIONS,
    initialMapRegion: { latitude: 39.8283, longitude: -98.5795, latitudeDelta: 50.0, longitudeDelta: 50.0 },
    hasGeoJson: true,
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    subdivisionLabel: 'Province',
    subdivisionLabelPlural: 'Provinces',
    subdivisions: CA_SUBDIVISIONS,
    regions: CA_REGIONS,
    initialMapRegion: { latitude: 56.0, longitude: -96.0, latitudeDelta: 40.0, longitudeDelta: 40.0 },
    hasGeoJson: false,
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    subdivisionLabel: 'State',
    subdivisionLabelPlural: 'States',
    subdivisions: AU_SUBDIVISIONS,
    regions: AU_REGIONS,
    initialMapRegion: { latitude: -25.0, longitude: 134.0, latitudeDelta: 40.0, longitudeDelta: 40.0 },
    hasGeoJson: false,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    subdivisionLabel: 'Country',
    subdivisionLabelPlural: 'Countries',
    subdivisions: GB_SUBDIVISIONS,
    regions: GB_REGIONS,
    initialMapRegion: { latitude: 54.5, longitude: -3.5, latitudeDelta: 12.0, longitudeDelta: 12.0 },
    hasGeoJson: false,
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    subdivisionLabel: 'Prefecture',
    subdivisionLabelPlural: 'Prefectures',
    subdivisions: JP_SUBDIVISIONS,
    regions: JP_REGIONS,
    initialMapRegion: { latitude: 36.5, longitude: 138.0, latitudeDelta: 16.0, longitudeDelta: 16.0 },
    hasGeoJson: false,
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    subdivisionLabel: 'State',
    subdivisionLabelPlural: 'States',
    subdivisions: DE_SUBDIVISIONS,
    regions: DE_REGIONS,
    initialMapRegion: { latitude: 51.0, longitude: 10.5, latitudeDelta: 10.0, longitudeDelta: 10.0 },
    hasGeoJson: false,
  },
];

export function getCountryByCode(code: string): CountryConfig {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function getRegionForSubdivision(
  name: string,
  regions: CountryRegion[],
): CountryRegion | undefined {
  return regions.find((r) => r.states.includes(name));
}

export function getRegionProgress(
  region: CountryRegion,
  visited: Set<string>,
): { visited: number; total: number } {
  const v = region.states.filter((s) => visited.has(s)).length;
  return { visited: v, total: region.states.length };
}
