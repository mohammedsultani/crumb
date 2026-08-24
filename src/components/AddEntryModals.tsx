// The three ways to add a food-log entry, as lightweight modals:
//  1. RecipePickerModal  — log a recipe from your library
//  2. FoodPortionModal   — set a gram portion for a USDA food
//  3. ManualEntryModal   — quick-add a name + calories/macros
// The food log screen orchestrates which one is open.

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFoods } from '../db/foods';
import { listRecipes } from '../db/recipes';
import { colors, font, radius, spacing, weight } from '../theme';
import type { Food, Nutrition, Recipe } from '../types';
import { perServingNutrition, scaleNutrition } from '../utils/nutrition';
import { Button } from './ui';

// ---------- 1. Recipe picker ----------

export function RecipePickerModal({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (recipe: Recipe, perServing: Nutrition) => void;
}) {
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [lookup, setLookup] = useState<(id: string) => Food | undefined>(() => () => undefined);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const rs = await listRecipes();
      const ids = Array.from(
        new Set(rs.flatMap((r) => r.ingredients.map((i) => i.foodId).filter((x): x is string => !!x)))
      );
      const foods = await getFoods(ids);
      const map = new Map(foods.map((f) => [f.id, f]));
      setRecipes(rs);
      setLookup(() => (id: string) => map.get(id));
    })();
  }, [visible]);

  return (
    <SheetShell visible={visible} title="Log a recipe" onClose={onClose}>
      <FlatList
        data={recipes}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        ListEmptyComponent={<Text style={styles.hint}>No recipes yet. Create one in the Recipes tab.</Text>}
        renderItem={({ item }) => {
          const per = perServingNutrition(item, lookup);
          return (
            <Pressable style={styles.row} onPress={() => onPick(item, per)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>{Math.round(per.calories)} kcal / serving</Text>
              </View>
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </Pressable>
          );
        }}
      />
    </SheetShell>
  );
}

// ---------- 2. Food portion ----------

export function FoodPortionModal({
  visible,
  food,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  food: Food | null;
  onClose: () => void;
  onConfirm: (name: string, nutrition: Nutrition, foodId: string) => void;
}) {
  const [grams, setGrams] = useState('100');
  useEffect(() => {
    if (visible) setGrams('100');
  }, [visible, food]);

  if (!food) return null;
  const g = parseFloat(grams) || 0;
  const nutrition = scaleNutrition(food.per100g, g / 100);

  return (
    <SheetShell visible={visible} title={food.name} onClose={onClose}>
      <Text style={styles.big}>{Math.round(nutrition.calories)} kcal</Text>
      <Text style={styles.rowMeta}>
        {Math.round(nutrition.protein)}P · {Math.round(nutrition.carbs)}C · {Math.round(nutrition.fat)}F
      </Text>

      <Text style={styles.fieldLabel}>Portion (grams)</Text>
      <View style={styles.portionRow}>
        {[50, 100, 150, 200].map((v) => (
          <Pressable key={v} onPress={() => setGrams(String(v))} style={styles.portionChip}>
            <Text style={styles.portionChipText}>{v}g</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={grams}
        onChangeText={setGrams}
        keyboardType="numeric"
        style={styles.input}
        placeholder="grams"
        placeholderTextColor={colors.textFaint}
      />
      <View style={{ marginTop: spacing.lg }}>
        <Button
          title="Add to log"
          icon="checkmark"
          size="lg"
          onPress={() => onConfirm(food.name, nutrition, food.id)}
        />
      </View>
    </SheetShell>
  );
}

// ---------- 3. Manual quick-add ----------

export function ManualEntryModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string, nutrition: Nutrition) => void;
}) {
  const [name, setName] = useState('');
  const [cals, setCals] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setCals('');
      setP('');
      setC('');
      setF('');
    }
  }, [visible]);

  const submit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), {
      calories: parseFloat(cals) || 0,
      protein: parseFloat(p) || 0,
      carbs: parseFloat(c) || 0,
      fat: parseFloat(f) || 0,
    });
  };

  return (
    <SheetShell visible={visible} title="Quick add" onClose={onClose}>
      <Text style={styles.fieldLabel}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Latte"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />
      <Text style={styles.fieldLabel}>Calories</Text>
      <TextInput
        value={cals}
        onChangeText={setCals}
        keyboardType="numeric"
        placeholder="kcal"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />
      <View style={styles.macroGrid}>
        <MiniField label="Protein (g)" value={p} onChange={setP} />
        <MiniField label="Carbs (g)" value={c} onChange={setC} />
        <MiniField label="Fat (g)" value={f} onChange={setF} />
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Add to log" icon="checkmark" size="lg" onPress={submit} />
      </View>
    </SheetShell>
  );
}

function MiniField({ label, value, onChange }: { label: string; value: string; onChange: (t: string) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.miniLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={colors.textFaint}
        style={[styles.input, { textAlign: 'center' }]}
      />
    </View>
  );
}

// ---------- shared shell ----------

function SheetShell({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle} numberOfLines={1}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>
        {children}
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
    maxHeight: '80%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sheetTitle: { fontSize: font.h3, fontWeight: weight.bold as any, color: colors.text, flex: 1, marginRight: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { fontSize: font.body, color: colors.text, fontWeight: weight.medium as any },
  rowMeta: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  big: { fontSize: 34, fontWeight: weight.bold as any, color: colors.text },
  fieldLabel: { fontSize: font.small, fontWeight: weight.semibold as any, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  portionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  portionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  portionChipText: { color: colors.primaryDark, fontWeight: weight.semibold as any, fontSize: font.small },
  macroGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  miniLabel: { fontSize: font.tiny, color: colors.textMuted, marginBottom: 4 },
  hint: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.lg, lineHeight: 20 },
});
