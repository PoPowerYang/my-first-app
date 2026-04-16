import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getRegionForState } from '@/constants/regions';
import { CommonStyles, RegionColors } from '@/constants/theme';
import { useVisitedStates } from '@/hooks/use-visited-states';

export default function TimelineScreen() {
  const { entries } = useVisitedStates();
  const sortedEntries = [...entries].reverse();

  if (sortedEntries.length === 0) {
    return (
      <View style={[CommonStyles.container, CommonStyles.center]}>
        <MaterialCommunityIcons name="map-marker-off" size={56} color="#ccc" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>No states yet</Text>
        <Text style={styles.emptySubtitle}>
          Upload photos on the map to start tracking your journey!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={CommonStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Your Timeline</Text>
      <Text style={styles.subtitle}>{sortedEntries.length} states visited</Text>

      <View style={styles.timeline}>
        {sortedEntries.map((entry, index) => {
          const region = getRegionForState(entry.stateName);
          const color = region ? RegionColors[region.name] : '#0a7ea4';
          const addedDate = new Date(entry.addedAt);
          const isLegacy = addedDate.getTime() === 0;
          const isLast = index === sortedEntries.length - 1;

          return (
            <View key={entry.stateName} style={styles.entryRow}>
              {/* Timeline line */}
              <View style={styles.lineColumn}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                {!isLast && <View style={styles.line} />}
              </View>

              {/* Content */}
              <View style={styles.entryContent}>
                <Text style={styles.stateName}>{entry.stateName}</Text>
                <View style={styles.entryMeta}>
                  {region && (
                    <Text style={[styles.regionTag, { color, backgroundColor: color + '18' }]}>
                      <MaterialCommunityIcons name={region.icon as any} size={11} /> {region.name}
                    </Text>
                  )}
                  {!isLegacy && (
                    <Text style={styles.dateText}>
                      {addedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    marginBottom: 24,
  },
  timeline: {
    paddingLeft: 4,
  },
  entryRow: {
    flexDirection: 'row',
    minHeight: 70,
  },
  lineColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 2,
    marginBottom: 2,
  },
  entryContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  stateName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionTag: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 12,
    color: '#aaa',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
