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
import { ICONS } from '../constants/icons';

function Cloud({
  width,
  height,
  index,
  enabled,
}: {
  width: number;
  height: number;
  index: number;
  enabled: boolean;
}) {
  // enabled already includes the live system preference and screen visibility.
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = enabled
      ? withRepeat(
          withTiming(1, {
            duration: index === 0 ? 32000 : 40000,
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
    transform: [
      { translateX: drift.value * (index === 0 ? 12 : -10) },
      { translateY: drift.value * 2 },
    ],
  }));
  return (
    <Animated.Image
      source={ICONS.nuvemPreenchida}
      resizeMode="contain"
      accessible={false}
      style={[
        {
          position: 'absolute',
          width: width * 0.2,
          height: width * 0.2,
          left: width * (index === 0 ? 0.04 : 0.74),
          top: height * (index === 0 ? 0.08 : 0.72),
          opacity: 0.07,
        },
        style,
      ]}
    />
  );
}

export default function MapCloudLayer({
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
      <Cloud width={width} height={height} index={0} enabled={enabled} />
      <Cloud width={width} height={height} index={1} enabled={enabled} />
    </View>
  );
}
