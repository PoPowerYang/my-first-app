import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
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
import { BottomNav } from '@/components/BottomNav';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';
import { MapLegend } from '@/components/MapLegend';
import { MilestoneUnlockModal } from '@/components/MilestoneUnlockModal';
import { getRegionForSubdivision, getRegionProgress } from '@/constants/countries';
import { type DesignTokensType, FontFamilies, buildRegionColorMap } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';
import { useTheme } from '@/contexts/theme-context';
import { useVisitedStatesContext } from '@/contexts/visited-states-context';
import { getNewlyUnlockedMilestones, useMilestones } from '@/hooks/use-milestones';
import { extractDateFromExif, extractGpsFromExif, reverseGeocodeToState } from '@/utils/image-geo-extractor';
import { fourColorAlgorithm } from '@/utils/map-coloring';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.22;

const UNVISITED_FILL = 'rgba(180, 180, 190, 0.15)';
const UNVISITED_STROKE = 'rgba(150, 150, 160, 0.4)';

function showWarning(title: string, message: string) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  Alert.alert(title, message);
}

function getRegionInfo(
  stateName: string,
  regions: ReturnType<typeof useCountry>['country']['regions'],
  regionColors: Record<string, string>,
  fallbackColor: string,
): { color: string; name: string | undefined } {
  const regionName = getRegionForSubdivision(stateName, regions)?.name;
  const color = regionName ? (regionColors[regionName] ?? fallbackColor) : fallbackColor;
  return { color, name: regionName };
}

