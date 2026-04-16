import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Geojson, type Region } from 'react-native-maps';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import statesData from '@/assets/us-states.json';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';
import { MapLegend } from '@/components/MapLegend';
import { MilestoneUnlockModal } from '@/components/MilestoneUnlockModal';
import { US_REGIONS } from '@/constants/regions';
import { DesignTokens } from '@/constants/theme';
import { getNewlyUnlockedMilestones, useMilestones } from '@/hooks/use-milestones';
import { useVisitedStates } from '@/hooks/use-visited-states';
import { extractGpsFromExif, reverseGeocodeToState } from '@/utils/image-geo-extractor';
import { fourColorAlgorithm } from '@/utils/map-coloring';

const INITIAL_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 50.0,
  longitudeDelta: 50.0,
};

const UNVISITED_FILL = 'rgba(180, 180, 190, 0.15)';
const UNVISITED_STROKE = 'rgba(150, 150, 160, 0.4)';

export default function MapScreen() {
  const router = useRouter();
  const { visitedStates, isLoading, addState, clearStates } = useVisitedStates();
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

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignTokens.primary} />
        </View>
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

      {/* Map */}
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

        {/* Progress Badge */}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>
            {visitedStates.size} / {statesData.features.length} states
          </Text>
        </Animated.View>

        {/* Region Zoom Shortcuts */}
        <View style={styles.regionButtons}>
          {US_REGIONS.map((r) => (
            <TouchableOpacity
              key={r.shortName}
              style={styles.regionButton}
              onPress={() => handleRegionZoom(r.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.regionButtonText}>{r.shortName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Legend */}
        <MapLegend />

        {/* Clear Button */}
        {visitedStates.size > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() =>
              Alert.alert('Clear All', 'Remove all visited states?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearStates },
              ])
            }
          >
            <MaterialCommunityIcons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

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
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <MaterialCommunityIcons
            name="map"
            size={24}
            color={DesignTokens.primary}
          />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Explorer</Text>
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
  /* Map */
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 12,
    marginBottom: 4,
  },
  map: {
    flex: 1,
    width: '100%',
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
  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: DesignTokens.surfaceContainerLowest,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeText: {
    color: DesignTokens.onSurface,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  regionButtons: {
    position: 'absolute',
    top: 60,
    right: 12,
    gap: 8,
  },
  regionButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: DesignTokens.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  regionButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: DesignTokens.onSurface,
    letterSpacing: 0.5,
  },
  clearButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: DesignTokens.onSurface + '80',
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
