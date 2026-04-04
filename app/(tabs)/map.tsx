import * as Location from 'expo-location';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Geojson } from 'react-native-maps';

// Import our states geojson
import statesData from '../../assets/us-states.json';

type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * Helper function to convert HSL color values to a hex string with an appended alpha channel.
 * We use this to smoothly distribute colors across the hue wheel so that every state 
 * gets a distinct but aesthetically pleasing color with 50% opacity (#80 in hex).
 */
const hslToHexAlpha = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}80`;
};

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
    const numStates = statesData.features.length;
    
    // Generate an array of distinct colors exactly equal to the number of states, evenly spaced along the color wheel
    const colors = Array.from({ length: numStates }, (_, i) => {
      const hue = (i * 360) / numStates;
      return hslToHexAlpha(hue, 70, 50);
    });

    // @ts-ignore - The imported json typing might be broad, cast it to feature array
    return statesData.features.map((feature: any, index: number) => {
      const uniqueColor = colors[index];
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
      <View style={styles.center}>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
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
    <View style={styles.container}>
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

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

// Style definitions for our layout components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 30, // Extra padding for the bottom edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  }
});
