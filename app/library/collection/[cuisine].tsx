import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipesByCuisine, randomRecipe } from '../../../src/crumb/library/content';
import { applyFilters, FilterId } from '../../../src/crumb/library/filters';
import { FilterChips } from '../../../src/crumb/library/FilterChips';
import { MasonryGrid } from '../../../src/crumb/library/MasonryGrid';
import { ShuffleButton } from '../../../src/crumb/library/ShuffleButton';
import { CUISINE_LABELS, CUISINE_TAGLINE, Cuisine } from '../../../src/crumb/library/types';
import { fonts, space, useTheme } from '../../../src/theme/crumb';
import { safeBack } from '../../../src/utils/navigation';

export default function CollectionScreen() {
  const { cuisine } = useLocalSearchParams<{ cuisine: Cuisine }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [active, setActive] = useState<Set<FilterId>>(new Set());

  const all = useMemo(() => recipesByCuisine(cuisine), [cuisine]);
  const filtered = useMemo(() => applyFilters(all, active), [all, active]);

  const toggle = (id: FilterId) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openRecipe = (id: string) => router.push({ pathname: '/library/[id]', params: { id } });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={{ paddingTop: insets.top + 56, paddingHorizontal: space.xl, marginBottom: 4 }}>
          <Text style={[styles.title, { color: theme.ink }]}>{CUISINE_LABELS[cuisine] ?? 'Collection'}</Text>
          <Text style={[styles.tagline, { color: theme.muted }]}>{CUISINE_TAGLINE[cuisine]}</Text>
          <Text style={[styles.count, { color: theme.muted }]}>
            {filtered.length} of {all.length} dishes
          </Text>
          <View style={{ marginTop: 14 }}>
            <ShuffleButton
              theme={theme}
              label="Pick for me"
              onShuffle={() => openRecipe(randomRecipe(filtered.length ? filtered : all).id)}
            />
          </View>
        </View>

        <View style={{ marginTop: 18, marginBottom: 16 }}>
          <FilterChips theme={theme} active={active} onToggle={toggle} />
        </View>

        {filtered.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>
            Nothing matches that combination yet — try loosening a filter.
          </Text>
        ) : (
          <MasonryGrid recipes={filtered} theme={theme} screenWidth={width} onOpenRecipe={openRecipe} />
        )}
      </ScrollView>

      <View style={[styles.backBtnWrap, { top: insets.top + 8 }]}>
        <Pressable onPress={() => safeBack('/library')} style={[styles.backBtn, { backgroundColor: theme.surf, borderColor: theme.line }]}>
          <Ionicons name="chevron-back" size={18} color={theme.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 32, letterSpacing: -0.5 },
  tagline: { fontFamily: fonts.sansLight, fontSize: 14.5, marginTop: 6, lineHeight: 20 },
  count: { fontFamily: fonts.sans, fontSize: 12.5, marginTop: 10 },
  empty: { fontFamily: fonts.sansLight, fontSize: 14, textAlign: 'center', marginTop: 30, paddingHorizontal: space.xl },
  backBtnWrap: { position: 'absolute', left: space.xl, zIndex: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
