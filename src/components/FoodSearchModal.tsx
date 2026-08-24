// USDA food search as an inline modal. Returns a selected Food (per-100g
// nutrition) and caches it locally on selection. Used by the recipe editor
// (ingredients) and the food log (search-a-food).

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recentFoods, upsertFood } from '../db/foods';
import { searchUsdaFoods } from '../services/usda';
import { colors, font, radius, spacing, weight } from '../theme';
import type { Food } from '../types';

export function FoodSearchModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (food: Food) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [recents, setRecents] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults([]);
      setError(null);
      recentFoods().then(setRecents);
    }
  }, [visible]);

  // Debounced USDA search.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const { foods, error } = await searchUsdaFoods(query, controller.signal);
      if (!controller.signal.aborted) {
        setResults(foods);
        setError(error ?? null);
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  const pick = async (food: Food) => {
    await upsertFood(food);
    onSelect(food);
  };

  const showRecents = !query.trim() && recents.length > 0;
  const listData = showRecents ? recents : results;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Find a food</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search USDA foods (e.g. chicken breast)"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoFocus
          />
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          data={listData}
          keyExtractor={(f) => f.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          ListHeaderComponent={
            showRecents ? <Text style={styles.recentLabel}>Recent foods</Text> : null
          }
          ListEmptyComponent={
            !loading && query.trim() && !error ? (
              <Text style={styles.hint}>No results. Try a simpler term.</Text>
            ) : !query.trim() && recents.length === 0 ? (
              <Text style={styles.hint}>Start typing to search the USDA food database.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => pick(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.foodMeta}>
                  {item.brand ? `${item.brand} · ` : ''}
                  {Math.round(item.per100g.calories)} kcal · {Math.round(item.per100g.protein)}P{' '}
                  {Math.round(item.per100g.carbs)}C {Math.round(item.per100g.fat)}F
                  <Text style={styles.per100}> / 100g</Text>
                </Text>
              </View>
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  title: { fontSize: font.h3, fontWeight: weight.bold as any, color: colors.text },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  input: { flex: 1, marginLeft: spacing.sm, fontSize: font.body, color: colors.text },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCF3E4',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: { color: colors.textMuted, fontSize: font.small, flex: 1 },
  recentLabel: {
    fontSize: font.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: weight.semibold as any,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  foodName: { fontSize: font.body, color: colors.text, fontWeight: weight.medium as any },
  foodMeta: { fontSize: font.small, color: colors.textMuted, marginTop: 3 },
  per100: { color: colors.textFaint },
  hint: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl, lineHeight: 20 },
});
