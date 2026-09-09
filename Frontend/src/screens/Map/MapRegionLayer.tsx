import React, { memo, useEffect, useId, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Image as SvgImage, Mask, Path, Pattern } from 'react-native-svg';
import { APP_COLORS } from '../../constants/colors';
import type { RegionPhase } from './mapMachine';
import { MAP_UNITS } from './regions';
import type { MapRegion } from './regions';

export const MAP_SOURCE = require('../../assets/MapaBrasil2.png');

export type RegionIllustrationProps = {
  region: MapRegion;
  phase: RegionPhase;
  progress: SharedValue<number>;
  ambientEnabled: boolean;
};

type Props = {
  region: MapRegion;
  phase: RegionPhase;
  dimmed: boolean;
  size: number;
  active: boolean;
  reducedMotion: boolean;
  onPress: (id: MapRegion['id']) => void;
  onCancel: () => void;
  // Additional SVG illustrations use the same 301-unit coordinate space.
  Illustration?: React.ComponentType<RegionIllustrationProps>;
};

export const MapRegionLayer = memo(function MapRegionLayer({
  region,
  phase,
  dimmed,
  size,
  active,
  reducedMotion,
  onPress,
  onCancel,
  Illustration,
}: Props) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const elevated = phase !== 'idle';
  const instanceId = useId().replace(/:/g, '');
  const clipId = `region-clip-${region.id}-${instanceId}`;
  const hatchId = `region-hatch-${region.id}-${instanceId}`;
  const shadowId = `region-shadow-${region.id}-${instanceId}`;

  useEffect(() => {
    const config = {
      duration: reducedMotion || !active ? 0 : 320,
      easing: Easing.out(Easing.cubic),
      // AccessibilityInfo tracks live changes; System uses a startup snapshot.
      reduceMotion: reducedMotion ? ReduceMotion.Always : ReduceMotion.Never,
    };
    progress.value = withTiming(elevated ? 1 : 0, config);
    opacity.value = withTiming(dimmed ? 0.8 : 1, config);
    return () => {
      cancelAnimation(progress);
      cancelAnimation(opacity);
    };
  }, [elevated, dimmed, reducedMotion, active, opacity, progress]);

  const layerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const printStyle = useAnimatedStyle(() => ({
    transform: reducedMotion
      ? []
      : [
          { perspective: 900 },
          { translateY: -region.motion.lift * progress.value },
          { scale: 1 + (region.motion.scale - 1) * progress.value },
          { rotateX: `${region.motion.tilt * progress.value}deg` },
        ],
  }));
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.32,
    transform: [{ translateX: 3 * progress.value }, { translateY: 4 * progress.value }],
  }));

  const keyboardProps =
    Platform.OS === 'web'
      ? {
          tabIndex: active ? (0 as const) : (-1 as const),
          onFocus: (event: { currentTarget: unknown }) =>
            setKeyboardFocused((event.currentTarget as HTMLElement).matches(':focus-visible')),
          onBlur: () => setKeyboardFocused(false),
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setKeyboardFocused(true);
              onPress(region.id);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              onCancel();
            }
          },
        }
      : {};

  return (
    <Animated.View
      {...keyboardProps}
      pointerEvents="box-none"
      accessible
      accessibilityRole="button"
      accessibilityLabel={region.name}
      aria-selected={elevated}
      aria-disabled={!active || phase === 'entering'}
      aria-busy={phase === 'focused' || phase === 'entering'}
      accessibilityHint={`${region.destination === 'ComingSoonRegion' ? 'Em breve. ' : ''}${phase === 'selected' ? 'Ative novamente para entrar.' : 'Ative para selecionar a região.'}`}
      accessibilityState={{
        selected: elevated,
        disabled: !active || phase === 'entering',
        busy: phase === 'focused' || phase === 'entering',
      }}
      accessibilityActions={[
        {
          name: 'activate',
          label: phase === 'selected' ? 'Entrar na região' : 'Selecionar região',
        },
      ]}
      onAccessibilityTap={() => onPress(region.id)}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') onPress(region.id);
      }}
      style={[StyleSheet.absoluteFill, { zIndex: elevated ? 2 : 1 }, layerStyle]}
      testID={`map-region-${region.id}`}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, shadowStyle]}>
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${MAP_UNITS} ${MAP_UNITS}`}
          accessible={false}>
          <Defs>
            <ClipPath id={`${shadowId}-clip`}>
              <Path d={region.clipPath} />
            </ClipPath>
            <Mask
              id={shadowId}
              x={0}
              y={0}
              width={MAP_UNITS}
              height={MAP_UNITS}
              maskUnits="userSpaceOnUse"
              maskType="alpha"
              style={{ maskType: 'alpha' }}>
              <SvgImage
                href={MAP_SOURCE}
                width={MAP_UNITS}
                height={MAP_UNITS}
                clipPath={`url(#${shadowId}-clip)`}
              />
            </Mask>
            <Pattern id={hatchId} width={5} height={6} patternUnits="userSpaceOnUse">
              <Path d="M-1 2L5 0 M0 5L6 3" stroke={APP_COLORS.text.secondary} strokeWidth={1.1} />
            </Pattern>
          </Defs>
          <Path d={region.hitPath} fill={`url(#${hatchId})`} mask={`url(#${shadowId})`} />
        </Svg>
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          {
            transformOrigin: `${(region.anchor[0] / MAP_UNITS) * 100}% ${(region.anchor[1] / MAP_UNITS) * 100}%`,
          },
          printStyle,
        ]}>
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${MAP_UNITS} ${MAP_UNITS}`}
          pointerEvents="box-none"
          accessible={false}>
          <Defs>
            <ClipPath id={clipId}>
              <Path d={region.clipPath} />
            </ClipPath>
          </Defs>
          <SvgImage
            href={MAP_SOURCE}
            width={MAP_UNITS}
            height={MAP_UNITS}
            clipPath={`url(#${clipId})`}
            pointerEvents="none"
          />
          {Illustration && (
            <Illustration
              region={region}
              phase={phase}
              progress={progress}
              ambientEnabled={active && !reducedMotion}
            />
          )}
          <Path
            d={region.hitPath}
            fill="transparent"
            stroke={APP_COLORS.text.secondary}
            strokeWidth={keyboardFocused || (reducedMotion && elevated) ? 1 : 0}
            strokeDasharray="3 2"
            pointerEvents="none"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
});
