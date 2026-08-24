// "Surprise me" — a hand-drawn little die that tumbles (rotate + bounce) when
// tapped, for the moment someone genuinely doesn't know what to cook.

import React, { useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { CrumbTheme, fonts } from '../../theme/crumb';

// Five-pip die face laid out as fractional positions within the die square.
const PIPS = [
  [0.24, 0.24],
  [0.76, 0.24],
  [0.5, 0.5],
  [0.24, 0.76],
  [0.76, 0.76],
];

export function ShuffleButton({
  theme,
  onShuffle,
  label = 'Surprise me',
}: {
  theme: CrumbTheme;
  onShuffle: () => void;
  label?: string;
}) {
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const roll = () => {
    rotate.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(rotate, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3.5, tension: 160 }),
        ]),
      ]),
    ]).start();
    onShuffle();
  };

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '210deg'] });

  return (
    <Pressable onPress={roll} style={[styles.wrap, { backgroundColor: theme.surf, borderColor: theme.line }]}>
      <Animated.View
        style={[
          styles.die,
          { backgroundColor: theme.accSoft, borderColor: theme.acc, transform: [{ rotate: spin }, { scale }] },
        ]}
      >
        {PIPS.map(([x, y], i) => (
          <View
            key={i}
            style={[
              styles.pip,
              { backgroundColor: theme.acc, left: `${x * 100}%`, top: `${y * 100}%`, marginLeft: -2.5, marginTop: -2.5 },
            ]}
          />
        ))}
      </Animated.View>
      <Text style={[styles.label, { color: theme.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  die: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  pip: { position: 'absolute', width: 5, height: 5, borderRadius: 2.5 },
  label: { fontFamily: fonts.sansMedium, fontSize: 13 },
});
