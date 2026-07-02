import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { CountryRegion } from '@/constants/countries';
import { type DesignTokensType, FontFamilies, RegionColors, getRegionColorByIndex } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

interface RegionCardProps {
  region: CountryRegion;
  visited: number;
  total: number;
  onPress: () => void;
  colorIndex?: number;
}

export function RegionCard({ region, visited, total, onPress, colorIndex }: RegionCardProps) {
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const color = RegionColors[region.name] ?? (colorIndex != null ? getRegionColorByIndex(colorIndex) : tokens.outline);
  const progress = total > 0 ? visited / total : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{region.name}</Text>
        <Text style={[styles.count, { color }]}>
          {visited}/{total}
        </Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: t.surfaceContainerLow,
    padding: 20,
    borderWidth: 2,
    borderColor: t.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  name: {
    fontFamily: FontFamilies.label,
    fontSize: 12,
    fontWeight: '700',
    color: t.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: t.outlineVariant,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  count: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 12,
    fontWeight: '900',
  },
});
