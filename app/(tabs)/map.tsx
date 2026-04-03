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

// Function to generate a deterministic color based on a string (e.g., state name)
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color + '80'; // Add 80 for 50% opacity
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription;

    (async () => {
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

  // Pre-process GeoJSON to extract individual states for separate coloring
  const statesGeoJsonElements = useMemo(() => {
    // @ts-ignore - The imported json typing might be broad, cast it to feature array
    return statesData.features.map((feature: any, index: number) => {
      const stateName = feature.properties?.NAME || `state-${index}`;
      const uniqueColor = stringToColor(stateName);
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

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude.toFixed(4)} Lon: ${location.coords.longitude.toFixed(4)}`;
  }

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

  const currentCoord: Coordinate = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

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
