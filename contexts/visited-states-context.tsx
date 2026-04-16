import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export interface VisitedStateEntry {
  stateName: string;
  addedAt: string; // ISO date string
}

const STORAGE_KEY = 'visited-states';

interface VisitedStatesContextValue {
  visitedStates: Set<string>;
  entries: VisitedStateEntry[];
  isLoading: boolean;
  addState: (stateName: string) => void;
  clearStates: () => void;
}

const VisitedStatesContext = createContext<VisitedStatesContextValue | null>(null);

export function VisitedStatesProvider({ children }: { children: React.ReactNode }) {
  const [visitedStates, setVisitedStates] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<VisitedStateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
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
