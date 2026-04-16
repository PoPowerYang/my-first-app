import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MilestoneCard } from '@/components/MilestoneCard';
import { ProgressRing } from '@/components/ProgressRing';
import { RegionCard } from '@/components/RegionCard';
import { US_REGIONS, getRegionProgress } from '@/constants/regions';
import { DesignTokens } from '@/constants/theme';
import { useMilestones } from '@/hooks/use-milestones';
import { useVisitedStates } from '@/hooks/use-visited-states';

import statesData from '@/assets/us-states.json';

export default function HomeScreen() {
  const router = useRouter();
  const { visitedStates, entries } = useVisitedStates();
  const milestones = useMilestones(visitedStates);
  const totalStates = statesData.features.length;
  const recentEntries = [...entries].reverse().slice(0, 5);
  const regionsVisited = US_REGIONS.filter((r) =>
    r.states.some((s) => visitedStates.has(s)),
  ).length;
  const percentage =
    totalStates > 0 ? Math.round((visitedStates.size / totalStates) * 100) : 0;

  return (
    <View style={styles.root}>
      {/* Top App Bar */}
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
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Progress Ring & Quick Stats */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <ProgressRing current={visitedStates.size} total={totalStates} />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Your Voyage Continues</Text>
              <Text style={styles.heroSubtitle}>
                {percentage > 0
                  ? `Over ${percentage >= 20 ? 'a fifth' : `${percentage}%`} of the union explored.`
                  : 'Start exploring the United States.'}
              </Text>
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={DesignTokens.primary}
                  />
                  <Text style={[styles.pillText, { color: DesignTokens.primary }]}>
                    {visitedStates.size} Visited
                  </Text>
                </View>
                <View style={styles.pill}>
                  <MaterialCommunityIcons
                    name="compass"
                    size={14}
                    color={DesignTokens.secondary}
                  />
                  <Text style={[styles.pillText, { color: DesignTokens.secondary }]}>
                    {regionsVisited} Regions
                  </Text>
                </View>
                <View style={styles.pill}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={14}
                    color={DesignTokens.tertiary}
                  />
                  <Text style={[styles.pillText, { color: DesignTokens.tertiary }]}>
                    {percentage}% Complete
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={milestones}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MilestoneCard milestone={item} />}
            contentContainerStyle={styles.milestoneList}
            scrollEnabled
          />
        </View>

        {/* Regional Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
            Regional Progress
          </Text>
          <View style={styles.regionGrid}>
            {US_REGIONS.map((region) => {
              const { visited, total } = getRegionProgress(region, visitedStates);
              return (
                <RegionCard
                  key={region.name}
                  region={region}
                  visited={visited}
                  total={total}
                  onPress={() =>
                    router.push({ pathname: '/map', params: { region: region.name } })
                  }
                />
              );
            })}
          </View>
        </View>

        {/* Recent Logs */}
        {recentEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
              Recent Logs
            </Text>
            <View style={styles.timeline}>
              <View style={styles.timelineTrack} />
              {recentEntries.map((entry, i) => {
                const addedDate = new Date(entry.addedAt);
                const isLegacy = addedDate.getTime() === 0;
                const isFirst = i === 0;
                return (
                  <View key={entry.stateName + i} style={styles.timelineEntry}>
                    <View
                      style={[
                        styles.timelineDot,
                        isFirst ? styles.timelineDotActive : styles.timelineDotInactive,
                      ]}
                    />
                    <View
                      style={[
                        styles.timelineCard,
                        isFirst ? styles.timelineCardActive : styles.timelineCardInactive,
                      ]}
                    >
                      <View style={styles.timelineCardContent}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.timelineState,
                              !isFirst && { color: DesignTokens.onSurfaceVariant },
                            ]}
                          >
                            {entry.stateName}
                          </Text>
                        </View>
                        {!isLegacy && (
                          <View
                            style={[
                              styles.timeBadge,
                              isFirst ? styles.timeBadgeActive : styles.timeBadgeInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeBadgeText,
                                isFirst
                                  ? { color: DesignTokens.primary }
                                  : { color: DesignTokens.onSurfaceVariant },
                              ]}
                            >
                              {formatRelativeDate(addedDate)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/map')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[DesignTokens.primary, DesignTokens.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MaterialCommunityIcons
            name="map-marker-plus"
            size={28}
            color={DesignTokens.onPrimary}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <MaterialCommunityIcons
            name="home"
            size={24}
            color={DesignTokens.primary}
          />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Archive</Text>
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
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/timeline' as any)}
        >
          <MaterialCommunityIcons
            name="timeline-text-outline"
            size={24}
            color={DesignTokens.outline}
          />
          <Text style={styles.navLabel}>Journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
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
  contentContainer: {
    paddingHorizontal: 24,
    gap: 32,
  },
  /* Hero */
  heroCard: {
    backgroundColor: DesignTokens.surfaceContainerLow,
    borderRadius: 40,
    padding: 32,
  },
  heroContent: {
    alignItems: 'center',
    gap: 28,
  },
  heroText: {
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DesignTokens.onSurface,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: DesignTokens.onSurfaceVariant,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DesignTokens.surfaceContainerLowest,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  /* Section */
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  viewAll: {
    fontSize: 11,
    fontWeight: '700',
    color: DesignTokens.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  milestoneList: {
    paddingBottom: 4,
  },
  /* Region Grid */
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  /* Timeline */
  timeline: {
    paddingLeft: 16,
  },
  timelineTrack: {
    position: 'absolute',
    left: 16,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: DesignTokens.outlineVariant + '33',
  },
  timelineEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    zIndex: 10,
  },
  timelineDotActive: {
    backgroundColor: DesignTokens.primary,
    borderWidth: 4,
    borderColor: DesignTokens.background,
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
  },
  timelineDotInactive: {
    backgroundColor: DesignTokens.surfaceDim,
    borderWidth: 4,
    borderColor: DesignTokens.background,
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
  },
  timelineCard: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 16,
    padding: 16,
  },
  timelineCardActive: {
    backgroundColor: DesignTokens.surfaceContainerLowest,
    borderLeftWidth: 4,
    borderLeftColor: DesignTokens.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineCardInactive: {
    backgroundColor: DesignTokens.surfaceContainerLow,
  },
  timelineCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineState: {
    fontSize: 15,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  timeBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBadgeActive: {
    backgroundColor: DesignTokens.primary + '1a',
  },
  timeBadgeInactive: {
    backgroundColor: DesignTokens.surfaceVariant + '80',
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  /* FAB */
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 110,
    zIndex: 40,
    borderRadius: 16,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
