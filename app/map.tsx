import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Geojson, type Region } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SafeAreaView } from 'react-native-safe-area-context';

import statesData from '@/assets/us-states.json';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';
import { MapLegend } from '@/components/MapLegend';
import { MilestoneUnlockModal } from '@/components/MilestoneUnlockModal';
import { US_REGIONS, getRegionProgress } from '@/constants/regions';
import { DesignTokens, RegionColors } from '@/constants/theme';
import { useVisitedStatesContext } from '@/contexts/visited-states-context';
import { getNewlyUnlockedMilestones, useMilestones } from '@/hooks/use-milestones';
import { extractGpsFromExif, reverseGeocodeToState } from '@/utils/image-geo-extractor';
import { fourColorAlgorithm } from '@/utils/map-coloring';

const INITIAL_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 50.0,
  longitudeDelta: 50.0,
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.25;

const UNVISITED_FILL = 'rgba(180, 180, 190, 0.15)';
const UNVISITED_STROKE = 'rgba(150, 150, 160, 0.4)';

export default function MapScreen() {
  const router = useRouter();
  const { visitedStates, entries, isLoading, addState, clearStates } = useVisitedStatesContext();
  const [processing, setProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState<{
    id: string;
    title: string;
    icon: string;
    description: string;
  } | null>(null);
  const regionRef = useRef<Region>(INITIAL_REGION);
  const mapRef = useRef<MapView>(null);
  const lastExplorerTapRef = useRef<number>(0);
  const params = useLocalSearchParams<{ region?: string }>();
  const milestones = useMilestones(visitedStates);

  // Badge count animation
  const badgeScale = useSharedValue(1);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  // Navigate to region if specified in params
  useEffect(() => {
    if (params.region && mapRef.current) {
      const region = US_REGIONS.find((r) => r.name === params.region);
      if (region) {
        setTimeout(() => {
          mapRef.current?.animateToRegion(region.mapRegion, 800);
        }, 500);
      }
    }
  }, [params.region]);

  const statesGeoJsonElements = useMemo(() => {
    const fullColorMap = fourColorAlgorithm(statesData.features);

    return statesData.features.map((feature: any, index: number) => {
      const stateName = feature.properties?.NAME;
      const isVisited = stateName ? visitedStates.has(stateName) : false;
      const fillColor = isVisited ? fullColorMap[stateName] : UNVISITED_FILL;
      const strokeColor = isVisited ? 'rgba(0, 0, 0, 0.6)' : UNVISITED_STROKE;

      const featureCollection = {
        type: 'FeatureCollection',
        features: [feature],
      };

      return (
        <Geojson
          key={feature.id || index}
          // @ts-expect-error — same GeoJSON typing mismatch
          geojson={featureCollection}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={isVisited ? 1.5 : 0.8}
        />
      );
    });
  }, [visitedStates]);

  const handlePickImage = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        exif: true,
        allowsMultipleSelection: false,
      });

      if (result.canceled || result.assets.length === 0) return;

      setProcessing(true);
      const asset = result.assets[0];

      const gps = extractGpsFromExif(asset.exif);

      if (!gps) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('No Location Data', 'This image does not contain GPS information.');
        setProcessing(false);
        return;
      }

      const stateName = await reverseGeocodeToState(gps);

      if (!stateName) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Not in the US', 'This image was not taken in a US state.');
        setProcessing(false);
        return;
      }

      if (visitedStates.has(stateName)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Already Visited', `${stateName} is already on your map!`);
      } else {
        // Check which milestones will unlock
        const prevCount = visitedStates.size;
        const prevVisited = new Set(visitedStates);
        const newVisited = new Set(visitedStates);
        newVisited.add(stateName);

        addState(stateName);

        // Celebration! 🎉
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        badgeScale.value = withSpring(1.3, { damping: 8 }, () => {
          badgeScale.value = withSpring(1, { damping: 12 });
        });

        // Check for new milestones
        const newMilestones = getNewlyUnlockedMilestones(
          prevCount,
          prevCount + 1,
          prevVisited,
          newVisited,
        );

        if (newMilestones.length > 0) {
          const unlockedId = newMilestones[0];
          const milestone = milestones.find((m) => m.id === unlockedId) ??
            // The milestone may not yet reflect the new state in the memo,
            // so fall back to a simple lookup
            getMilestoneInfo(unlockedId);
          if (milestone) {
            setTimeout(() => {
              setMilestoneModal({
                id: milestone.id,
                title: milestone.title,
                icon: milestone.icon,
                description: milestone.description,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 1500);
          }
        }

        Alert.alert('State Added!', `${stateName} has been added to your visited states.`);
      }
    } catch (err) {
      console.warn('Image pick error:', err);
      Alert.alert('Error', 'Something went wrong while processing the image.');
    } finally {
      setProcessing(false);
    }
  }, [visitedStates, addState, milestones, badgeScale]);

  const handleRegionZoom = useCallback((regionName: string) => {
    const region = US_REGIONS.find((r) => r.name === regionName);
    if (region && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion(region.mapRegion, 600);
    }
  }, []);

  const totalStates = statesData.features.length;
  const percentage = totalStates > 0 ? Math.round((visitedStates.size / totalStates) * 100) : 0;

  const recentEntries = [...(entries ?? [])].reverse().slice(0, 4);

  const navItems = [
    { icon: 'home-outline' as const, label: 'Archive', route: '/' as const, active: false },
    { icon: 'map' as const, label: 'Explorer', route: undefined, active: true },
    { icon: 'timeline-text-outline' as const, label: 'Journal', route: '/timeline' as const, active: false },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignTokens.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Explorer Header & Controls */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.headerLabel}>Explorer Mode</Text>
            <Text style={styles.headerTitle}>The United States</Text>
          </View>
          <View style={styles.headerControls}>
            <View style={styles.regionChips}>
              {US_REGIONS.map((r) => (
                <TouchableOpacity
                  key={r.shortName}
                  style={styles.regionChip}
                  onPress={() => handleRegionZoom(r.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.regionChipText}>{r.shortName}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {visitedStates.size > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() =>
                  Alert.alert('Clear All', 'Remove all visited states?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearStates },
                  ])
                }
              >
                <MaterialCommunityIcons name="restart" size={14} color={DesignTokens.onSurfaceVariant} />
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Map Container (25% height) */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            key={`map-${visitedStates.size}`}
            style={styles.map}
            initialRegion={regionRef.current}
            onRegionChangeComplete={(region) => {
              regionRef.current = region;
            }}
          >
            {statesGeoJsonElements}
          </MapView>

          {/* Floating Stats Badge */}
          <Animated.View style={[styles.statsBadge, badgeStyle]}>
            <View style={styles.statsBadgeRing}>
              <Text style={styles.statsBadgeCount}>{visitedStates.size}</Text>
            </View>
            <View>
              <Text style={styles.statsBadgeLabel}>States Visited</Text>
              <Text style={styles.statsBadgeValue}>
                {visitedStates.size} / {totalStates}{' '}
                <Text style={styles.statsBadgePercent}>({percentage}%)</Text>
              </Text>
            </View>
          </Animated.View>

          {/* Map Legend */}
          <MapLegend />
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {/* Recent Expeditions */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Expeditions</Text>
              <TouchableOpacity
                style={styles.viewJournalButton}
                onPress={() => router.push('/timeline' as any)}
              >
                <Text style={styles.viewJournalText}>View Journal</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={DesignTokens.primary} />
              </TouchableOpacity>
            </View>
            {recentEntries.length > 0 ? (
              <View style={styles.expeditionCards}>
                {recentEntries.map((entry, i) => {
                  const addedDate = new Date(entry.addedAt);
                  const isLegacy = addedDate.getTime() === 0;
                  const regionName = US_REGIONS.find((r) => r.states.includes(entry.stateName))?.name;
                  const regionColor = regionName ? RegionColors[regionName] : DesignTokens.primary;
                  return (
                    <View key={entry.stateName + i} style={styles.expeditionCard}>
                      <View style={[styles.expeditionIcon, { backgroundColor: regionColor + '20' }]}>
                        <MaterialCommunityIcons
                          name="map-marker-check"
                          size={22}
                          color={regionColor}
                        />
                      </View>
                      <View style={styles.expeditionInfo}>
                        <Text style={styles.expeditionState}>{entry.stateName}</Text>
                        <Text style={styles.expeditionMeta}>
                          {isLegacy ? 'Legacy entry' : formatRelativeDate(addedDate)}
                          {regionName ? ` • ${regionName}` : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyExpeditions}>
                <MaterialCommunityIcons name="compass-off-outline" size={32} color={DesignTokens.outlineVariant} />
                <Text style={styles.emptyText}>No expeditions yet</Text>
                <Text style={styles.emptySubtext}>Upload a geotagged photo to get started</Text>
              </View>
            )}
          </View>

          {/* Regional Focus */}
          <View style={styles.regionalSection}>
            <Text style={styles.sectionTitle}>Regional Focus</Text>
            <View style={styles.regionalBars}>
              {US_REGIONS.map((region) => {
                const { visited, total } = getRegionProgress(region, visitedStates);
                const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
                const regionColor = RegionColors[region.name] ?? DesignTokens.primary;
                return (
                  <View key={region.name} style={styles.regionalItem}>
                    <View style={styles.regionalLabelRow}>
                      <Text style={styles.regionalLabel}>{region.name}</Text>
                      <Text style={styles.regionalPercent}>{pct}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${pct}%`, backgroundColor: pct > 0 ? regionColor : DesignTokens.outlineVariant + '30' },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>Explore Unvisited</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, processing && styles.fabDisabled]}
        onPress={handlePickImage}
        disabled={processing}
        activeOpacity={0.8}
      >
        {processing ? (
          <ActivityIndicator color={DesignTokens.onPrimary} />
        ) : (
          <MaterialCommunityIcons name="camera" size={28} color={DesignTokens.onPrimary} />
        )}
      </TouchableOpacity>

      {/* Confetti */}
      <ConfettiOverlay
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Milestone Unlock Modal */}
      <MilestoneUnlockModal
        milestoneId={milestoneModal?.id ?? null}
        title={milestoneModal?.title ?? ''}
        icon={milestoneModal?.icon ?? ''}
        description={milestoneModal?.description ?? ''}
        onDismiss={() => setMilestoneModal(null)}
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, item.active && styles.navItemActive]}
            onPress={
              item.active
                ? () => {
                    const now = Date.now();
                    if (now - lastExplorerTapRef.current < 400) {
                      mapRef.current?.animateToRegion(INITIAL_REGION, 600);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    lastExplorerTapRef.current = now;
                  }
                : item.route
                  ? () => router.push(item.route!)
                  : undefined
            }
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

function getMilestoneInfo(id: string) {
  const map: Record<string, { id: string; title: string; icon: string; description: string }> = {
    'first-step': { id: 'first-step', title: 'First Step', icon: 'sprout', description: 'Visit your first state' },
    'explorer': { id: 'explorer', title: 'Explorer', icon: 'map-search', description: 'Visit 10 states' },
    'all-regions': { id: 'all-regions', title: 'Four Corners', icon: 'compass-rose', description: 'Visit a state in every region' },
    'halfway': { id: 'halfway', title: 'Halfway There', icon: 'star-four-points', description: 'Visit 26 states' },
    'coast-to-coast': { id: 'coast-to-coast', title: 'Coast to Coast', icon: 'waves', description: 'Visit states on both coasts' },
    'all-51': { id: 'all-51', title: 'All 51', icon: 'crown', description: 'Visit every state & DC' },
  };
  return map[id] ?? null;
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Scroll */
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 24,
  },
  /* Header Section */
  headerSection: {
    gap: 12,
    paddingHorizontal: 8,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: DesignTokens.primary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: DesignTokens.onSurface,
    letterSpacing: -0.5,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  regionChips: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  regionChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: DesignTokens.onSurface,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearAllText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: DesignTokens.onSurfaceVariant,
  },
  /* Map Container */
  mapContainer: {
    height: MAP_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: DesignTokens.surfaceContainerLowest,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 48,
    elevation: 6,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  /* Stats Badge */
  statsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsBadgeRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: DesignTokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBadgeCount: {
    fontSize: 12,
    fontWeight: '800',
    color: DesignTokens.primary,
  },
  statsBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: DesignTokens.onSurfaceVariant,
  },
  statsBadgeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  statsBadgePercent: {
    fontSize: 10,
    fontWeight: '500',
    color: DesignTokens.outline,
  },
  /* Details Grid */
  detailsGrid: {
    gap: 16,
  },
  /* Recent Expeditions */
  recentSection: {
    backgroundColor: DesignTokens.surfaceContainerLow,
    borderRadius: 28,
    padding: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  viewJournalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewJournalText: {
    fontSize: 13,
    fontWeight: '700',
    color: DesignTokens.primary,
  },
  expeditionCards: {
    gap: 12,
  },
  expeditionCard: {
    backgroundColor: DesignTokens.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  expeditionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expeditionInfo: {
    flex: 1,
  },
  expeditionState: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  expeditionMeta: {
    fontSize: 11,
    color: DesignTokens.onSurfaceVariant,
    marginTop: 2,
  },
  emptyExpeditions: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: DesignTokens.onSurfaceVariant,
  },
  emptySubtext: {
    fontSize: 12,
    color: DesignTokens.outline,
  },
  /* Regional Focus */
  regionalSection: {
    backgroundColor: DesignTokens.surfaceContainerHighest + '30',
    borderRadius: 28,
    padding: 24,
  },
  regionalBars: {
    gap: 20,
    marginTop: 20,
  },
  regionalItem: {
    gap: 6,
  },
  regionalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  regionalLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: DesignTokens.onSurfaceVariant,
  },
  regionalPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: DesignTokens.onSurface,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: DesignTokens.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: DesignTokens.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: DesignTokens.onPrimary,
  },
  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: DesignTokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 40,
  },
  fabDisabled: {
    backgroundColor: DesignTokens.outline,
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
