import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Geojson, type Region } from 'react-native-maps';

import statesData from '@/assets/us-states.json';
import { CommonStyles } from '@/constants/theme';
import { useVisitedStates } from '@/hooks/use-visited-states';
import { extractGpsFromExif, reverseGeocodeToState } from '@/utils/image-geo-extractor';
import { fourColorAlgorithm } from '@/utils/map-coloring';

const INITIAL_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 50.0,
  longitudeDelta: 50.0,
};

export default function MapScreen() {
  const { visitedStates, isLoading, addState, clearStates } = useVisitedStates();
  const [processing, setProcessing] = useState(false);
  const regionRef = useRef<Region>(INITIAL_REGION);

  const statesGeoJsonElements = useMemo(() => {
    const fullColorMap = fourColorAlgorithm(statesData.features);

    return statesData.features.map((feature: any, index: number) => {
      const stateName = feature.properties?.NAME;
      const isVisited = stateName ? visitedStates.has(stateName) : false;
      const fillColor = isVisited
        ? fullColorMap[stateName]
        : 'rgba(0, 0, 0, 0)';

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
          strokeColor="rgb(0, 0, 0)"
          strokeWidth={1}
        />
      );
    });
  }, [visitedStates]);

  const handlePickImage = useCallback(async () => {
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
        Alert.alert('No Location Data', 'This image does not contain GPS information.');
        setProcessing(false);
        return;
      }

      const stateName = await reverseGeocodeToState(gps);

      if (!stateName) {
        Alert.alert('Not in the US', 'This image was not taken in a US state.');
        setProcessing(false);
        return;
      }

      if (visitedStates.has(stateName)) {
        Alert.alert('Already Visited', `${stateName} is already on your map!`);
      } else {
        addState(stateName);
        Alert.alert('State Added!', `${stateName} has been added to your visited states.`);
      }
    } catch (err) {
      console.warn('Image pick error:', err);
      Alert.alert('Error', 'Something went wrong while processing the image.');
    } finally {
      setProcessing(false);
    }
  }, [visitedStates, addState]);

  if (isLoading) {
    return (
      <View style={[CommonStyles.container, CommonStyles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[CommonStyles.container, { flexDirection: 'column' }]}>
      {/* Key forces MapView to fully remount when visited states change,
          since react-native-maps Geojson doesn't update fillColor on prop changes. */}
      <MapView
        key={`map-${visitedStates.size}`}
        style={styles.map}
        initialRegion={regionRef.current}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
        }}
      >
        {statesGeoJsonElements}
      </MapView>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {visitedStates.size} / {statesData.features.length} states
        </Text>
      </View>

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
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.fab, processing && styles.fabDisabled]}
        onPress={handlePickImage}
        disabled={processing}
        activeOpacity={0.8}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.fabText}>📷</Text>
        )}
      </TouchableOpacity>
    </View>
  );
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
  fabText: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
