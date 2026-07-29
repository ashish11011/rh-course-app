import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

type SkeletonProps = ViewProps & {
  className?: string;
};

export function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  const progress = useSharedValue(0);
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const highlight =
    colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.72)';
  const travelDistance = width * 1.8;
  const shimmerWidth = Math.max(width * 0.55, 220);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    width: shimmerWidth,
    transform: [
      { translateX: -travelDistance + progress.value * travelDistance * 2 },
      { rotateZ: '14deg' },
    ],
  }));

  return (
    <View className={`overflow-hidden ${className}`} style={style} {...props}>
      <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', highlight, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    bottom: '-70%',
    position: 'absolute',
    top: '-70%',
  },
});
