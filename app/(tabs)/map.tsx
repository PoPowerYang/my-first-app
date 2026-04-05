import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Geojson } from 'react-native-maps';
import { CommonStyles } from '../../constants/theme';

// Import our states geojson
import statesData from '../../assets/us-states.json';

import { fourColorAlgorithm, sequentialHueAlgorithm } from '../../scripts/mapColoring';

export default function MapScreen() {

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

  // Render the primary map interface, initialized around the center of the US
  return (
    <View style={[CommonStyles.container, { flexDirection: 'column' }]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.8283,
          longitude: -98.5795,
          latitudeDelta: 50.0, // Zoom out to see the US
          longitudeDelta: 50.0,
        }}
      >
        {statesGeoJsonElements}
      </MapView>
    </View>
  );
}

// Style definitions for our layout components
const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
});
