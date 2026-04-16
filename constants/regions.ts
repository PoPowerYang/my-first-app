import type { Region } from 'react-native-maps';

export interface USRegion {
  name: string;
  shortName: string;
  icon: string;
  states: string[];
  mapRegion: Region;
}

export const US_REGIONS: USRegion[] = [
  {
    name: 'Northeast',
    shortName: 'NE',
    icon: 'city-variant',
    states: [
      'Connecticut', 'Delaware', 'Maine', 'Maryland', 'Massachusetts',
      'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania',
      'Rhode Island', 'Vermont', 'District of Columbia',
    ],
    mapRegion: {
      latitude: 42.0,
      longitude: -74.0,
      latitudeDelta: 10.0,
      longitudeDelta: 10.0,
    },
  },
  {
    name: 'South',
    shortName: 'S',
    icon: 'palm-tree',
    states: [
      'Alabama', 'Arkansas', 'Florida', 'Georgia', 'Kentucky',
      'Louisiana', 'Mississippi', 'North Carolina', 'Oklahoma',
      'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'West Virginia',
    ],
    mapRegion: {
      latitude: 33.0,
      longitude: -86.0,
      latitudeDelta: 16.0,
      longitudeDelta: 16.0,
    },
  },
  {
    name: 'Midwest',
    shortName: 'MW',
    icon: 'barley',
    states: [
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan',
      'Minnesota', 'Missouri', 'Nebraska', 'North Dakota',
      'Ohio', 'South Dakota', 'Wisconsin',
    ],
    mapRegion: {
      latitude: 42.0,
      longitude: -90.0,
      latitudeDelta: 14.0,
      longitudeDelta: 14.0,
    },
  },
  {
    name: 'West',
    shortName: 'W',
    icon: 'mountain',
    states: [
      'Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii',
      'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Oregon',
      'Utah', 'Washington', 'Wyoming',
    ],
    mapRegion: {
      latitude: 40.0,
      longitude: -112.0,
      latitudeDelta: 22.0,
      longitudeDelta: 22.0,
    },
  },
];

export const PACIFIC_COAST_STATES = ['California', 'Oregon', 'Washington', 'Hawaii', 'Alaska'];
export const ATLANTIC_COAST_STATES = [
  'Maine', 'New Hampshire', 'Massachusetts', 'Rhode Island', 'Connecticut',
  'New York', 'New Jersey', 'Delaware', 'Maryland', 'Virginia',
  'North Carolina', 'South Carolina', 'Georgia', 'Florida',
];

export function getRegionForState(stateName: string): USRegion | undefined {
  return US_REGIONS.find((r) => r.states.includes(stateName));
}

export function getRegionProgress(
  region: USRegion,
  visitedStates: Set<string>,
): { visited: number; total: number } {
  const visited = region.states.filter((s) => visitedStates.has(s)).length;
  return { visited, total: region.states.length };
}
