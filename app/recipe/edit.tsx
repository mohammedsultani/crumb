import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FoodSearchModal } from '../../src/components/FoodSearchModal';
import { Button, Card } from '../../src/components/ui';
import { getRecipe, newRecipeDraft, saveRecipe } from '../../src/db/recipes';
import { makeId } from '../../src/db/database';
import { colors, font, radius, spacing, weight } from '../../src/theme';
import type { Difficulty, Recipe, RecipeIngredient } from '../../src/types';
import { safeBack } from '../../src/utils/navigation';
import { toGrams } from '../../src/utils/units';

const SUGGESTED_TAGS = [
  'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Vegetarian', 'Vegan',
  'Gluten-free', 'Keto', 'Low-carb', 'High-protein', 'Dessert',
];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const COMMON_UNITS = ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'oz'];

export default function RecipeEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe>(() => newRecipeDraft());
  const [searchOpen, setSearchOpen] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (id) getRecipe(id).then((r) => r && setRecipe(r));
  }, [id]);

  const set = <K extends keyof Recipe>(key: K, value: Recipe[K]) =>
    setRecipe((r) => ({ ...r, [key]: value }));

  const toggleTag = (tag: string) =>
    setRecipe((r) => ({
      ...r,
      tags: r.tags.includes(tag) ? r.tags.filter((t) => t !== tag) : [...r.tags, tag],
    }));

  const addIngredientFromFood = (food: { id: string; name: string }) => {
    const ing: RecipeIngredient = {
      id: makeId('i_'),
      foodId: food.id,
      foodName: food.name,
      quantity: 100,
      unit: 'g',
      grams: 100,
    };
    setRecipe((r) => ({ ...r, ingredients: [...r.ingredients, ing] }));
    setSearchOpen(false);
  };

  const updateIngredient = (iid: string, patch: Partial<RecipeIngredient>) =>
    setRecipe((r) => ({
      ...r,
      ingredients: r.ingredients.map((i) => {
        if (i.id !== iid) return i;
        const next = { ...i, ...patch };
        next.grams = toGrams(next.quantity, next.unit);
        return next;
      }),
    }));

  const removeIngredient = (iid: string) =>
    setRecipe((r) => ({ ...r, ingredients: r.ingredients.filter((i) => i.id !== iid) }));

  const addStep = () =>
    setRecipe((r) => ({
      ...r,
      steps: [...r.steps, { id: makeId('s_'), order: r.steps.length, text: '' }],
    }));

  const updateStep = (sid: string, patch: Partial<Recipe['steps'][number]>) =>
    setRecipe((r) => ({
      ...r,
      steps: r.steps.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    }));

  const removeStep = (sid: string) =>
    setRecipe((r) => ({
      ...r,
      steps: r.steps.filter((s) => s.id !== sid).map((s, i) => ({ ...s, order: i })),
    }));

  const onSave = async () => {
    if (!recipe.title.trim()) {
      Alert.alert('Add a title', 'Give your recipe a name before saving.');
      return;
    }
    await saveRecipe({ ...recipe, steps: recipe.steps.map((s, i) => ({ ...s, order: i })) });
    safeBack('/library');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: isEditing ? 'Edit recipe' : 'New recipe' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 100 }}>
          {/* Basics */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={recipe.title}
            onChangeText={(t) => set('title', t)}
            placeholder="e.g. Chicken Rice Bowl"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />

          <View style={styles.grid}>
            <NumberField
              label="Servings"
              value={recipe.servings}
              onChange={(n) => set('servings', Math.max(1, n))}
            />
            <NumberField label="Prep (min)" value={recipe.prepMinutes} onChange={(n) => set('prepMinutes', n)} />
            <NumberField label="Cook (min)" value={recipe.cookMinutes} onChange={(n) => set('cookMinutes', n)} />
          </View>

          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.chipWrap}>
            {DIFFICULTIES.map((d) => (
              <Pressable
                key={d}
                onPress={() => set('difficulty', d)}
                style={[styles.chip, recipe.difficulty === d && styles.chipActive]}
              >
                <Text style={[styles.chipText, recipe.difficulty === d && styles.chipTextActive]}>
                  {d[0].toUpperCase() + d.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Tags</Text>
          <View style={styles.chipWrap}>
            {SUGGESTED_TAGS.map((t) => (
              <Pressable
                key={t}
                onPress={() => toggleTag(t)}
                style={[styles.chip, recipe.tags.includes(t) && styles.chipActive]}
              >
                <Text style={[styles.chipText, recipe.tags.includes(t) && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Ingredients */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Pressable onPress={() => setSearchOpen(true)} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.addBtnText}>Add food</Text>
            </Pressable>
          </View>
          {recipe.ingredients.length === 0 ? (
            <Card>
              <Text style={styles.hint}>
                Add ingredients from the USDA database so calories & macros calculate automatically.
              </Text>
            </Card>
          ) : (
            recipe.ingredients.map((ing) => (
              <Card key={ing.id} style={{ marginBottom: spacing.sm }}>
                <View style={styles.ingHeader}>
                  <Text style={styles.ingName} numberOfLines={2}>
                    {ing.foodName}
                  </Text>
                  <Pressable onPress={() => removeIngredient(ing.id)} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.textFaint} />
                  </Pressable>
                </View>
                <View style={styles.ingControls}>
                  <TextInput
                    value={String(ing.quantity)}
                    onChangeText={(t) => updateIngredient(ing.id, { quantity: parseFloat(t) || 0 })}
                    keyboardType="numeric"
                    style={styles.qtyInput}
                  />
                  <View style={styles.unitRow}>
                    {COMMON_UNITS.map((u) => (
                      <Pressable
                        key={u}
                        onPress={() => updateIngredient(ing.id, { unit: u })}
                        style={[styles.unitChip, ing.unit === u && styles.unitChipActive]}
                      >
                        <Text style={[styles.unitText, ing.unit === u && styles.unitTextActive]}>{u}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Text style={styles.gramsNote}>≈ {Math.round(ing.grams)} g used for nutrition</Text>
              </Card>
            ))
          )}

          {/* Steps */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Pressable onPress={addStep} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.addBtnText}>Add step</Text>
            </Pressable>
          </View>
          {recipe.steps.map((s, i) => (
            <Card key={s.id} style={{ marginBottom: spacing.sm }}>
              <View style={styles.ingHeader}>
                <Text style={styles.stepNum}>Step {i + 1}</Text>
                <Pressable onPress={() => removeStep(s.id)} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={colors.textFaint} />
                </Pressable>
              </View>
              <TextInput
                value={s.text}
                onChangeText={(t) => updateStep(s.id, { text: t })}
                placeholder="Describe this step…"
                placeholderTextColor={colors.textFaint}
                multiline
                style={styles.stepInput}
              />
              <View style={styles.timerField}>
                <Ionicons name="timer-outline" size={16} color={colors.textMuted} />
                <Text style={styles.timerLabel}>Timer (min)</Text>
                <TextInput
                  value={s.timerSeconds ? String(Math.round(s.timerSeconds / 60)) : ''}
                  onChangeText={(t) => {
                    const min = parseFloat(t);
                    updateStep(s.id, { timerSeconds: min > 0 ? Math.round(min * 60) : undefined });
                  }}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={colors.textFaint}
                  style={styles.timerInput}
                />
              </View>
            </Card>
          ))}

          {/* Notes */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>Personal notes</Text>
          <TextInput
            value={recipe.notes ?? ''}
            onChangeText={(t) => set('notes', t)}
            placeholder="Tweaks, substitutions, reminders…"
            placeholderTextColor={colors.textFaint}
            multiline
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          />
        </ScrollView>

        <View style={[styles.saveBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => safeBack('/library')} />
          <Button title="Save recipe" icon="checkmark" style={{ flex: 1.6 }} onPress={onSave} />
        </View>
      </KeyboardAvoidingView>

      <FoodSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={addIngredientFromFood}
      />
    </View>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.numField}>
      <Text style={styles.numLabel}>{label}</Text>
      <TextInput
        value={String(value)}
        onChangeText={(t) => onChange(parseInt(t, 10) || 0)}
        keyboardType="numeric"
        style={styles.numInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.small,
    fontWeight: weight.semibold as any,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.body,
    color: colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  grid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  numField: { flex: 1 },
  numLabel: { fontSize: font.tiny, color: colors.textMuted, marginBottom: 4 },
  numInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.body,
    color: colors.text,
    textAlign: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.small, color: colors.textMuted, fontWeight: weight.medium as any },
  chipTextActive: { color: colors.white },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: font.h3, fontWeight: weight.bold as any, color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  addBtnText: { color: colors.primary, fontWeight: weight.semibold as any, fontSize: font.small },
  hint: { color: colors.textMuted, fontSize: font.small, lineHeight: 20 },
  ingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ingName: { flex: 1, fontSize: font.body, fontWeight: weight.medium as any, color: colors.text, marginRight: spacing.sm },
  ingControls: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  qtyInput: {
    width: 64,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: font.body,
    color: colors.text,
    textAlign: 'center',
  },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 4 },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  unitChipActive: { backgroundColor: colors.primarySoft },
  unitText: { fontSize: font.small, color: colors.textMuted },
  unitTextActive: { color: colors.primaryDark, fontWeight: weight.semibold as any },
  gramsNote: { fontSize: font.tiny, color: colors.textFaint, marginTop: spacing.sm },
  stepNum: { fontSize: font.small, fontWeight: weight.semibold as any, color: colors.primaryDark },
  stepInput: {
    fontSize: font.body,
    color: colors.text,
    marginTop: spacing.sm,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  timerField: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  timerLabel: { fontSize: font.small, color: colors.textMuted },
  timerInput: {
    width: 56,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: font.small,
    color: colors.text,
    textAlign: 'center',
    marginLeft: 4,
  },
  saveBar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
