import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { useCountry } from '@/contexts/country-context';

export interface VisitedStateEntry {
  stateName: string;
  addedAt: string; // ISO date string — when the entry was added to the app
  photoDate?: string; // ISO date string — when the photo was actually taken (from EXIF)
}

const LEGACY_KEY = 'visited-states';

function storageKeyFor(code: string) {
  return `visited-states:${code}`;
}

interface VisitedStatesContextValue {
  visitedStates: Set<string>;
  entries: VisitedStateEntry[];
  isLoading: boolean;
  addState: (stateName: string, photoDate?: string) => void;
  clearStates: () => void;
}

const VisitedStatesContext = createContext<VisitedStatesContextValue | null>(null);

export function VisitedStatesProvider({ children }: { children: React.ReactNode }) {
  const { country } = useCountry();
  const storageKey = storageKeyFor(country.code);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  const [visitedStates, setVisitedStates] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<VisitedStateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Migrate legacy flat key → US-specific key on first run, then load current country
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      // One-time migration
      const legacy = await AsyncStorage.getItem(LEGACY_KEY).catch(() => null);
      if (legacy) {
        const usKey = storageKeyFor('US');
        const existing = await AsyncStorage.getItem(usKey).catch(() => null);
        if (!existing) {
          await AsyncStorage.setItem(usKey, legacy);
        }
        await AsyncStorage.removeItem(LEGACY_KEY);
      }

      // Load current country's data
      const raw = await AsyncStorage.getItem(storageKeyRef.current).catch(() => null);
      if (cancelled) return;

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'string') {
              const migrated: VisitedStateEntry[] = parsed.map((s: string) => ({
                stateName: s,
                addedAt: new Date(0).toISOString(),
              }));
              setEntries(migrated);
              setVisitedStates(new Set(parsed));
            } else {
              const loaded: VisitedStateEntry[] = parsed;
              setEntries(loaded);
              setVisitedStates(new Set(loaded.map((e) => e.stateName)));
            }
          } else {
            setEntries([]);
            setVisitedStates(new Set());
          }
        } catch {
          setEntries([]);
          setVisitedStates(new Set());
        }
      } else {
        setEntries([]);
        setVisitedStates(new Set());
      }
      setIsLoading(false);
    })();

    return () => { cancelled = true; };
  }, [storageKey]);

  const persist = useCallback(async (nextEntries: VisitedStateEntry[]) => {
    try {
      await AsyncStorage.setItem(storageKeyRef.current, JSON.stringify(nextEntries));
    } catch (err) {
      console.warn('Failed to save visited states:', err);
    }
  }, []);

  const addState = useCallback(
    (stateName: string, photoDate?: string) => {
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
        const entry: VisitedStateEntry = {
          stateName,
          addedAt: new Date().toISOString(),
          ...(photoDate ? { photoDate } : {}),
        };
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

  return (
    <VisitedStatesContext.Provider
      value={{ visitedStates, entries, isLoading, addState, clearStates }}
    >
      {children}
    </VisitedStatesContext.Provider>
  );
}

export function useVisitedStatesContext(): VisitedStatesContextValue {
  const ctx = useContext(VisitedStatesContext);
  if (!ctx) {
    throw new Error('useVisitedStatesContext must be used within VisitedStatesProvider');
  }
  return ctx;
}
