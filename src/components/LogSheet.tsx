// Bottom sheet for logging something to the food diary with minimal taps.
// Defaults (today + time-appropriate meal + 1 serving) mean it's often a single
// confirming tap. Reused for recipes, USDA foods, and manual entries.

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing, weight } from '../theme';
import type { MealType, Nutrition } from '../types';
import { addDays, friendlyDate, todayKey } from '../utils/date';
import { guessMeal } from '../services/logging';
import { Button } from './ui';

const MEALS: { key: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: 'cafe' },
  { key: 'lunch', label: 'Lunch', icon: 'fast-food' },
  { key: 'dinner', label: 'Dinner', icon: 'restaurant' },
  { key: 'snacks', label: 'Snacks', icon: 'nutrition' },
];

export interface LogSheetResult {
  meal: MealType;
  servings: number;
  date: string;
}

export function LogSheet({
  visible,
  title,
  perServing,
  confirmLabel = 'Log it',
  initialMeal,
  initialDate,
  initialServings = 1,
  servingLabel = 'Servings',
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  perServing: Nutrition;
  confirmLabel?: string;
  initialMeal?: MealType;
  initialDate?: string;
  initialServings?: number;
  servingLabel?: string;
  onClose: () => void;
  onConfirm: (r: LogSheetResult) => void;
}) {
  const [meal, setMeal] = useState<MealType>(initialMeal ?? guessMeal());
  const [servings, setServings] = useState(initialServings);
  const [date, setDate] = useState(initialDate ?? todayKey());

  useEffect(() => {
    if (visible) {
      setMeal(initialMeal ?? guessMeal());
      setServings(initialServings);
      setDate(initialDate ?? todayKey());
    }
  }, [visible, initialMeal, initialDate, initialServings]);

  const totalCals = Math.round(perServing.calories * servings);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{totalCals} kcal total</Text>

        <Text style={styles.section}>Meal</Text>
        <View style={styles.mealRow}>
          {MEALS.map((m) => {
            const on = meal === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMeal(m.key)}
                style={[styles.mealBtn, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Ionicons name={m.icon} size={18} color={on ? colors.white : colors.textMuted} />
                <Text style={[styles.mealLabel, on && { color: colors.white }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.section}>{servingLabel}</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setServings((s) => Math.max(0.5, Math.round((s - 0.5) * 2) / 2))} style={styles.stepBtn}>
              <Ionicons name="remove" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.stepValue}>{servings}</Text>
            <Pressable onPress={() => setServings((s) => Math.round((s + 0.5) * 2) / 2)} style={styles.stepBtn}>
              <Ionicons name="add" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.section}>Day</Text>
          <View style={styles.dayRow}>
            <Pressable onPress={() => setDate((d) => addDays(d, -1))} style={styles.stepBtn}>
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.dayLabel}>{friendlyDate(date)}</Text>
            <Pressable
              onPress={() => setDate((d) => (d < todayKey() ? addDays(d, 1) : d))}
              style={styles.stepBtn}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Button
            title={confirmLabel}
            icon="checkmark"
            size="lg"
            onPress={() => onConfirm({ meal, servings, date })}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { fontSize: font.h3, fontWeight: weight.bold as any, color: colors.text },
  subtitle: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  section: {
    fontSize: font.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: weight.semibold as any,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  mealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mealLabel: { marginLeft: 6, fontSize: font.small, color: colors.textMuted, fontWeight: weight.medium as any },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { minWidth: 44, textAlign: 'center', fontSize: font.h3, fontWeight: weight.bold as any, color: colors.text },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  dayLabel: { minWidth: 90, textAlign: 'center', fontSize: font.body, fontWeight: weight.semibold as any, color: colors.text },
});
