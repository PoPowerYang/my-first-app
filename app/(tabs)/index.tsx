import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CommonStyles } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={CommonStyles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Dashboard</Text>

      {/* Box 1: Link to the Map Component */}
      <TouchableOpacity
        style={[CommonStyles.card, styles.mapBoxGateway]}
        onPress={() => router.push('/map')}
        activeOpacity={0.8}
      >
        <Text style={styles.mapBoxTitle}>Explore Live Map</Text>
        <Text style={styles.mapBoxSubtitle}>View real-time location details  ➔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'column',
    padding: 16,
    paddingTop: 60,
    gap: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  mapBoxGateway: {
    backgroundColor: '#0a7ea4',
  },
  mapBoxTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  mapBoxSubtitle: {
    fontSize: 15,
    color: '#rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  boxText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  }
});
