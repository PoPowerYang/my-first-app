import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MilestoneColors } from '@/constants/theme';
import type { Milestone } from '@/hooks/use-milestones';

interface MilestoneCardProps {
  milestone: Milestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const accentColor = MilestoneColors[milestone.id] ?? '#999';

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.card,
        milestone.unlocked
          ? { borderColor: accentColor, backgroundColor: accentColor + '15' }
          : styles.locked,
      ]}
    >
      <View style={[styles.iconContainer, !milestone.unlocked && styles.lockedIcon]}>
        <MaterialCommunityIcons
          name={milestone.icon as any}
          size={28}
          color={milestone.unlocked ? accentColor : '#bbb'}
        />
      </View>
      <Text
        style={[
          styles.title,
          milestone.unlocked ? { color: accentColor } : styles.lockedText,
        ]}
        numberOfLines={1}
      >
        {milestone.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {milestone.description}
      </Text>
      {!milestone.unlocked && (
        <View style={styles.lockOverlay}>
          <MaterialCommunityIcons name="lock" size={12} color="#bbb" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 130,
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  locked: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    marginBottom: 6,
  },
  lockedIcon: {
    opacity: 0.3,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockedText: {
    color: '#bbb',
  },
  description: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  lockOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  lockIcon: {
    fontSize: 12,
  },
});
