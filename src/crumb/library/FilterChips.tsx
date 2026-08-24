// Elastic filter chips — each one springs past its resting size and settles
// back when tapped, so toggling a filter feels like it "snaps into place"
// rather than just flipping a boolean.

import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { CrumbTheme, fonts, space } from '../../theme/crumb';
import { FILTER_CHIPS, FilterId } from './filters';

export function FilterChips({
  theme,
  active,
  onToggle,
}: {
  theme: CrumbTheme;
  active: Set<FilterId>;
  onToggle: (id: FilterId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: space.xl, gap: 8, paddingVertical: 4 }}
      style={{ marginBottom: 4 }}
    >
      {FILTER_CHIPS.map((chip) => (
        <Chip key={chip.id} label={chip.label} theme={theme} on={active.has(chip.id)} onPress={() => onToggle(chip.id)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, theme, on, onPress }: { label: string; theme: CrumbTheme; on: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    scale.setValue(0.9);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 220 }).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.chip,
          { transform: [{ scale }] },
          on ? { backgroundColor: theme.acc, borderColor: theme.acc } : { backgroundColor: theme.surf, borderColor: theme.line },
        ]}
      >
        <Text style={[styles.text, { color: on ? '#FFF7EE' : theme.muted }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: { fontFamily: fonts.sansMedium, fontSize: 13 },
});
