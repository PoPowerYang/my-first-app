import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import {
    DarkDesignTokens,
    type DesignTokensType,
    LightDesignTokens,
} from '@/constants/theme';

const STORAGE_KEY = 'theme-preference';

export type ThemePreference = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  tokens: DesignTokensType;
  colorScheme: 'dark' | 'light';
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'dark' || val === 'light' || val === 'system') {
        setPreferenceState(val);
      }
      setLoaded(true);
    });
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const colorScheme: 'dark' | 'light' =
    preference === 'system' ? (systemScheme ?? 'dark') : preference;

  const tokens = colorScheme === 'dark' ? DarkDesignTokens : LightDesignTokens;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ tokens, colorScheme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
