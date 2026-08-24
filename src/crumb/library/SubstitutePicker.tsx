// Ranked substitute suggestions for one ingredient — the picker Cook Mode
// opens when you tap an ingredient's swap affordance. Dietary matches surface
// first (per the user's stored preferences), pantry and regional swaps
// follow, and "distant stand-in" swaps are clearly flagged, not hidden.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrumbSheet } from '../Sheets';
import { fonts, space, hearth } from '../../theme/crumb';
import type { CrumbTheme } from '../../theme/crumb';
import type { SubOption } from './types';

const CATEGORY_LABEL: Record<SubOption['category'], string> = {
  pantry: 'Pantry swap',
  dietary: 'Dietary swap',
  regional: 'Regional swap',
};

export function SubstitutePicker({
  visible,
  theme,
  ingredientText,
  options,
  activeId,
  onSelect,
  onClear,
  onClose,
}: {
  visible: boolean;
  theme: CrumbTheme;
  ingredientText: string;
  options: SubOption[];
  activeId?: string;
  onSelect: (opt: SubOption) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <CrumbSheet visible={visible} theme={theme} onClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 30 }}>
        <Text style={[styles.eyebrow, { color: theme.muted }]}>SWAP FOR</Text>
        <Text style={[styles.ingredient, { color: theme.ink }]} numberOfLines={2}>
          {ingredientText}
        </Text>

        {activeId && (
          <Pressable onPress={onClear} style={[styles.clearRow, { borderColor: theme.line }]}>
            <Ionicons name="refresh" size={15} color={theme.muted} />
            <Text style={[styles.clearText, { color: theme.muted }]}>Use the original ingredient</Text>
          </Pressable>
        )}

        <View style={{ gap: 10, marginTop: 14 }}>
          {options.map((opt) => {
            const on = activeId === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => onSelect(opt)}
                style={[
                  styles.card,
                  { backgroundColor: theme.surf, borderColor: on ? theme.acc : theme.line },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.label, { color: theme.ink }]}>{opt.label}</Text>
                  {on && <Ionicons name="checkmark-circle" size={18} color={theme.acc} />}
                </View>
                <Text style={[styles.note, { color: theme.muted }]}>{opt.note}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: theme.surf2 }]}>
                    <Text style={[styles.badgeText, { color: theme.muted }]}>{CATEGORY_LABEL[opt.category]}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: theme.surf2 }]}>
                    <Text style={[styles.badgeText, { color: theme.muted }]}>
                      {opt.kcalDelta > 0 ? '+' : ''}
                      {opt.kcalDelta} kcal
                    </Text>
                  </View>
                  {opt.imperfect && (
                    <View style={[styles.badge, { backgroundColor: hearth.ember + '22' }]}>
                      <Text style={[styles.badgeText, { color: '#B85A2A' }]}>Distant stand-in</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </CrumbSheet>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  ingredient: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 27, marginBottom: 14 },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  clearText: { fontFamily: fonts.sans, fontSize: 13 },
  card: { borderWidth: 1.5, borderRadius: 16, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { fontFamily: fonts.sansMedium, fontSize: 15, flex: 1 },
  note: { fontFamily: fonts.sansLight, fontSize: 13, lineHeight: 19, marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontFamily: fonts.sansMedium, fontSize: 10.5 },
});
