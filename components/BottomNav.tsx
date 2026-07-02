import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { type DesignTokensType, FontFamilies } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

type TabName = 'archive' | 'explorer' | 'journal' | 'settings';

const TABS: {
  key: TabName;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconActive: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  route: '/' | '/map' | '/timeline' | '/settings';
}[] = [
  { key: 'archive', icon: 'home-outline', iconActive: 'home', label: 'ARCHIVE', route: '/' },
  { key: 'explorer', icon: 'map-outline', iconActive: 'map', label: 'EXPLORER', route: '/map' },
  { key: 'journal', icon: 'timeline-text-outline', iconActive: 'timeline-text', label: 'JOURNAL', route: '/timeline' },
  { key: 'settings', icon: 'cog-outline', iconActive: 'cog', label: 'SETTINGS', route: '/settings' },
];

interface BottomNavProps {
  activeTab: TabName;
  onDoubleTapExplorer?: () => void;
}

export function BottomNav({ activeTab, onDoubleTapExplorer }: BottomNavProps) {
  const router = useRouter();
  const lastTapRef = React.useRef(0);
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);

  return (
    <View style={styles.navWrapper}>
      {/* Neon green top shadow line */}
      <View style={styles.topShadow} />
      <View style={styles.nav}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.navItem as ViewStyle, isActive && (styles.navItemActive as ViewStyle)]}
              activeOpacity={0.7}
              onPress={() => {
                if (isActive && tab.key === 'explorer' && onDoubleTapExplorer) {
                  const now = Date.now();
                  if (now - lastTapRef.current < 400) {
                    onDoubleTapExplorer();
                  }
                  lastTapRef.current = now;
                } else if (!isActive) {
                  router.push(tab.route);
                }
              }}
            >
              <MaterialCommunityIcons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? tokens.surfaceContainerLowest : tokens.onSurface}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  navWrapper: {
    position: 'relative',
  },
  topShadow: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: t.tertiaryContainer,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    height: 80,
    backgroundColor: t.background,
    borderTopWidth: 4,
    borderTopColor: t.onSurface,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRightWidth: 0,
    borderRightColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: t.primaryContainer,
  },
  navLabel: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
    color: t.onSurface,
  },
  navLabelActive: {
    color: t.surfaceContainerLowest,
  },
});
