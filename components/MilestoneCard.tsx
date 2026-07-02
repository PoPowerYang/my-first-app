import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { type DesignTokensType, FontFamilies } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import type { Milestone } from '@/hooks/use-milestones';

interface MilestoneCardProps {
  milestone: Milestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.card,
        milestone.unlocked ? styles.unlockedCard : styles.lockedCard,
      ]}
    >
      {milestone.unlocked && (
        <View style={styles.decorCircle} />
      )}
      {milestone.unlocked ? (
        <LinearGradient
          colors={[tokens.primary, tokens.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons
            name={milestone.icon as any}
            size={24}
            color={tokens.onPrimary}
          />
        </LinearGradient>
      ) : (
        <View style={styles.lockedIconContainer}>
          <MaterialCommunityIcons
            name={milestone.icon as any}
            size={24}
            color={tokens.outline}
          />
        </View>
      )}
      <View style={styles.textContainer}>
        {milestone.unlocked ? (
          <Text style={styles.statusUnlocked}>Unlocked</Text>
        ) : (
          <View style={styles.lockedStatus}>
            <MaterialCommunityIcons name="lock" size={8} color={tokens.onSurfaceVariant} />
            <Text style={styles.statusLocked}>Locked</Text>
          </View>
        )}
        <Text
          style={[
            styles.title,
            !milestone.unlocked && styles.lockedTitle,
          ]}
          numberOfLines={1}
        >
          {milestone.title}
        </Text>
      </View>
    </Animated.View>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  card: {
    width: 160,
    padding: 20,
    gap: 24,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: t.onSurface,
  },
  unlockedCard: {
    backgroundColor: t.surfaceContainerLow,
  },
  lockedCard: {
    backgroundColor: t.surfaceContainerLowest,
    borderColor: t.outlineVariant,
  },
  decorCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    backgroundColor: t.primaryContainer + '1a',
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: t.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 4,
  },
  statusUnlocked: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: t.primaryContainer,
  },
  lockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLocked: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: t.onSurfaceVariant,
  },
  title: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 15,
    fontWeight: '700',
    color: t.onSurface,
    textTransform: 'uppercase',
  },
  lockedTitle: {
    color: t.onSurfaceVariant,
    opacity: 0.6,
  },
});
