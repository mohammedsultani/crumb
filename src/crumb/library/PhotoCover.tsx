// The cover-art surface used by shelf cards, grid cards, recipe detail, and
// the Cook Mode intro. No real photo backend exists, and stock photography
// can't be bundled/redistributed freely, so covers are an original line
// illustration (see DishArt.tsx) over a tinted gradient — each recipe's
// `hue` gives the shelf real color variety. `pressed` drives a slow "Ken
// Burns" zoom so cards read as interactive without being gimmicky.

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { CrumbTheme } from '../../theme/crumb';
import { DishArt } from './DishArt';
import type { DishArtKind } from './types';

function tint(hue: number, sat: number, light: number, alpha = 1) {
  return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
}

export function PhotoCover({
  theme,
  hue,
  art,
  pressed = false,
  height,
  rounded = 0,
  fadeBottom = true,
}: {
  theme: CrumbTheme;
  hue: number;
  art: DishArtKind;
  pressed?: boolean;
  height: number;
  rounded?: number;
  fadeBottom?: boolean;
}) {
  const zoom = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(zoom, {
      toValue: pressed ? 1.07 : 1,
      duration: pressed ? 1400 : 260,
      easing: pressed ? Easing.out(Easing.ease) : Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [pressed, zoom]);

  const isDark = theme.id === 'dark';
  const base = isDark ? tint(hue, 30, 22) : tint(hue, 44, 91);
  const baseDeep = isDark ? tint(hue, 28, 15) : tint(hue, 38, 83);
  const hatch = isDark ? tint(hue, 24, 30, 0.28) : tint(hue, 32, 74, 0.22);

  return (
    <View style={{ height, borderRadius: rounded, overflow: 'hidden' }}>
      <Animated.View
        style={{
          flex: 1,
          transform: [{ scale: zoom }],
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: fadeBottom ? height * 0.16 : 0,
        }}
      >
        <LinearGradient
          colors={[base, baseDeep]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill as any}
        />
        <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: -60 + i * 44,
                top: -30,
                width: 9,
                height: height + 80,
                backgroundColor: hatch,
                transform: [{ rotate: '32deg' }],
              }}
            />
          ))}
        </View>
        <DishArt kind={art} hue={hue} ink={theme.ink} size={Math.min(height * 0.62, 118)} />
      </Animated.View>

      {fadeBottom && (
        <LinearGradient
          colors={['transparent', theme.surf]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.62 }}
          pointerEvents="none"
        />
      )}
    </View>
  );
}
