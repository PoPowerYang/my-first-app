/**
 * Defines the interface for map coloring algorithms.
 * An algorithm should accept an array of GeoJSON features and return a mapping of state names to valid CSS string colors.
 */
export type MapColoringAlgorithm = (features: any[]) => Record<string, string>;

/**
 * Helper function to convert HSL color values to a hex string with an appended alpha channel.
 * We use this to smoothly distribute colors across the hue wheel so that every state 
 * gets a distinct but aesthetically pleasing color with 50% opacity (#80 in hex).
 * 
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 */
export const hslToHexAlpha = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}80`;
};

/**
 * Four Color Algorithm implementation for US States.
 * Maps the predefined 4-color graph correctly to each state.
 */
export const fourColorAlgorithm: MapColoringAlgorithm = (features) => {
  // A pre-calculated 4-color mapping of US states ensuring no two adjacent states share a color
  const stateColorMapping: Record<string, number> = {
    "Arizona": 3, "Arkansas": 2, "California": 0, "Colorado": 0, "Connecticut": 2,
    "District of Columbia": 0, "Georgia": 1, "Hawaii": 0, "Illinois": 3, "Indiana": 0,
    "Louisiana": 3, "Minnesota": 1, "Mississippi": 1, "Montana": 3, "New Mexico": 1,
    "North Dakota": 0, "Oklahoma": 3, "Pennsylvania": 0, "Tennessee": 0, "Virginia": 1,
    "Puerto Rico": 0, "Delaware": 1, "West Virginia": 3, "Wisconsin": 2, "Wyoming": 1,
    "Alabama": 2, "Alaska": 0, "Florida": 0, "Idaho": 0, "Kansas": 2, "Maryland": 2,
    "New Jersey": 2, "North Carolina": 2, "South Carolina": 0, "Washington": 1,
    "Vermont": 2, "Utah": 2, "Iowa": 0, "Kentucky": 2, "Maine": 0, "Massachusetts": 0,
    "Michigan": 3, "Missouri": 1, "Nebraska": 3, "Nevada": 1, "New Hampshire": 1,
    "New York": 1, "Ohio": 1, "Oregon": 2, "Rhode Island": 1, "South Dakota": 2, "Texas": 0
  };

  // Define 4 distinct, harmonious colors for the map using HSL to look premium
  const baseColors = [
    hslToHexAlpha(350, 80, 60), // Coral Red
    hslToHexAlpha(45, 85, 55),  // Warm Yellow
    hslToHexAlpha(160, 70, 45), // Mint Green
    hslToHexAlpha(220, 85, 60), // Sky Blue
  ];

  const colorMap: Record<string, string> = {};
  features.forEach((feature) => {
    const stateName = feature.properties?.NAME;
    if (stateName) {
      const colorIndex = stateColorMapping[stateName] ?? 0;
      colorMap[stateName] = baseColors[colorIndex];
    }
  });

  return colorMap;
};

/**
 * Sequential hue generation algorithm.
 * Generates an array of distinct colors equal to the number of states, spaced evenly along the color wheel.
 */
export const sequentialHueAlgorithm: MapColoringAlgorithm = (features) => {
  const numStates = features.length;
  const colors = Array.from({ length: numStates }, (_, i) => {
    const hue = (i * 360) / numStates;
    return hslToHexAlpha(hue, 70, 50);
  });

  const colorMap: Record<string, string> = {};
  features.forEach((feature, index) => {
    const stateName = feature.properties?.NAME;
    if (stateName) {
      colorMap[stateName] = colors[index];
    }
  });

  return colorMap;
};
