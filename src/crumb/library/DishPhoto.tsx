// The real-photo cover treatment. Full-bleed photo, vivid and untouched
// across its top two-thirds, then a smooth gradient beginning around the
// vertical midpoint that deepens into a warm espresso-brown (Crumb's own
// "hearth" tone — not pure black) toward the bottom, where the title and
// description sit. A faint grain breaks up the gradient so it doesn't band
// or read as a flat digital scrim — more like dim, warm kitchen light
// falling across the bottom of the photo. `pressed` drives the same slow
// "Ken Burns" zoom used by the illustrated PhotoCover, so the two covers
// feel like one interaction language.

import { LinearGradient } from 'expo-linear-gradient';
import { Image, type ImageSource } from 'expo-image';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { hearth } from '../../theme/crumb';

// A fixed, pre-computed speckle field (not regenerated per render/instance)
// standing in for a noise texture — cheap on every platform, no image asset
// or SVG filter support required.
const GRAIN_SEED = 7919;
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const GRAIN_DOTS = (() => {
  const rand = seededRandom(GRAIN_SEED);
  return Array.from({ length: 140 }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    o: 0.02 + rand() * 0.05,
    light: rand() > 0.5,
  }));
})();

function Grain() {
  return (
    <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
      {GRAIN_DOTS.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: 1.4,
            height: 1.4,
            borderRadius: 0.7,
            backgroundColor: d.light ? 'rgba(255,240,225,1)' : 'rgba(20,12,8,1)',
            opacity: d.o,
          }}
        />
      ))}
    </View>
  );
}

export function DishPhoto({
  source,
  pressed = false,
  height,
  rounded = 0,
}: {
  source: ImageSourcePropType;
  pressed?: boolean;
  height: number;
  rounded?: number;
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

  // expo-image wants its own ImageSource shape; a require() number satisfies both.
  const imgSource = source as unknown as ImageSource;

  return (
    <View style={{ height, borderRadius: rounded, overflow: 'hidden' }}>
      <Animated.View style={{ flex: 1, transform: [{ scale: zoom }] }}>
        <Image source={imgSource} style={StyleSheet.absoluteFill as any} contentFit="cover" transition={200} />
      </Animated.View>

      {/* Transparent through the top two-thirds; deepens to a warm espresso-brown from the midpoint down. */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          hearth.bg + '4D', // ~30%
          hearth.bg + 'E8', // ~91%
        ]}
        locations={[0, 0.56, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill as any}
        pointerEvents="none"
      />
      <View style={[StyleSheet.absoluteFill as any, { top: height * 0.56 }]} pointerEvents="none">
        <Grain />
      </View>
    </View>
  );
}

/** Shared text-shadow so overlay text stays legible if a photo's gradient runs lighter than intended. */
export const photoTextShadow = {
  textShadowColor: 'rgba(20,12,8,0.55)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;
