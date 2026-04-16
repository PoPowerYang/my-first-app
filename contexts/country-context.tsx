import { COUNTRIES, type CountryConfig, getCountryByCode } from '@/constants/countries';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'selected-country';

interface CountryContextValue {
  country: CountryConfig;
  setCountryCode: (code: string) => void;
  isLoading: boolean;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState<CountryConfig>(COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((code) => {
      if (code) setCountry(getCountryByCode(code));
      setIsLoading(false);
    });
  }, []);

  const setCountryCode = (code: string) => {
    const next = getCountryByCode(code);
    setCountry(next);
    AsyncStorage.setItem(STORAGE_KEY, code);
  };

  return (
    <CountryContext.Provider value={{ country, setCountryCode, isLoading }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used inside CountryProvider');
  return ctx;
}
