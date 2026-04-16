import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRegionForSubdivision } from '@/constants/countries';
import { DesignTokens } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';
import { useVisitedStatesContext } from '@/contexts/visited-states-context';

interface RegionTheme {
  border: string;
  badgeBg: string;
  badgeText: string;
}

const REGION_THEMES: RegionTheme[] = [
  { border: '#f59e0b', badgeBg: '#fef3c7', badgeText: '#92400e' },
  { border: DesignTokens.tertiaryContainer, badgeBg: DesignTokens.onTertiary, badgeText: DesignTokens.tertiaryDim },
  { border: '#10b981', badgeBg: '#dcfce7', badgeText: '#065f46' },
  { border: DesignTokens.primaryContainer, badgeBg: DesignTokens.surfaceContainerLow, badgeText: DesignTokens.primaryDim },
  { border: '#8b5cf6', badgeBg: '#ede9fe', badgeText: '#5b21b6' },
  { border: '#ec4899', badgeBg: '#fce7f3', badgeText: '#9d174d' },
  { border: '#06b6d4', badgeBg: '#cffafe', badgeText: '#155e75' },
  { border: '#f97316', badgeBg: '#fff7ed', badgeText: '#9a3412' },
];

type FilterOption = 'All States' | string;

export default function TimelineScreen() {
  const router = useRouter();
  const { country } = useCountry();
  const { entries } = useVisitedStatesContext();
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = a.photoDate ?? a.addedAt;
      const dateB = b.photoDate ?? b.addedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [entries]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const regions = country.regions;

  // Build region index map for theming
  const regionIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    regions.forEach((r, i) => { map[r.name] = i; });
    return map;
  }, [regions]);

  const filters = useMemo(() => {
    const regionSet = new Set<string>();
    for (const entry of entries) {
      const region = getRegionForSubdivision(entry.stateName, regions);
      if (region) regionSet.add(region.name);
    }
    return ['All', ...Array.from(regionSet)];
  }, [entries, regions]);

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'All') return sortedEntries;
    return sortedEntries.filter((entry) => {
      const region = getRegionForSubdivision(entry.stateName, regions);
      return region?.name === activeFilter;
    });
  }, [sortedEntries, activeFilter, regions]);

  if (sortedEntries.length === 0) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
          <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons
              name="map-outline"
              size={40}
              color={DesignTokens.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>No travels logged yet.</Text>
          <Text style={styles.emptySubtitle}>
            Tap the map to start your journey and build your ledger!
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => router.push('/map')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyCtaText}>Open Voyager Map</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Nav */}
        <BottomNav router={router} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>Chronicle of Voyages</Text>
          <Text style={styles.headerTitle}>The Journal</Text>
          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  activeFilter === filter
                    ? styles.filterChipActive
                    : styles.filterChipInactive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === filter
                      ? styles.filterChipTextActive
                      : styles.filterChipTextInactive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {/* Vertical Track */}
          <View style={styles.timelineTrack} />

          {filteredEntries.map((entry, index) => {
            const region = getRegionForSubdivision(entry.stateName, regions);
            const regionName = region?.name ?? 'Unknown';
            const rIdx = regionIndexMap[regionName] ?? 0;
            const theme = REGION_THEMES[rIdx % REGION_THEMES.length];
            const borderColor = theme.border;
            const badgeBg = theme.badgeBg;
            const badgeText = theme.badgeText;
            const regionIcon = region?.icon ?? 'map-marker';
            const displayDate = new Date(entry.photoDate ?? entry.addedAt);
            const isLegacy = !entry.photoDate && displayDate.getTime() === 0;
            const isFirst = index === 0;

            return (
              <View key={entry.stateName} style={styles.entryContainer}>
                {/* Node */}
                <View
                  style={[
                    styles.timelineNode,
                    isFirst
                      ? styles.timelineNodeActive
                      : styles.timelineNodeInactive,
                  ]}
                />
                {/* Date */}
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>
                    {isLegacy
                      ? ''
                      : displayDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).toUpperCase()}
                  </Text>
                </View>
                {/* Card */}
                <View
                  style={[styles.entryCard, { borderLeftColor: borderColor }]}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <View
                        style={[
                          styles.regionBadge,
                          { backgroundColor: badgeBg },
                        ]}
                      >
                        <Text
                          style={[styles.regionBadgeText, { color: badgeText }]}
                        >
                          {regionName}
                        </Text>
                      </View>
                      <Text style={styles.stateName}>{entry.stateName}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={regionIcon as any}
                      size={24}
                      color={DesignTokens.surfaceDim}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav router={router} />
    </SafeAreaView>
  );
}

function BottomNav({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/')}
      >
        <MaterialCommunityIcons
          name="home-outline"
          size={24}
          color={DesignTokens.outline}
        />
        <Text style={styles.navLabel}>Archive</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/map')}
      >
        <MaterialCommunityIcons
          name="map-outline"
          size={24}
          color={DesignTokens.outline}
        />
        <Text style={styles.navLabel}>Explorer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
        <MaterialCommunityIcons
          name="timeline-text"
          size={24}
          color={DesignTokens.primary}
        />
        <Text style={[styles.navLabel, styles.navLabelActive]}>Journal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/settings')}
      >
        <MaterialCommunityIcons
          name="cog-outline"
          size={24}
          color={DesignTokens.outline}
        />
        <Text style={styles.navLabel}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DesignTokens.background,
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  /* Header */
  headerSection: {
    marginBottom: 36,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: DesignTokens.primary,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: DesignTokens.onSurface,
    letterSpacing: -1,
  },
  /* Filters */
  filterScroll: {
    marginTop: 16,
  },
  filterRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: DesignTokens.primary,
  },
  filterChipInactive: {
    backgroundColor: DesignTokens.surfaceContainerLow,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: DesignTokens.onPrimary,
  },
  filterChipTextInactive: {
    color: DesignTokens.onSurfaceVariant,
  },
  /* Timeline */
  timeline: {
    position: 'relative',
    paddingLeft: 16,
  },
  timelineTrack: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: DesignTokens.outlineVariant + '33',
  },
  entryContainer: {
    paddingLeft: 36,
    marginBottom: 36,
  },
  timelineNode: {
    position: 'absolute',
    left: 11,
    top: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 10,
  },
  timelineNodeActive: {
    backgroundColor: DesignTokens.primary,
    borderWidth: 4,
    borderColor: DesignTokens.background,
    width: 18,
    height: 18,
    borderRadius: 9,
    left: 8,
    top: 3,
  },
  timelineNodeInactive: {
    backgroundColor: DesignTokens.surfaceDim,
    borderWidth: 4,
    borderColor: DesignTokens.background,
    width: 18,
    height: 18,
    borderRadius: 9,
    left: 8,
    top: 3,
  },
  dateRow: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: DesignTokens.outline,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  /* Entry Card */
  entryCard: {
    backgroundColor: DesignTokens.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    borderLeftWidth: 8,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  regionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  regionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stateName: {
    fontSize: 24,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DesignTokens.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignTokens.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: DesignTokens.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCta: {
    marginTop: 32,
    backgroundColor: DesignTokens.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: DesignTokens.onPrimary,
    letterSpacing: 0.5,
  },
  /* Bottom Nav */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: DesignTokens.surfaceContainerLow,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    color: DesignTokens.outline,
  },
  navLabelActive: {
    color: DesignTokens.primary,
  },
});
