import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedProps,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  current,
  total,
  size = 160,
  strokeWidth = 12,
  color = '#0a7ea4',
  trackColor = '#e8e8ec',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? current / total : 0;

  const progress = useSharedValue(0);
  const displayCount = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(percentage, {
      damping: 15,
      stiffness: 80,
    });
    displayCount.value = withTiming(current, { duration: 600 });
  }, [percentage, current]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const animatedCount = useDerivedValue(() => {
    return Math.round(displayCount.value);
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.countText, { color }]}>{current}</Text>
        <Text style={styles.totalText}>/ {total}</Text>
        <Text style={styles.percentText}>
          {Math.round(percentage * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  countText: {
    fontSize: 36,
    fontWeight: '800',
  },
  totalText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    marginTop: -2,
  },
  percentText: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
    marginTop: 4,
  },
});
