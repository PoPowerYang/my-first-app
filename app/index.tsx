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

import { MilestoneCard } from '@/components/MilestoneCard';
import { ProgressRing } from '@/components/ProgressRing';
import { RegionCard } from '@/components/RegionCard';
import { US_REGIONS, getRegionProgress } from '@/constants/regions';
import { CommonStyles } from '@/constants/theme';
import { useMilestones } from '@/hooks/use-milestones';
import { useVisitedStates } from '@/hooks/use-visited-states';

import statesData from '@/assets/us-states.json';

export default function HomeScreen() {
  const router = useRouter();
  const { visitedStates, entries } = useVisitedStates();
  const milestones = useMilestones(visitedStates);
  const totalStates = statesData.features.length;
  const recentEntries = [...entries].reverse().slice(0, 5);

  return (
    <ScrollView
      style={CommonStyles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.header}>Your Journey</Text>
      <Text style={styles.subtitle}>Track every state you explore</Text>

      {/* Progress Ring */}
      <View style={styles.ringContainer}>
        <ProgressRing current={visitedStates.size} total={totalStates} />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{visitedStates.size}</Text>
          <Text style={styles.statLabel}>States</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>
            {US_REGIONS.filter((r) => r.states.some((s) => visitedStates.has(s))).length}
          </Text>
          <Text style={styles.statLabel}>Regions</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>
            {totalStates > 0 ? Math.round((visitedStates.size / totalStates) * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {/* Milestones */}
      <Text style={styles.sectionTitle}>Milestones</Text>
      <FlatList
        data={milestones}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MilestoneCard milestone={item} />}
        contentContainerStyle={styles.milestoneList}
        scrollEnabled
      />

      {/* Regions */}
      <Text style={styles.sectionTitle}>Regions</Text>
      <View style={styles.regionGrid}>
        {US_REGIONS.map((region) => {
          const { visited, total } = getRegionProgress(region, visitedStates);
          return (
            <RegionCard
              key={region.name}
              region={region}
              visited={visited}
              total={total}
              onPress={() => router.push({ pathname: '/map', params: { region: region.name } })}
            />
          );
        })}
      </View>

      {/* Recent Activity */}
      {recentEntries.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/timeline' as any)}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentEntries.map((entry, i) => {
              const addedDate = new Date(entry.addedAt);
              const isLegacy = addedDate.getTime() === 0;
              return (
                <View key={entry.stateName + i} style={styles.activityRow}>
                  <View style={styles.activityDot} />
                  <Text style={styles.activityState}>{entry.stateName}</Text>
                  <Text style={styles.activityDate}>
                    {isLegacy ? '' : formatRelativeDate(addedDate)}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Explore Map CTA */}
      <TouchableOpacity
        style={styles.mapCta}
        onPress={() => router.push('/map')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="map-legend" size={32} color="#fff" style={styles.ctaIcon} />
        <View style={styles.mapCtaTextContainer}>
          <Text style={styles.mapCtaTitle}>Explore Live Map</Text>
          <Text style={styles.mapCtaSubtitle}>Upload photos to mark states ➔</Text>
        </View>
      </TouchableOpacity>

      {/* Timeline CTA */}
      {entries.length > 0 && (
        <TouchableOpacity
          style={styles.timelineCta}
          onPress={() => router.push('/timeline' as any)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#0a7ea4" style={styles.ctaIcon} />
          <View style={styles.mapCtaTextContainer}>
            <Text style={styles.timelineCtaTitle}>View Timeline</Text>
            <Text style={styles.timelineCtaSubtitle}>Your journey so far ➔</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
    marginBottom: 20,
  },
  ringContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  statPill: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0a7ea4',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  milestoneList: {
    paddingBottom: 4,
    marginBottom: 24,
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    marginRight: 10,
  },
  activityState: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#aaa',
  },
  mapCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  ctaIcon: {
    marginRight: 14,
  },
  mapCtaTextContainer: {
    flex: 1,
  },
  mapCtaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  mapCtaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  timelineCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#0a7ea4',
  },
  timelineCtaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a7ea4',
  },
  timelineCtaSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
