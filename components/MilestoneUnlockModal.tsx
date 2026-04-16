import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

import { MilestoneColors } from '@/constants/theme';

interface MilestoneUnlockModalProps {
  milestoneId: string | null;
  title: string;
  icon: string;
  description: string;
  onDismiss: () => void;
}

export function MilestoneUnlockModal({
  milestoneId,
  title,
  icon,
  description,
  onDismiss,
}: MilestoneUnlockModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (milestoneId) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [milestoneId]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!milestoneId) return null;

  const accentColor = MilestoneColors[milestoneId] ?? '#0a7ea4';

  return (
    <Animated.View style={[styles.overlay, containerStyle]}>
      <Animated.View style={[styles.card, { borderColor: accentColor }, cardStyle]}>
        <View style={styles.unlockLabelRow}>
          <MaterialCommunityIcons name="party-popper" size={16} color="#666" />
          <Text style={styles.unlockLabel}> Milestone Unlocked!</Text>
        </View>
        <MaterialCommunityIcons
          name={icon as any}
          size={56}
          color={accentColor}
          style={styles.iconSpacing}
        />
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 3,
    padding: 32,
    alignItems: 'center',
    width: '75%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  unlockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unlockLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  iconSpacing: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
