import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { USRegion } from '@/constants/regions';
import { RegionColors } from '@/constants/theme';

interface RegionCardProps {
  region: USRegion;
  visited: number;
  total: number;
  onPress: () => void;
}

export function RegionCard({ region, visited, total, onPress }: RegionCardProps) {
  const color = RegionColors[region.name] ?? '#999';
  const progress = total > 0 ? visited / total : 0;
  const isComplete = visited === total;

  return (
    <TouchableOpacity
      style={[styles.card, isComplete && { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name={region.icon as any} size={16} color={color} />
        <Text style={styles.name}>{region.name}</Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>

      <Text style={[styles.count, { color }]}>
        {visited}/{total}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    flexShrink: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  count: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
});
