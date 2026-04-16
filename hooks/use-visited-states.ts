import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'visited-states';

export interface VisitedStateEntry {
  stateName: string;
  addedAt: string; // ISO date string
}

/**
 * Hook for managing the set of US states the user has visited.
 * Persists data to AsyncStorage across app restarts.
 * Stores both a Set<string> for quick lookup and an ordered entries array with timestamps.
 */
export function useVisitedStates() {
  const [visitedStates, setVisitedStates] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<VisitedStateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          // Backward-compatible: handle both old string[] and new entry[] formats
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'string') {
              // Legacy format: string[]
              const migrated: VisitedStateEntry[] = parsed.map((s: string) => ({
                stateName: s,
                addedAt: new Date(0).toISOString(),
              }));
              setEntries(migrated);
              setVisitedStates(new Set(parsed));
            } else {
              // New format: VisitedStateEntry[]
              const loaded: VisitedStateEntry[] = parsed;
              setEntries(loaded);
              setVisitedStates(new Set(loaded.map((e) => e.stateName)));
            }
          }
        }
      })
      .catch((err) => console.warn('Failed to load visited states:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (nextEntries: VisitedStateEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    } catch (err) {
      console.warn('Failed to save visited states:', err);
    }
  }, []);

  const addState = useCallback(
    (stateName: string) => {
      let added = false;
      setVisitedStates((prev) => {
        if (prev.has(stateName)) return prev;
        added = true;
        const next = new Set(prev);
        next.add(stateName);
        return next;
      });
      if (!added) return;
      setEntries((prev) => {
        const entry: VisitedStateEntry = { stateName, addedAt: new Date().toISOString() };
        const next = [...prev, entry];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearStates = useCallback(() => {
    setVisitedStates(new Set());
    setEntries([]);
    persist([]);
  }, [persist]);

  return { visitedStates, entries, isLoading, addState, clearStates };
}
