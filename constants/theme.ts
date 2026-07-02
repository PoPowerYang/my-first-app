/**
 * Neo Voyage — Kinetic Brutalism Design System
 *
 * Dark, aggressive aesthetic with neon accents, sharp corners (0 border-radius),
 * thick borders, and offset box-shadow effects.
 */

import { Platform, StyleSheet, ViewStyle } from 'react-native';

export type DesignTokensType = typeof DarkDesignTokens;

export const DarkDesignTokens = {
  // Primary — Cyan
  primary: '#c1fffe',
  primaryDim: '#00e6e6',
  primaryContainer: '#00ffff',
  primaryFixed: '#00f5f5',
  onPrimary: '#006767',
  onPrimaryContainer: '#005d5d',

  // Secondary — Magenta
  secondary: '#ff51fa',
  secondaryDim: '#ff51fa',
  secondaryContainer: '#a900a9',
  onSecondary: '#400040',
  onSecondaryContainer: '#fff5f9',

  // Tertiary — Neon Green / Lime
  tertiary: '#f6ffc0',
  tertiaryDim: '#d0ed00',
  tertiaryContainer: '#daf900',
  onTertiary: '#586500',

  // Error
  error: '#ff716c',
  errorContainer: '#9f0519',

  // Surfaces — Dark hierarchy
  background: '#0e0e0e',
  surface: '#0e0e0e',
  surfaceBright: '#2c2c2c',
  surfaceDim: '#0e0e0e',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#131313',
  surfaceContainer: '#1a1a1a',
  surfaceContainerHigh: '#20201f',
  surfaceContainerHighest: '#262626',
  surfaceVariant: '#262626',
  surfaceTint: '#c1fffe',

  // On-surface
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaaa',

  // Outlines
  outline: '#767575',
  outlineVariant: '#484847',

  // Inverse
  inverseSurface: '#fcf9f8',
  inverseOnSurface: '#565555',
  inversePrimary: '#006a6a',
};

export const LightDesignTokens: DesignTokensType = {
  // Primary — Teal
  primary: '#004d4d',
  primaryDim: '#003d3d',
  primaryContainer: '#00cccc',
  primaryFixed: '#00b8b8',
  onPrimary: '#99ffff',
  onPrimaryContainer: '#003f3f',

  // Secondary — Magenta
  secondary: '#7a007a',
  secondaryDim: '#600060',
  secondaryContainer: '#e680d9',
  onSecondary: '#ffe6f8',
  onSecondaryContainer: '#5c005c',

  // Tertiary — Neon Green / Lime
  tertiary: '#3a4a00',
  tertiaryDim: '#2d3900',
  tertiaryContainer: '#a0cc00',
  onTertiary: '#c8e060',

  // Error
  error: '#8c1018',
  errorContainer: '#d93030',

  // Surfaces — Light hierarchy (kept light)
  background: '#f6f6f6',
  surface: '#f6f6f6',
  surfaceBright: '#f6f6f6',
  surfaceDim: '#c8cbcb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f1f1',
  surfaceContainer: '#e7e8e8',
  surfaceContainerHigh: '#e1e3e3',
  surfaceContainerHighest: '#dbdddd',
  surfaceVariant: '#dbdddd',
  surfaceTint: '#004d4d',

  // On-surface
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#3d3f3f',

  // Outlines
  outline: '#4a4c4c',
  outlineVariant: '#7a7c7c',

  // Inverse
  inverseSurface: '#0c0f0f',
  inverseOnSurface: '#8a8b8b',
  inversePrimary: '#00cccc',
};

/** @deprecated Use useTheme() hook instead for dynamic theming */
export const DesignTokens = DarkDesignTokens;

/** Font families loaded via expo-google-fonts */
export const FontFamilies = {
  headline: 'SpaceGrotesk_700Bold',
  headlineBlack: 'SpaceGrotesk_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  label: 'SpaceGrotesk_600SemiBold',
};

export const Colors = {
  light: {
    text: DesignTokens.onSurface,
    textSecondary: DesignTokens.onSurfaceVariant,
    background: DesignTokens.background,
    surface: DesignTokens.surface,
    tint: DesignTokens.primaryContainer,
    icon: DesignTokens.onSurfaceVariant,
    tabIconDefault: DesignTokens.outline,
    tabIconSelected: DesignTokens.primaryContainer,
    progressRingTrack: DesignTokens.surfaceContainerHighest,
    progressRingFill: DesignTokens.primaryContainer,
    milestoneLocked: DesignTokens.surfaceContainerHigh,
    milestoneUnlocked: DesignTokens.primaryContainer,
    cardBorder: DesignTokens.onSurface,
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#adaaaa',
    background: '#0e0e0e',
    surface: '#0e0e0e',
    tint: '#00ffff',
    icon: '#adaaaa',
    tabIconDefault: '#767575',
    tabIconSelected: '#00ffff',
    progressRingTrack: '#262626',
    progressRingFill: '#00ffff',
    milestoneLocked: '#20201f',
    milestoneUnlocked: '#00ffff',
    cardBorder: '#ffffff',
  },
};

export const MilestoneColors: Record<string, string> = {
  'first-step': DesignTokens.primaryContainer,
  'explorer': DesignTokens.secondary,
  'all-regions': DesignTokens.tertiaryContainer,
  'halfway': DesignTokens.primaryDim,
  'coast-to-coast': DesignTokens.surfaceTint,
  'all-51': DesignTokens.secondary,
};

export const RegionColors: Record<string, string> = {
  West: DesignTokens.primaryContainer,
  Midwest: DesignTokens.tertiaryContainer,
  South: DesignTokens.secondary,
  Northeast: DesignTokens.surfaceTint,
};

export const REGION_COLOR_PALETTE = [
  DesignTokens.primaryContainer,
  DesignTokens.secondary,
  DesignTokens.tertiaryContainer,
  DesignTokens.surfaceTint,
  '#ff716c',
  '#d0ed00',
  '#c1fffe',
  '#ff51fa',
];

export function getRegionColorByIndex(index: number): string {
  return REGION_COLOR_PALETTE[index % REGION_COLOR_PALETTE.length];
}

export function buildRegionColorMap(regionNames: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  regionNames.forEach((name, i) => {
    map[name] = RegionColors[name] ?? REGION_COLOR_PALETTE[i % REGION_COLOR_PALETTE.length];
  });
  return map;
}

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "system-ui, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Shadows = StyleSheet.create({
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 3,
  },
  mediumDownward: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 10,
  },
});

/** Create a brutalist offset shadow by using an absolutely-positioned View behind a card. */
export function brutalistShadowStyle(color: string, offset = 8): ViewStyle {
  return {
    position: 'absolute',
    top: offset,
    left: offset,
    right: -offset,
    bottom: -offset,
    backgroundColor: color,
  };
}

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: DesignTokens.surfaceContainerLow,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: DesignTokens.onSurface,
    padding: 20,
  },
  floatingBox: {
    backgroundColor: DesignTokens.surfaceContainer,
    borderWidth: 2,
    borderColor: DesignTokens.onSurface,
    padding: 20,
  },
  errorText: {
    color: DesignTokens.error,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
