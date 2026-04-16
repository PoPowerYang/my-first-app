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

import { getRegionForState } from '@/constants/regions';
import { DesignTokens } from '@/constants/theme';
import { useVisitedStates } from '@/hooks/use-visited-states';

const REGION_BORDER_COLORS: Record<string, string> = {
  West: '#f59e0b',
  Northeast: DesignTokens.tertiaryContainer,
  South: '#10b981',
  Midwest: DesignTokens.primaryContainer,
};

const REGION_BADGE_BG: Record<string, string> = {
  West: '#fef3c7',
  Northeast: DesignTokens.onTertiary,
  South: '#dcfce7',
  Midwest: DesignTokens.surfaceContainerLow,
};

const REGION_BADGE_TEXT: Record<string, string> = {
  West: '#92400e',
  Northeast: DesignTokens.tertiaryDim,
  South: '#065f46',
  Midwest: DesignTokens.primaryDim,
};

const REGION_ICONS: Record<string, string> = {
  West: 'image-filter-hdr',
  Northeast: 'office-building',
  South: 'music-note',
  Midwest: 'barley',
};

type FilterOption = 'All States' | string;

export default function TimelineScreen() {
  const router = useRouter();
  const { entries } = useVisitedStates();
  const sortedEntries = [...entries].reverse();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All States');

  const filters = useMemo(() => {
    const regionSet = new Set<string>();
    for (const entry of entries) {
      const region = getRegionForState(entry.stateName);
      if (region) regionSet.add(region.name);
    }
    return ['All States', ...Array.from(regionSet)];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'All States') return sortedEntries;
    return sortedEntries.filter((entry) => {
      const region = getRegionForState(entry.stateName);
      return region?.name === activeFilter;
    });
  }, [sortedEntries, activeFilter]);

  if (sortedEntries.length === 0) {
    return (
      <View style={styles.root}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <View style={styles.appBarLeft}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={22}
              color={DesignTokens.primary}
            />
            <Text style={styles.appBarTitle}>The Cartographic Ledger</Text>
          </View>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={22}
              color={DesignTokens.onSurfaceVariant}
            />
          </View>
        </View>

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
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={22}
            color={DesignTokens.primary}
          />
          <Text style={styles.appBarTitle}>The Cartographic Ledger</Text>
        </View>
        <View style={styles.avatar}>
          <MaterialCommunityIcons
            name="account"
            size={22}
            color={DesignTokens.onSurfaceVariant}
          />
        </View>
      </View>

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
            const region = getRegionForState(entry.stateName);
            const regionName = region?.name ?? 'Unknown';
            const borderColor =
              REGION_BORDER_COLORS[regionName] ?? DesignTokens.outlineVariant;
            const badgeBg =
              REGION_BADGE_BG[regionName] ?? DesignTokens.surfaceContainerLow;
            const badgeText =
              REGION_BADGE_TEXT[regionName] ?? DesignTokens.onSurfaceVariant;
            const regionIcon =
              REGION_ICONS[regionName] ?? 'map-marker';
            const addedDate = new Date(entry.addedAt);
            const isLegacy = addedDate.getTime() === 0;
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
                      : addedDate.toLocaleDateString('en-US', {
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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/map')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="map-marker-plus"
          size={24}
          color={DesignTokens.onPrimary}
        />
      </TouchableOpacity>

      {/* Bottom Nav */}
      <BottomNav router={router} />
    </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DesignTokens.background,
  },
  /* App Bar */
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 96,
    paddingTop: 48,
    backgroundColor: DesignTokens.background + 'cc',
    zIndex: 50,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: DesignTokens.primary,
    letterSpacing: -0.3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
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
  /* FAB */
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: DesignTokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    paddingHorizontal: 20,
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
