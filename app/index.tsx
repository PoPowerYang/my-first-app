import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { MilestoneCard } from '@/components/MilestoneCard';
import { ProgressRing } from '@/components/ProgressRing';
import { RegionCard } from '@/components/RegionCard';
import { getRegionProgress } from '@/constants/countries';
import { type DesignTokensType, FontFamilies } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';
import { useTheme } from '@/contexts/theme-context';
import { useVisitedStatesContext } from '@/contexts/visited-states-context';
import { useMilestones } from '@/hooks/use-milestones';

export default function HomeScreen() {
  const router = useRouter();
  const { country } = useCountry();
  const { visitedStates, entries } = useVisitedStatesContext();
  const milestones = useMilestones(visitedStates);
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const totalStates = country.subdivisions.length;
  const recentEntries = [...entries].reverse().slice(0, 5);
  const regionsVisited = country.regions.filter((r) =>
    r.states.some((s) => visitedStates.has(s)),
  ).length;
  const percentage =
    totalStates > 0 ? Math.round((visitedStates.size / totalStates) * 100) : 0;

  const statPills = [
    { icon: 'map-marker' as const, color: tokens.primaryContainer, label: `${visitedStates.size} Visited` },
    { icon: 'compass' as const, color: tokens.secondary, label: `${regionsVisited} Regions` },
    { icon: 'chart-line' as const, color: tokens.tertiaryContainer, label: `${percentage}% Complete` },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Brutalist Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>STATEDEX</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Progress Ring & Quick Stats */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroShadow} />
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <ProgressRing current={visitedStates.size} total={totalStates} />
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>YOUR VOYAGE CONTINUES</Text>
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
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <View style={styles.sectionTitleShadow} />
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitleText}>MILESTONES</Text>
              </View>
            </View>
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
          <View style={styles.sectionTitleWrapper}>
            <View style={styles.sectionTitleShadow} />
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitleText}>REGIONAL PROGRESS</Text>
            </View>
          </View>
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
            <View style={styles.sectionTitleWrapper}>
              <View style={styles.sectionTitleShadow} />
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitleText}>RECENT LOGS</Text>
              </View>
            </View>
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
                              !isFirst && { color: tokens.onSurfaceVariant },
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
                                  ? { color: tokens.primaryContainer }
                                  : { color: tokens.onSurfaceVariant },
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
      <BottomNav activeTab="archive" />
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

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.background,
  },
  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: t.background,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    alignItems: 'center',
  },
  headerTitle: {
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
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 48,
  },
  /* Hero */
  heroWrapper: {
    position: 'relative',
  },
  heroShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: t.primaryContainer,
  },
  heroCard: {
    backgroundColor: t.surfaceContainerLow,
    borderWidth: 4,
    borderColor: t.onSurface,
    padding: 32,
    position: 'relative',
    zIndex: 1,
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
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 22,
    fontWeight: '900',
    color: t.onSurface,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    fontWeight: '500',
    color: t.onSurfaceVariant,
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
    backgroundColor: t.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: t.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: FontFamilies.label,
    fontSize: 12,
    fontWeight: '700',
  },
  /* Section */
  section: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  sectionTitleWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  sectionTitleShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: t.secondary,
  },
  sectionTitleBox: {
    backgroundColor: t.background,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    position: 'relative',
    zIndex: 1,
  },
  sectionTitleText: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 20,
    fontWeight: '900',
    color: t.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
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
    backgroundColor: t.outlineVariant,
  },
  timelineEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timelineDot: {
    width: 18,
    height: 18,
    marginLeft: -9,
    borderWidth: 4,
    borderColor: t.background,
    zIndex: 10,
  },
  timelineDotActive: {
    backgroundColor: t.primaryContainer,
  },
  timelineDotInactive: {
    backgroundColor: t.surfaceContainerHighest,
  },
  timelineCard: {
    flex: 1,
    marginLeft: 20,
    borderWidth: 2,
    borderColor: t.outlineVariant,
    padding: 16,
  },
  timelineCardActive: {
    backgroundColor: t.surfaceContainerLow,
    borderLeftWidth: 4,
    borderLeftColor: t.primaryContainer,
  },
  timelineCardInactive: {
    backgroundColor: t.surfaceContainer,
  },
  timelineCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineState: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 15,
    fontWeight: '700',
    color: t.onSurface,
    textTransform: 'uppercase',
  },
  timeBadge: {
    borderWidth: 1,
    borderColor: t.outlineVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeBadgeActive: {
    borderColor: t.primaryContainer,
  },
  timeBadgeInactive: {
    borderColor: t.outlineVariant,
  },
  timeBadgeText: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
