import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COUNTRIES } from '@/constants/countries';
import { DesignTokens } from '@/constants/theme';
import { useCountry } from '@/contexts/country-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { country, setCountryCode } = useCountry();

  const navItems = [
    { icon: 'home-outline' as const, label: 'Archive', route: '/' as const, active: false },
    { icon: 'map-outline' as const, label: 'Explorer', route: '/map' as const, active: false },
    { icon: 'timeline-text-outline' as const, label: 'Journal', route: '/timeline' as const, active: false },
    { icon: 'cog' as const, label: 'Settings', route: undefined, active: true },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>Preferences</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Country Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exploration Country</Text>
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
                    <View style={styles.checkCircle}>
                      <MaterialCommunityIcons name="check" size={16} color={DesignTokens.onPrimary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, item.active && styles.navItemActive]}
            onPress={item.route ? () => router.push(item.route) : undefined}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={item.active ? DesignTokens.primary : DesignTokens.outline}
            />
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DesignTokens.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 32,
  },
  /* Header */
  headerSection: {
    gap: 4,
    paddingHorizontal: 8,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: DesignTokens.primary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: DesignTokens.onSurface,
    letterSpacing: -0.5,
  },
  /* Section */
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: DesignTokens.onSurfaceVariant,
    marginBottom: 8,
  },
  /* Country List */
  countryList: {
    gap: 12,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  countryCardSelected: {
    borderColor: DesignTokens.primary,
    backgroundColor: DesignTokens.surfaceContainerLow,
  },
  countryFlag: {
    fontSize: 32,
  },
  countryInfo: {
    flex: 1,
    gap: 2,
  },
  countryName: {
    fontSize: 17,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  countryMeta: {
    fontSize: 12,
    color: DesignTokens.onSurfaceVariant,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignTokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Bottom Nav */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: DesignTokens.surfaceContainerLow,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    color: DesignTokens.outline,
  },
  navLabelActive: {
    color: DesignTokens.primary,
  },
});
