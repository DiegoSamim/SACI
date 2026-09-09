import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import MapCloudLayer from '../../components/MapCloudLayer';
import { APP_COLORS } from '../../constants/colors';

const DUST = [
  [0.08, 0.24],
  [0.85, 0.16],
  [0.16, 0.72],
  [0.74, 0.86],
  [0.45, 0.09],
  [0.9, 0.55],
] as const;

export function MapPaper({ enabled }: { enabled: boolean }) {
  // enabled already includes the live system preference and screen visibility.
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = enabled
      ? withRepeat(
          withTiming(1, {
            duration: 28000,
            easing: Easing.inOut(Easing.sin),
            reduceMotion: ReduceMotion.Never,
          }),
          -1,
          true,
          undefined,
          ReduceMotion.Never
        )
      : 0;
    return () => cancelAnimation(drift);
  }, [enabled, drift]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }, { translateY: -drift.value }],
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.Image
        source={require('../../assets/BackgroundPapel.png')}
        resizeMode="cover"
        accessible={false}
        style={[
          { position: 'absolute', top: -2, bottom: -2, left: -2, right: -2, opacity: 0.45 },
          style,
        ]}
      />
    </View>
  );
}

function Dust({
  index,
  width,
  height,
  enabled,
}: {
  index: number;
  width: number;
  height: number;
  enabled: boolean;
}) {
  // enabled already includes the live system preference and screen visibility.
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = enabled
      ? withRepeat(
          withTiming(1, {
            duration: 22000 + index * 2800,
            easing: Easing.inOut(Easing.sin),
            reduceMotion: ReduceMotion.Never,
          }),
          -1,
          true,
          undefined,
          ReduceMotion.Never
        )
      : 0;
    return () => cancelAnimation(drift);
  }, [enabled, index, drift]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 2 }, { translateY: drift.value * -4 }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: width * DUST[index][0],
          top: height * DUST[index][1],
          width: index % 2 ? 1 : 2,
          height: 2,
          opacity: 0.1,
          backgroundColor: APP_COLORS.text.secondary,
        },
        style,
      ]}
    />
  );
}

export function MapAtmosphere({
  width,
  height,
  enabled,
}: {
  width: number;
  height: number;
  enabled: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}>
      <MapCloudLayer width={width} height={height} enabled={enabled} />
      {DUST.map((_, index) => (
        <Dust key={index} index={index} width={width} height={height} enabled={enabled} />
      ))}
    </View>
  );
}
