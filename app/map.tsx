import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
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
import { CommonStyles } from '@/constants/theme';
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
      <View style={[CommonStyles.container, CommonStyles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[CommonStyles.container, { flexDirection: 'column' }]}>
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

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, processing && styles.fabDisabled]}
        onPress={handlePickImage}
        disabled={processing}
        activeOpacity={0.8}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <MaterialCommunityIcons name="camera" size={28} color="#fff" />
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
  map: {
    flex: 1,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: '#999',
  },
  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  regionButtons: {
    position: 'absolute',
    top: 60,
    right: 12,
    gap: 6,
  },
  regionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  regionButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333',
  },
  clearButton: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
