/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, StyleSheet } from 'react-native';

const tintColorLight = '#0052d0';
const tintColorDark = '#799dff';

export const DesignTokens = {
  primary: '#0052d0',
  primaryDim: '#0047b7',
  primaryContainer: '#799dff',
  primaryFixed: '#799dff',
  onPrimary: '#f1f2ff',
  onPrimaryContainer: '#001e58',
  secondary: '#5543cf',
  secondaryDim: '#4935c3',
  secondaryContainer: '#d2ccff',
  onSecondary: '#f5f0ff',
  onSecondaryContainer: '#412abb',
  tertiary: '#a43336',
  tertiaryDim: '#94272b',
  tertiaryContainer: '#ff928f',
  onTertiary: '#ffefee',
  error: '#b31b25',
  errorContainer: '#fb5151',
  background: '#f7f5ff',
  surface: '#f7f5ff',
  surfaceBright: '#f7f5ff',
  surfaceDim: '#ccd2ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0efff',
  surfaceContainer: '#e5e6ff',
  surfaceContainerHigh: '#dee0ff',
  surfaceContainerHighest: '#d7dbff',
  surfaceVariant: '#d7dbff',
  surfaceTint: '#0052d0',
  onSurface: '#292d46',
  onSurfaceVariant: '#565a75',
  outline: '#717592',
  outlineVariant: '#a8abca',
  inverseSurface: '#080c24',
  inverseOnSurface: '#979bba',
  inversePrimary: '#5e8bff',
};

export const Colors = {
  light: {
    text: DesignTokens.onSurface,
    textSecondary: DesignTokens.onSurfaceVariant,
    background: DesignTokens.background,
    surface: DesignTokens.surface,
    tint: tintColorLight,
    icon: DesignTokens.onSurfaceVariant,
    tabIconDefault: DesignTokens.outline,
    tabIconSelected: tintColorLight,
    progressRingTrack: DesignTokens.surfaceContainerHigh,
    progressRingFill: tintColorLight,
    milestoneLocked: DesignTokens.surfaceDim,
    milestoneUnlocked: DesignTokens.primary,
    cardBorder: DesignTokens.outlineVariant + '1a',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    surface: '#1e2022',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    progressRingTrack: '#2a2d30',
    progressRingFill: '#3db8d9',
    milestoneLocked: '#3a3d40',
    milestoneUnlocked: '#3db8d9',
    cardBorder: '#2a2d30',
  },
};

export const MilestoneColors: Record<string, string> = {
  'first-step': DesignTokens.primary,
  'explorer': DesignTokens.secondary,
  'all-regions': DesignTokens.tertiary,
  'halfway': DesignTokens.primaryDim,
  'coast-to-coast': DesignTokens.secondaryDim,
  'all-51': DesignTokens.tertiary,
};

export const RegionColors: Record<string, string> = {
  Northeast: DesignTokens.secondary,
  South: DesignTokens.tertiary,
  Midwest: DesignTokens.primary,
  West: DesignTokens.secondaryDim,
};

export const REGION_COLOR_PALETTE = [
  DesignTokens.secondary,
  DesignTokens.tertiary,
  DesignTokens.primary,
  DesignTokens.secondaryDim,
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
];

export function getRegionColorByIndex(index: number): string {
  return REGION_COLOR_PALETTE[index % REGION_COLOR_PALETTE.length];
}

export function buildRegionColorMap(regionNames: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  regionNames.forEach((name, i) => {
    map[name] = REGION_COLOR_PALETTE[i % REGION_COLOR_PALETTE.length];
  });
  return map;
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = StyleSheet.create({
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  mediumDownward: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  }
});

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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...Shadows.light,
  },
  floatingBox: {
    backgroundColor: 'white',
    padding: 20,
    ...Shadows.mediumDownward,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  }
});
