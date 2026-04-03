import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // We already have a header in HomeScreen
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          headerShown: true,
          title: 'Map',
        }}
      />
    </Stack>
  );
}
