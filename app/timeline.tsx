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

import { BottomNav } from '@/components/BottomNav';
import { getRegionForSubdivision } from '@/constants/countries';
import { type DesignTokensType, FontFamilies, RegionColors } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';
import { useTheme } from '@/contexts/theme-context';
import { useVisitedStatesContext } from '@/contexts/visited-states-context';

type FilterOption = 'All' | string;

export default function TimelineScreen() {
  const router = useRouter();
  const { country } = useCountry();
  const { entries } = useVisitedStatesContext();
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = a.photoDate ?? a.addedAt;
      const dateB = b.photoDate ?? b.addedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [entries]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const regions = country.regions;

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
        <View style={styles.header}>
          <Text style={styles.headerBrand}>STATEDEX</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <MaterialCommunityIcons
              name="map-outline"
              size={40}
              color={tokens.primaryContainer}
            />
          </View>
          <Text style={styles.emptyTitle}>NO TRAVELS LOGGED YET.</Text>
          <Text style={styles.emptySubtitle}>
            Tap the map to start your journey and build your ledger!
          </Text>
          <View style={styles.emptyCtaWrapper}>
            <View style={styles.emptyCtaShadow} />
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push('/map')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyCtaText}>OPEN VOYAGER MAP</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNav activeTab="journal" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Brutalist Header */}
      <View style={styles.header}>
        <Text style={styles.headerBrand}>STATEDEX</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>CHRONICLE OF VOYAGES</Text>
          <Text style={styles.headerTitle}>THE JOURNAL</Text>
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
                  {filter.toUpperCase()}
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
            const borderColor = RegionColors[regionName] ?? tokens.primaryContainer;
            const displayDate = new Date(entry.photoDate ?? entry.addedAt);
            const isLegacy = !entry.photoDate && displayDate.getTime() === 0;
            const isFirst = index === 0;

            return (
              <View key={entry.stateName} style={styles.entryContainer}>
                {/* Node */}
                <View
                  style={[
                    styles.timelineNode,
                    { backgroundColor: isFirst ? tokens.primaryContainer : tokens.surfaceContainerHighest },
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
                          { borderColor: borderColor },
                        ]}
                      >
                        <Text
                          style={[styles.regionBadgeText, { color: borderColor }]}
                        >
                          {regionName}
                        </Text>
                      </View>
                      <Text style={styles.stateName}>{entry.stateName}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={(region?.icon as any) ?? 'map-marker'}
                      size={24}
                      color={tokens.outline}
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
      <BottomNav activeTab="journal" />
    </SafeAreaView>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.background,
  },

  /* Header bar */
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: t.background,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    alignItems: 'center',
  },
  headerBrand: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 22,
    fontWeight: '900',
    color: t.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  /* Header */
  headerSection: {
    marginBottom: 36,
  },
  headerLabel: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: t.primaryContainer,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 36,
    fontWeight: '900',
    color: t.onSurface,
    letterSpacing: -1,
    textTransform: 'uppercase',
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
    borderWidth: 2,
  },
  filterChipActive: {
    backgroundColor: t.primaryContainer,
    borderColor: t.primaryContainer,
  },
  filterChipInactive: {
    backgroundColor: 'transparent',
    borderColor: t.outlineVariant,
  },
  filterChipText: {
    fontFamily: FontFamilies.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  filterChipTextActive: {
    color: t.surfaceContainerLowest,
  },
  filterChipTextInactive: {
    color: t.onSurfaceVariant,
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
    backgroundColor: t.outlineVariant,
  },
  entryContainer: {
    paddingLeft: 36,
    marginBottom: 36,
  },
  timelineNode: {
    position: 'absolute',
    left: 8,
    top: 3,
    width: 18,
    height: 18,
    borderWidth: 4,
    borderColor: t.background,
    zIndex: 10,
  },
  dateRow: {
    marginBottom: 12,
  },
  dateText: {
    fontFamily: FontFamilies.label,
    fontSize: 11,
    fontWeight: '700',
    color: t.outline,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  /* Entry Card */
  entryCard: {
    backgroundColor: t.surfaceContainerLow,
    borderWidth: 2,
    borderColor: t.onSurface,
    padding: 24,
    borderLeftWidth: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  regionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  regionBadgeText: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stateName: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 24,
    fontWeight: '900',
    color: t.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderWidth: 4,
    borderColor: t.onSurface,
    backgroundColor: t.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 20,
    fontWeight: '900',
    color: t.onSurface,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  emptySubtitle: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    color: t.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCtaWrapper: {
    position: 'relative',
    marginTop: 32,
  },
  emptyCtaShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: t.secondary,
  },
  emptyCta: {
    backgroundColor: t.primaryContainer,
    borderWidth: 2,
    borderColor: t.onSurface,
    paddingHorizontal: 32,
    paddingVertical: 16,
    position: 'relative',
    zIndex: 1,
  },
  emptyCtaText: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 14,
    fontWeight: '700',
    color: t.surfaceContainerLowest,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
