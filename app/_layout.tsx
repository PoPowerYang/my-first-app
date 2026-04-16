import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VisitedStatesProvider } from '@/contexts/visited-states-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <VisitedStatesProvider>
          <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="map" />
            <Tabs.Screen name="timeline" />
          </Tabs>
          <StatusBar style="auto" />
        </VisitedStatesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
