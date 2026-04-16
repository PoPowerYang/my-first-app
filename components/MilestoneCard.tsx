import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { DesignTokens } from '@/constants/theme';
import type { Milestone } from '@/hooks/use-milestones';

interface MilestoneCardProps {
  milestone: Milestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
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
          colors={[DesignTokens.primary, DesignTokens.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons
            name={milestone.icon as any}
            size={24}
            color={DesignTokens.onPrimary}
          />
        </LinearGradient>
      ) : (
        <View style={styles.lockedIconContainer}>
          <MaterialCommunityIcons
            name={milestone.icon as any}
            size={24}
            color={DesignTokens.outline}
          />
        </View>
      )}
      <View style={styles.textContainer}>
        {milestone.unlocked ? (
          <Text style={styles.statusUnlocked}>Unlocked</Text>
        ) : (
          <View style={styles.lockedStatus}>
            <MaterialCommunityIcons name="lock" size={8} color={DesignTokens.onSurfaceVariant} />
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

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 24,
    padding: 20,
    gap: 24,
    marginRight: 12,
    overflow: 'hidden',
  },
  unlockedCard: {
    backgroundColor: DesignTokens.surfaceContainerLowest,
    shadowColor: DesignTokens.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 4,
  },
  lockedCard: {
    backgroundColor: DesignTokens.surfaceDim + '66',
  },
  decorCircle: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 64,
    height: 64,
    borderBottomLeftRadius: 999,
    backgroundColor: DesignTokens.primary + '0d',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: DesignTokens.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 4,
  },
  statusUnlocked: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: DesignTokens.primary,
  },
  lockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLocked: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: DesignTokens.onSurfaceVariant,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: DesignTokens.onSurface,
  },
  lockedTitle: {
    color: DesignTokens.onSurfaceVariant,
    opacity: 0.6,
  },
});