export default function MapScreen() {
  const { country } = useCountry();
  const { visitedStates, entries, isLoading, addState, clearStates } = useVisitedStatesContext();
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
  const [processing, setProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState<{
    id: string;
    title: string;
    icon: string;
    description: string;
  } | null>(null);
  const regionRef = useRef<Region>(country.initialMapRegion);
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams<{ region?: string }>();
  const milestones = useMilestones(visitedStates);

  const regions = country.regions;
  const regionColors = useMemo(() => buildRegionColorMap(regions.map((r) => r.name)), [regions]);

  // Badge count animation
  const badgeScale = useSharedValue(1);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  // Navigate to region if specified in params
  useEffect(() => {
    if (params.region && mapRef.current) {
      const region = regions.find((r) => r.name === params.region);
      if (region) {
        setTimeout(() => {
          mapRef.current?.animateToRegion(region.mapRegion, 800);
        }, 500);
      }
    }
  }, [params.region, regions]);

  // Re-center map when country changes
  useEffect(() => {
    if (mapRef.current) {
      regionRef.current = country.initialMapRegion;
      mapRef.current.animateToRegion(country.initialMapRegion, 600);
    }
  }, [country.code]);

  const statesGeoJsonElements = useMemo(() => {
    if (!country.hasGeoJson) return null;
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
      const photoDate = extractDateFromExif(asset.exif);

      if (!gps) {
        showWarning('No Location Data', 'This image does not contain GPS information.');
        return;
      }

      const stateName = await reverseGeocodeToState(gps, country.code);

      if (!stateName) {
        showWarning('Wrong Country', `This image was not taken in ${country.name}.`);
        return;
      }

      // Verify the subdivision belongs to this country
      if (!country.subdivisions.includes(stateName)) {
        showWarning('Unknown Location', `Could not match "${stateName}" to a ${country.subdivisionLabel.toLowerCase()} in ${country.name}.`);
        return;
      }

      if (visitedStates.has(stateName)) {
        showWarning('Already Visited', `${stateName} is already on your map!`);
      } else {
        // Check which milestones will unlock
        const prevCount = visitedStates.size;
        const prevVisited = new Set(visitedStates);
        const newVisited = new Set(visitedStates);
        newVisited.add(stateName);

        addState(stateName, photoDate ?? undefined);

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

        Alert.alert(`${country.subdivisionLabel} Added!`, `${stateName} has been added to your visited ${country.subdivisionLabelPlural.toLowerCase()}.`);
      }
    } catch (err) {
      console.warn('Image pick error:', err);
      Alert.alert('Error', 'Something went wrong while processing the image.');
    } finally {
      setProcessing(false);
    }
  }, [visitedStates, addState, milestones, badgeScale]);

  const handleRegionZoom = useCallback((regionName: string) => {
    const region = regions.find((r) => r.name === regionName);
    if (region && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion(region.mapRegion, 600);
    }
  }, []);

  const totalStates = country.subdivisions.length;
  const percentage = totalStates > 0 ? Math.round((visitedStates.size / totalStates) * 100) : 0;

  const recentEntries = [...(entries ?? [])].reverse().slice(0, 4);
  const lastEntry = recentEntries[0];

  // Find a recommended next target (first unvisited state from a region with least progress)
  const nextTarget = useMemo(() => {
    for (const region of regions) {
      for (const state of region.states) {
        if (!visitedStates.has(state)) return { state, region: region.name };
      }
    }
    return null;
  }, [visitedStates, regions]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.primaryContainer} />
        </View>
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
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Progress Display */}
        <View style={styles.heroWrapper}>
          {/* Offset shadow */}
          <View style={styles.heroShadow} />
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>TOTAL PENETRATION</Text>
              <Animated.View style={[styles.heroCountRow, badgeStyle]}>
                <Text style={styles.heroCount}>{visitedStates.size}</Text>
                <Text style={styles.heroTotal}>/{totalStates}</Text>
              </Animated.View>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroDescription}>
                Current trajectory puts you at {percentage}% completion of the continental grid. Continue aggressive expansion.
              </Text>
              {/* Log Entry Button */}
              <View style={styles.logButtonWrapper}>
                <View style={styles.logButtonShadow} />
                <TouchableOpacity
                  style={styles.logButton}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                  disabled={processing}
                >
                  <Text style={styles.logButtonText}>
                    {processing ? 'PROCESSING...' : 'LOG ENTRY'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            key={`map-${country.code}-${visitedStates.size}`}
            style={styles.map}
            initialRegion={country.initialMapRegion}
            onRegionChangeComplete={(region) => {
              regionRef.current = region;
            }}
            onPress={() => handlePickImage()}
          >
            {statesGeoJsonElements}
          </MapView>

          {/* Floating Stats Badge */}
          <Animated.View style={[styles.statsBadge, badgeStyle]}>
            <Text style={styles.statsBadgeCount}>{visitedStates.size}</Text>
            <Text style={styles.statsBadgeLabel}>/{totalStates}</Text>
          </Animated.View>

          {/* Region chips on map */}
          <View style={styles.mapChips}>
            {regions.map((r) => (
              <TouchableOpacity
                key={r.shortName}
                style={styles.mapChip}
                onPress={() => handleRegionZoom(r.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.mapChipText}>{r.shortName}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <MapLegend />
        </View>

        {/* Sector Status — Regional Progress */}
        <View style={styles.sectorSection}>
          <View style={styles.sectionTitleWrapper}>
            <View style={styles.sectionTitleShadow} />
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>SECTOR STATUS</Text>
            </View>
          </View>

          <View style={styles.sectorGrid}>
            {regions.map((region) => {
              const { visited, total } = getRegionProgress(region, visitedStates);
              const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
              const regionColor = regionColors[region.name] ?? tokens.primaryContainer;
              return (
                <View key={region.name} style={styles.sectorItem}>
                  <View style={styles.sectorLabelRow}>
                    <Text style={styles.sectorLabel}>{region.name}</Text>
                    <Text style={[styles.sectorCount, { color: regionColor }]}>
                      {visited}/{total}
                    </Text>
                  </View>
                  <View style={styles.sectorBarOuter}>
                    <View
                      style={[
                        styles.sectorBarFill,
                        { width: `${pct}%`, backgroundColor: regionColor },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Kinetic Milestone Cards */}
        <View style={styles.milestoneGrid}>
          {/* Target Card */}
          {nextTarget && (
            <View style={styles.targetCardWrapper}>
              <View style={styles.targetCardShadow} />
              <View style={styles.targetCard}>
                {/* Priority ribbon */}
                <View style={styles.priorityRibbon}>
                  <Text style={styles.priorityRibbonText}>PRIORITY</Text>
                </View>
                <View style={styles.targetCardIcon}>
                  <MaterialCommunityIcons name="map-marker-radius" size={48} color={tokens.primaryContainer} />
                </View>
                <View style={styles.targetCardContent}>
                  <Text style={styles.targetCardTitle}>{nextTarget.state}</Text>
                  <Text style={styles.targetCardDesc}>
                    Recommended next target based on proximity to active vector.
                  </Text>
                  <View style={styles.targetTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{nextTarget.region}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Last Acquired Card */}
          {lastEntry && (
            <View style={styles.lastCardWrapper}>
              <View style={styles.lastCardShadow} />
              <View style={styles.lastCard}>
                <View style={styles.lastCardIcon}>
                  <MaterialCommunityIcons name="map-marker-check" size={48} color={tokens.secondary} />
                </View>
                <View style={styles.lastCardContent}>
                  <Text style={styles.lastCardLabel}>LAST ACQUIRED</Text>
                  <Text style={styles.lastCardState}>{lastEntry.stateName}</Text>
                  <Text style={styles.lastCardDate}>
                    LOG_DATE: {new Date(lastEntry.addedAt).toISOString().slice(0, 10).replace(/-/g, '.')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
      <BottomNav
        activeTab="explorer"
        onDoubleTapExplorer={() => {
          mapRef.current?.animateToRegion(country.initialMapRegion, 600);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      />
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

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Header ── */
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

  /* ── Scroll ── */
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 64,
    paddingBottom: 32,
  },

  /* ── Hero Progress ── */
  heroWrapper: {
    position: 'relative',
  },
  heroShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: t.tertiaryContainer,
  },
  heroCard: {
    backgroundColor: t.surfaceContainerLow,
    borderWidth: 4,
    borderColor: t.onSurface,
    padding: 32,
    flexDirection: 'column',
    gap: 24,
    position: 'relative',
    zIndex: 1,
    transform: [{ rotate: '-1deg' }],
  },
  heroLeft: {
    borderLeftWidth: 4,
    borderLeftColor: t.primaryContainer,
    paddingLeft: 24,
  },
  heroLabel: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    color: t.onSurface,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroCount: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 80,
    fontWeight: '900',
    color: t.primaryContainer,
    letterSpacing: -4,
    lineHeight: 80,
  },
  heroTotal: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 40,
    fontWeight: '700',
    color: t.onSurfaceVariant,
    letterSpacing: -2,
  },
  heroRight: {
    gap: 16,
  },
  heroDescription: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    color: t.onSurfaceVariant,
    lineHeight: 22,
    borderBottomWidth: 2,
    borderBottomColor: t.outlineVariant,
    paddingBottom: 16,
  },
  logButtonWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  logButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: t.secondary,
  },
  logButton: {
    backgroundColor: t.primaryContainer,
    borderWidth: 2,
    borderColor: t.onSurface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'relative',
    zIndex: 1,
  },
  logButtonText: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 14,
    fontWeight: '700',
    color: t.surfaceContainerLowest,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  /* ── Map Container ── */
  mapContainer: {
    height: MAP_HEIGHT,
    borderWidth: 4,
    borderColor: t.onSurface,
    overflow: 'hidden',
    backgroundColor: t.surfaceContainerLowest,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  statsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: t.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: t.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statsBadgeCount: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 18,
    fontWeight: '900',
    color: t.primaryContainer,
  },
  statsBadgeLabel: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 12,
    fontWeight: '700',
    color: t.onSurfaceVariant,
  },
  mapChips: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  mapChip: {
    backgroundColor: t.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: t.onSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapChipText: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '800',
    color: t.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── Sector Status ── */
  sectorSection: {
    gap: 32,
  },
  sectionTitleWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginLeft: -4,
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
    paddingHorizontal: 24,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 24,
    fontWeight: '900',
    color: t.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  sectorGrid: {
    gap: 24,
  },
  sectorItem: {
    gap: 8,
  },
  sectorLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectorLabel: {
    fontFamily: FontFamilies.label,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: t.onSurface,
  },
  sectorCount: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 18,
    fontWeight: '900',
  },
  sectorBarOuter: {
    height: 32,
    borderWidth: 2,
    borderColor: t.onSurface,
    backgroundColor: t.surfaceContainerHighest,
    overflow: 'hidden',
    position: 'relative',
  },
  sectorBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },

  /* ── Milestone Cards ── */
  milestoneGrid: {
    gap: 48,
  },
  /* Target Card */
  targetCardWrapper: {
    position: 'relative',
  },
  targetCardShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: t.primaryContainer,
  },
  targetCard: {
    backgroundColor: t.surface,
    borderWidth: 4,
    borderColor: t.onSurface,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  priorityRibbon: {
    position: 'absolute',
    top: 16,
    left: -32,
    backgroundColor: t.onSurface,
    paddingVertical: 4,
    paddingHorizontal: 48,
    transform: [{ rotate: '-45deg' }],
    zIndex: 20,
  },
  priorityRibbonText: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: t.surface,
    textTransform: 'uppercase',
  },
  targetCardIcon: {
    height: 120,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    backgroundColor: t.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCardContent: {
    padding: 24,
    gap: 12,
  },
  targetCardTitle: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 28,
    fontWeight: '900',
    color: t.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  targetCardDesc: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    color: t.onSurfaceVariant,
  },
  targetTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    borderWidth: 2,
    borderColor: t.outline,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    color: t.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  /* Last Acquired Card */
  lastCardWrapper: {
    position: 'relative',
  },
  lastCardShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    backgroundColor: t.secondary,
  },
  lastCard: {
    backgroundColor: t.surfaceContainerLow,
    borderWidth: 4,
    borderColor: t.onSurface,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  lastCardIcon: {
    height: 120,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    backgroundColor: t.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastCardContent: {
    padding: 24,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: t.secondary,
    marginLeft: 16,
    marginRight: 16,
    marginVertical: 16,
    borderWidth: 4,
    borderColor: t.onSurface,
    backgroundColor: t.surface,
  },
  lastCardLabel: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 18,
    fontWeight: '900',
    color: t.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  lastCardState: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 20,
    fontWeight: '700',
    color: t.secondary,
    textTransform: 'uppercase',
  },
  lastCardDate: {
    fontFamily: FontFamilies.body,
    fontSize: 11,
    color: t.onSurfaceVariant,
    letterSpacing: 1,
  },
});
