import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { type DesignTokensType, FontFamilies } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  current,
  total,
  size = 192,
  strokeWidth = 25,
}: ProgressRingProps) {
  const { tokens } = useTheme();
  const styles = useMemo(() => makeStyles(tokens), [tokens]);
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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="voyagerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={tokens.primaryContainer} />
            <Stop offset="100%" stopColor={tokens.secondary} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tokens.outlineVariant}
          strokeWidth={strokeWidth - 2}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#voyagerGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.countText}>{current}</Text>
        <Text style={styles.totalText}>Of {total} States</Text>
      </View>
    </View>
  );
}

const makeStyles = (t: DesignTokensType) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  countText: {
    fontFamily: FontFamilies.headlineBlack,
    fontSize: 40,
    fontWeight: '900',
    color: t.onSurface,
    letterSpacing: -2,
  },
  totalText: {
    fontFamily: FontFamilies.label,
    fontSize: 10,
    color: t.onSurfaceVariant,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: -2,
  },
});
