import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { COUNTRIES } from '@/constants/countries';
import { type DesignTokensType, FontFamilies } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';
import { type ThemePreference, useTheme } from '@/contexts/theme-context';

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { key: 'light', label: 'LIGHT', icon: 'white-balance-sunny' },
  { key: 'dark', label: 'DARK', icon: 'moon-waning-crescent' },
  { key: 'system', label: 'SYSTEM', icon: 'cellphone' },
];

export default function SettingsScreen() {
  const { country, setCountryCode } = useCountry();
  const { tokens, preference, setPreference } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Brutalist Header */}
      <View style={styles.header}>
        <Text style={styles.headerBrand}>STATEDEX</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>PREFERENCES</Text>
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleShadow} />
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>APPEARANCE</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Choose your preferred visual mode.
          </Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.key === preference;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                  ]}
                  onPress={() => setPreference(opt.key)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={24}
                    color={isSelected ? tokens.surfaceContainerLowest : tokens.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      isSelected && styles.themeLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Country Selection */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleShadow} />
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>EXPLORATION COUNTRY</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Each country tracks its own progress separately.
          </Text>
          <View style={styles.countryList}>
            {COUNTRIES.map((c) => {
              const isSelected = c.code === country.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryCard,
                    isSelected && styles.countryCardSelected,
                  ]}
                  onPress={() => setCountryCode(c.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{c.name}</Text>
                    <Text style={styles.countryMeta}>
                      {c.subdivisions.length} {c.subdivisionLabelPlural} · {c.regions.length} Regions
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBox}>
                      <MaterialCommunityIcons name="check" size={16} color={tokens.surfaceContainerLowest} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav activeTab="settings" />
    </SafeAreaView>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.background,
  },

  /* Header bar */
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: t.background,
    borderBottomWidth: 4,
    borderBottomColor: t.onSurface,
    alignItems: 'center',
  },
  headerBrand: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 22,
    fontWeight: '900',
    color: t.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },

  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 32,
  },
  /* Header */
  headerSection: {
    gap: 6,
  },
  headerLabel: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: t.primaryContainer,
  },
  headerTitle: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 36,
    fontWeight: '900',
    color: t.onSurface,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  /* Section */
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  sectionTitleShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: t.secondary,
  },
  sectionTitleBox: {
    backgroundColor: t.surfaceContainerLow,
    borderWidth: 2,
    borderColor: t.onSurface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 14,
    fontWeight: '900',
    color: t.onSurface,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontFamily: FontFamilies.body,
    fontSize: 13,
    color: t.onSurfaceVariant,
  },
  /* Theme Row */
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: t.outlineVariant,
    backgroundColor: t.surfaceContainerLow,
  },
  themeCardSelected: {
    borderColor: t.primaryContainer,
    backgroundColor: t.primaryContainer,
  },
  themeLabel: {
    fontFamily: FontFamilies.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: t.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  themeLabelSelected: {
    color: t.surfaceContainerLowest,
  },
  /* Country List */
  countryList: {
    gap: 12,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.surfaceContainerLow,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: t.outlineVariant,
  },
  countryCardSelected: {
    borderColor: t.primaryContainer,
    backgroundColor: t.surfaceContainerHighest,
  },
  countryFlag: {
    fontSize: 32,
  },
  countryInfo: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 17,
    fontWeight: '700',
    color: t.onSurface,
    textTransform: 'uppercase',
  },
  countryMeta: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    color: t.onSurfaceVariant,
  },
  checkBox: {
    width: 28,
    height: 28,
    backgroundColor: t.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: t.onSurface,
  },
});
