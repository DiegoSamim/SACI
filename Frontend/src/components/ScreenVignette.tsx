import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_COLORS } from '../constants/colors';

export default function ScreenVignette() {
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[APP_COLORS.background.vignetteStrong, 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.14 }}
      />
      <LinearGradient
        colors={['transparent', APP_COLORS.background.vignetteStrong]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.14 }}
      />
      <LinearGradient
        colors={[APP_COLORS.background.vignetteSoft, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: width * 0.15 }}
      />
      <LinearGradient
        colors={['transparent', APP_COLORS.background.vignetteSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: width * 0.15 }}
      />
    </View>
  );
}
