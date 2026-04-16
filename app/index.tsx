import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { MilestoneCard } from '@/components/MilestoneCard';
import { ProgressRing } from '@/components/ProgressRing';
import { RegionCard } from '@/components/RegionCard';
import { getRegionProgress } from '@/constants/countries';
import { DesignTokens } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';
import { useVisitedStatesContext } from '@/contexts/visited-states-context';
import { useMilestones } from '@/hooks/use-milestones';

export default function HomeScreen() {
  const router = useRouter();
  const { country } = useCountry();
  const { visitedStates, entries } = useVisitedStatesContext();
  const milestones = useMilestones(visitedStates);
  const totalStates = country.subdivisions.length;
  const recentEntries = [...entries].reverse().slice(0, 5);
  const regionsVisited = country.regions.filter((r) =>
    r.states.some((s) => visitedStates.has(s)),
  ).length;
  const percentage =
    totalStates > 0 ? Math.round((visitedStates.size / totalStates) * 100) : 0;

  const statPills = [
    { icon: 'map-marker' as const, color: DesignTokens.primary, label: `${visitedStates.size} Visited` },
    { icon: 'compass' as const, color: DesignTokens.secondary, label: `${regionsVisited} Regions` },
    { icon: 'chart-line' as const, color: DesignTokens.tertiary, label: `${percentage}% Complete` },
  ];

  const navItems = [
    { icon: 'home' as const, label: 'Archive', route: undefined, active: true },
    { icon: 'map-outline' as const, label: 'Explorer', route: '/map' as const, active: false },
    { icon: 'timeline-text-outline' as const, label: 'Journal', route: '/timeline' as const, active: false },
    { icon: 'cog-outline' as const, label: 'Settings', route: '/settings' as const, active: false },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
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
                  ? `${percentage}% of ${country.name} explored.`
                  : `Start exploring ${country.name}.`}
              </Text>
              <View style={styles.pillRow}>
                {statPills.map((pill) => (
                  <View key={pill.icon} style={styles.pill}>
                    <MaterialCommunityIcons name={pill.icon} size={14} color={pill.color} />
                    <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
                  </View>
                ))}
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
            {country.regions.map((region, idx) => {
              const { visited, total } = getRegionProgress(region, visitedStates);
              return (
                <RegionCard
                  key={region.name}
                  region={region}
                  visited={visited}
                  total={total}
                  colorIndex={idx}
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

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, item.active && styles.navItemActive]}
            onPress={item.route ? () => router.push(item.route) : undefined}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={item.active ? DesignTokens.primary : DesignTokens.outline}
            />
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
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
  /* Scroll */
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    borderWidth: 4,
    borderColor: DesignTokens.background,
    zIndex: 10,
  },
  timelineDotActive: {
    backgroundColor: DesignTokens.primary,
  },
  timelineDotInactive: {
    backgroundColor: DesignTokens.surfaceDim,
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
