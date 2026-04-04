import * as Location from 'expo-location';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Geojson } from 'react-native-maps';
import { CommonStyles } from '../../constants/theme';

// Import our states geojson
import statesData from '../../assets/us-states.json';

type Coordinate = {
  latitude: number;
  longitude: number;
};

import { fourColorAlgorithm, sequentialHueAlgorithm } from '../../scripts/mapColoring';

export default function MapScreen() {
  // State to hold the user's current GPS location
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  // State to hold any error messages generated during the location request process
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State to store the location subscription so we can cleanly unsubscribe when the component unmounts
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  // Effect hook to initialize and manage location tracking when the component mounts
  useEffect(() => {
    let sub: Location.LocationSubscription;

    (async () => {
      // Request user permission to access location foreground services
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Watch location changes
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
        }
      );
      setSubscription(sub);
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  /**
   * Pre-processes our USA GeoJSON data to extract each state into its own individual Geojson component.
   * We use useMemo to ensure this heavy calculation only happens once when the component mounts.
   */
  const statesGeoJsonElements = useMemo(() => {
    // Generate the color map based on our preferred algorithm.
    // To change algorithms, swap `fourColorAlgorithm` for `sequentialHueAlgorithm`
    const colorMap = fourColorAlgorithm(statesData.features);

    // @ts-ignore - The imported json typing might be broad, cast it to feature array
    return statesData.features.map((feature: any, index: number) => {
      const stateName = feature.properties?.NAME;
      const uniqueColor = stateName ? colorMap[stateName] : 'rgba(0,0,0,0.1)';
      
      const featureCollection = {
        type: 'FeatureCollection',
        features: [feature],
      };

      return (
        <Geojson
          key={feature.id || index}
          // @ts-ignore - geojson typing
          geojson={featureCollection}
          fillColor={uniqueColor}
          strokeColor="rgba(0, 0, 0, 0.5)"
          strokeWidth={1}
        />
      );
    });
  }, []);

  // Determine the display text depending on whether tracking was successful, errored, or is still waiting
  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude.toFixed(4)} Lon: ${location.coords.longitude.toFixed(4)}`;
  }

  // If we haven't resolved a location yet, render a loading view (or an error message if permission was denied)
  if (!location) {
    return (
      <View style={CommonStyles.center}>
        {errorMsg ? (
          <Text style={CommonStyles.errorText}>{errorMsg}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>{text}</Text>
          </>
        )}
      </View>
    );
  }

  // Parse out exactly what coordinate object react-native-maps expects for markers and map center
  const currentCoord: Coordinate = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  // Render the primary map interface, initializing the view around the user's location while zoomed out
  return (
    <View style={[CommonStyles.container, { flexDirection: 'column' }]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentCoord.latitude,
          longitude: currentCoord.longitude,
          latitudeDelta: 50.0, // Zoom out to see the US
          longitudeDelta: 50.0,
        }}
      >
        {statesGeoJsonElements}
        
        <Marker
          coordinate={currentCoord}
          title="You are here"
          pinColor="blue"
        />
      </MapView>

      <View style={[CommonStyles.floatingBox, { paddingBottom: 30 }]}>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

// Style definitions for our layout components
const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  }
});
