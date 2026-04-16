import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { USRegion } from '@/constants/regions';
import { DesignTokens, RegionColors } from '@/constants/theme';

interface RegionCardProps {
  region: USRegion;
  visited: number;
  total: number;
  onPress: () => void;
}

export function RegionCard({ region, visited, total, onPress }: RegionCardProps) {
  const color = RegionColors[region.name] ?? DesignTokens.outline;
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DesignTokens.surfaceContainerLowest,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: DesignTokens.outlineVariant + '1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 20,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignTokens.onSurfaceVariant,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: DesignTokens.surfaceVariant,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  count: {
    fontSize: 12,
    fontWeight: '900',
  },
});
