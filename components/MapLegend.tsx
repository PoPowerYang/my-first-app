import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { hslToHexAlpha } from '@/utils/map-coloring';

const LEGEND_COLORS = [
  { label: 'Coral Red', color: hslToHexAlpha(350, 80, 60) },
  { label: 'Warm Yellow', color: hslToHexAlpha(45, 85, 55) },
  { label: 'Mint Green', color: hslToHexAlpha(160, 70, 45) },
  { label: 'Sky Blue', color: hslToHexAlpha(220, 85, 60) },
];

export function MapLegend() {
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  unvisitedDot: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(150, 150, 150, 0.5)',
    borderStyle: 'dashed',
  },
  label: {
    fontSize: 11,
    color: '#555',
  },
});
