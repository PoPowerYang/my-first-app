import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type DesignTokensType, FontFamilies } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { hslToHexAlpha } from '@/utils/map-coloring';

const LEGEND_COLORS = [
  { label: 'Coral Red', color: hslToHexAlpha(350, 80, 60) },
  { label: 'Warm Yellow', color: hslToHexAlpha(45, 85, 55) },
  { label: 'Mint Green', color: hslToHexAlpha(160, 70, 45) },
  { label: 'Sky Blue', color: hslToHexAlpha(220, 85, 60) },
];

export function MapLegend() {
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>{expanded ? '▼' : '▲'} Legend</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {LEGEND_COLORS.map((item) => (
            <View key={item.label} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.label}>Visited</Text>
            </View>
          ))}
          <View style={styles.row}>
            <View style={[styles.dot, styles.unvisitedDot]} />
            <Text style={styles.label}>Not yet visited</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    backgroundColor: t.surfaceContainerLow,
    borderWidth: 2,
    borderColor: t.onSurface,
    overflow: 'hidden',
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleText: {
    fontFamily: FontFamilies.label,
    fontSize: 11,
    fontWeight: '700',
    color: t.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 14,
    height: 14,
  },
  unvisitedDot: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: t.outlineVariant,
  },
  label: {
    fontFamily: FontFamilies.body,
    fontSize: 11,
    fontWeight: '500',
    color: t.onSurfaceVariant,
  },
});
