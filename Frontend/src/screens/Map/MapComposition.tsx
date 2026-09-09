import React, { useEffect, useId } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Defs, Image as SvgImage, Mask, Path, Rect } from 'react-native-svg';
import { MapRegionLayer, MAP_SOURCE } from './MapRegionLayer';
import { findRegion, findRegionAtPoint, MAP_REGIONS, MAP_UNITS } from './regions';
import { regionPhase } from './mapMachine';
import type { MapState } from './mapMachine';
import type { RegionId } from '../../types/ids';

type Props = {
  size: number;
  state: MapState;
  active: boolean;
  reducedMotion: boolean;
  onPress: (id: RegionId) => void;
  onCancel: () => void;
  onFocusFinished: (revision: number) => void;
  onEnterFinished: (revision: number) => void;
};

export function MapComposition({
  size,
  state,
  active,
  reducedMotion,
  onPress,
  onCancel,
  onFocusFinished,
  onEnterFinished,
}: Props) {
  const scale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const completion = useSharedValue(0);
  const residualId = `map-residual-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const region = findRegion(state.regionId);
    const entering = state.phase === 'entering';
    const duration = reducedMotion || !active ? 0 : entering ? 380 : 320;
    const zoom = !region || reducedMotion || !active ? 1 : entering ? 1.25 : 1.12;
    const config = {
      duration,
      easing: Easing.inOut(Easing.cubic),
      reduceMotion: reducedMotion ? ReduceMotion.Always : ReduceMotion.Never,
    };
    const offset = (coordinate: number) =>
      Math.max(-size * 0.12, Math.min(size * 0.12, (0.5 - coordinate / MAP_UNITS) * size * zoom));
    scale.value = withTiming(zoom, config);
    x.value = withTiming(region && !reducedMotion && active ? offset(region.anchor[0]) : 0, config);
    y.value = withTiming(region && !reducedMotion && active ? offset(region.anchor[1]) : 0, config);
    opacity.value = withTiming(entering && !reducedMotion && active ? 0 : 1, config);
    completion.value = 0;
    if (active && (state.phase === 'focused' || entering)) {
      const revision = state.revision;
      completion.value = withTiming(1, config, (finished) => {
        if (finished) {
          if (entering) scheduleOnRN(onEnterFinished, revision);
          else scheduleOnRN(onFocusFinished, revision);
        }
      });
    }
    return () => {
      [scale, x, y, opacity, completion].forEach(cancelAnimation);
    };
  }, [
    state.phase,
    state.regionId,
    state.revision,
    active,
    reducedMotion,
    size,
    scale,
    x,
    y,
    opacity,
    completion,
    onFocusFinished,
    onEnterFinished,
  ]);

  const cameraStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  const handleMapPress = ({ nativeEvent }: GestureResponderEvent) => {
    const point = [
      (nativeEvent.locationX / size) * MAP_UNITS,
      (nativeEvent.locationY / size) * MAP_UNITS,
    ] as const;
    const region = findRegionAtPoint(point);

    if (region) onPress(region.id);
    else onCancel();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ width: size, height: size }, cameraStyle]}
      testID="map-composition">
      {/* Only marks OUTSIDE the regional cutouts stay on the paper. */}
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${MAP_UNITS} ${MAP_UNITS}`}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        accessible={false}>
        <Defs>
          <Mask
            id={residualId}
            x={0}
            y={0}
            width={MAP_UNITS}
            height={MAP_UNITS}
            maskUnits="userSpaceOnUse">
            <Rect width={MAP_UNITS} height={MAP_UNITS} fill="white" />
            {MAP_REGIONS.map((region) => (
              <Path key={region.id} d={region.clipPath} fill="black" />
            ))}
          </Mask>
        </Defs>
        <SvgImage
          href={MAP_SOURCE}
          width={MAP_UNITS}
          height={MAP_UNITS}
          mask={`url(#${residualId})`}
        />
      </Svg>
      {MAP_REGIONS.map((region) => (
        <MapRegionLayer
          key={region.id}
          region={region}
          phase={regionPhase(state, region.id)}
          dimmed={state.regionId !== null && region.id !== state.regionId}
          size={size}
          active={active}
          reducedMotion={reducedMotion}
          onPress={onPress}
          onCancel={onCancel}
        />
      ))}
      {/*
       * Touch is resolved in React Native rather than by SVG Path.onPress.
       * react-native-svg's path responder is unreliable on native when SVGs
       * are layered within transformed Reanimated views.
       */}
      <Pressable
        pointerEvents={active ? 'auto' : 'none'}
        accessible={false}
        tabIndex={-1}
        onPress={handleMapPress}
        style={[StyleSheet.absoluteFill, styles.touchLayer]}
        testID="map-touch-layer"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchLayer: { zIndex: 4 },
});
