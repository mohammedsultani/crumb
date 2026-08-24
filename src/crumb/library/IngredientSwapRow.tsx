// One ingredient line inside Cook Mode's "Before you start" screen. Tapping
// it (when a swap exists) opens the substitute picker. Once substituted, the
// original reads like it's been crossed off a handwritten list, with the
// replacement written in just beside it — a small, tactile moment rather
// than a mechanical field update.

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CrumbTheme, fonts } from '../../theme/crumb';
import { Crumb } from '../Visuals';
import type { LibraryIngredient, SubOption } from './types';

export function IngredientSwapRow({
  theme,
  ingredient,
  hasOptions,
  activeSub,
  onPressSwap,
}: {
  theme: CrumbTheme;
  ingredient: LibraryIngredient;
  hasOptions: boolean;
  activeSub?: SubOption;
  onPressSwap: () => void;
}) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeSub) {
      fade.setValue(0);
      Animated.spring(fade, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }).start();
    }
  }, [activeSub?.id, fade]);

  return (
    <Pressable
      onPress={hasOptions ? onPressSwap : undefined}
      style={[styles.row, hasOptions && { opacity: 1 }]}
    >
      <View style={{ marginTop: 8 }}>
        <Crumb size={5} color={theme.acc} rotate={0} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.text, { color: theme.ink }, activeSub && { textDecorationLine: 'line-through', color: theme.muted }]}>
          {ingredient.text}
        </Text>
        {activeSub && (
          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateX: fade.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
              marginTop: 4,
            }}
          >
            <View style={styles.swapLine}>
              <Ionicons name="arrow-forward" size={12} color={theme.acc} />
              <Text style={[styles.swapText, { color: theme.acc }]}>{activeSub.label}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.accSoft }]}>
              <Text style={[styles.tagText, { color: theme.acc }]}>
                Substituted · {activeSub.kcalDelta > 0 ? '+' : ''}
                {activeSub.kcalDelta} kcal
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
      {hasOptions && (
        <View style={[styles.swapBtn, { borderColor: theme.line, backgroundColor: activeSub ? theme.accSoft : theme.surf }]}>
          <Ionicons name="swap-horizontal" size={14} color={activeSub ? theme.acc : theme.muted} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', paddingVertical: 8 },
  text: { fontFamily: fonts.sansLight, fontSize: 15, lineHeight: 21 },
  swapLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swapText: { fontFamily: fonts.sansMedium, fontSize: 14 },
  tag: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontFamily: fonts.sansMedium, fontSize: 10.5 },
  swapBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
