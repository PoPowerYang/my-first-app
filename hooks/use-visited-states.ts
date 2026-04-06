import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'visited-states';

/**
 * Hook for managing the set of US states the user has visited.
 * Persists data to AsyncStorage across app restarts.
 */
export function useVisitedStates() {
  const [visitedStates, setVisitedStates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: string[] = JSON.parse(raw);
          setVisitedStates(new Set(parsed));
        }
      })
      .catch((err) => console.warn('Failed to load visited states:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (states: Set<string>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...states]));
    } catch (err) {
      console.warn('Failed to save visited states:', err);
    }
  }, []);

  const addState = useCallback(
    (stateName: string) => {
      setVisitedStates((prev) => {
        if (prev.has(stateName)) return prev;
        const next = new Set(prev);
        next.add(stateName);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearStates = useCallback(() => {
    setVisitedStates(new Set());
    persist(new Set());
  }, [persist]);

  return { visitedStates, isLoading, addState, clearStates };
}
