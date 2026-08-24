// Reusable nutrition displays shared by recipe detail and the food log.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing, weight } from '../theme';
import type { Nutrition } from '../types';
import { macroCaloriePercents } from '../utils/nutrition';

/** Big calorie number with a macro breakdown row underneath. */
export function NutritionSummary({ n, label }: { n: Nutrition; label?: string }) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.calRow}>
        <Text style={styles.calNumber}>{Math.round(n.calories)}</Text>
        <Text style={styles.calUnit}>kcal</Text>
      </View>
      <MacroRow n={n} />
    </View>
  );
}

/** Three macro figures with a proportional stacked bar. */
export function MacroRow({ n }: { n: Nutrition }) {
  const pct = macroCaloriePercents(n);
  return (
    <View>
      <View style={styles.macros}>
        <Macro label="Protein" grams={n.protein} color={colors.protein} />
        <Macro label="Carbs" grams={n.carbs} color={colors.carbs} />
        <Macro label="Fat" grams={n.fat} color={colors.fat} />
      </View>
      <View style={styles.stack}>
        <View style={{ flex: Math.max(0.001, pct.protein), backgroundColor: colors.protein }} />
        <View style={{ flex: Math.max(0.001, pct.carbs), backgroundColor: colors.carbs }} />
        <View style={{ flex: Math.max(0.001, pct.fat), backgroundColor: colors.fat }} />
      </View>
    </View>
  );
}

function Macro({ label, grams, color }: { label: string; grams: number; color: string }) {
  return (
    <View style={styles.macro}>
      <View style={styles.macroTop}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>{Math.round(grams)}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: weight.semibold as any,
    marginBottom: 2,
  },
  calRow: { flexDirection: 'row', alignItems: 'baseline' },
  calNumber: { fontSize: 40, fontWeight: weight.bold as any, color: colors.text },
  calUnit: { fontSize: font.body, color: colors.textMuted, marginLeft: 6 },
  macros: { flexDirection: 'row', marginTop: spacing.sm },
  macro: { flex: 1 },
  macroTop: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  macroLabel: { fontSize: font.small, color: colors.textMuted },
  macroValue: { fontSize: font.body, fontWeight: weight.semibold as any, color: colors.text, marginTop: 2 },
  stack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
});
