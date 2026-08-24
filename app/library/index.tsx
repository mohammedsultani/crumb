import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ALL_RECIPES,
  flavorRow,
  healthyBreakfastRow,
  healthyRow,
  occasionRow,
  popularRow,
  quickRow,
  randomRecipe,
  recipesByCuisine,
} from '../../src/crumb/library/content';
import { applyFilters, FilterId } from '../../src/crumb/library/filters';
import { FilterChips } from '../../src/crumb/library/FilterChips';
import { ShelfCards, ShelfHeader } from '../../src/crumb/library/ShelfRow';
import { ShuffleButton } from '../../src/crumb/library/ShuffleButton';
import { CUISINE_LABELS, CUISINE_TAGLINE } from '../../src/crumb/library/types';
import type { Cuisine, LibraryRecipe } from '../../src/crumb/library/types';
import { loadUserRecipesAsLibrary } from '../../src/crumb/library/userRecipesAsLibrary';
import { fonts, space, useTheme } from '../../src/theme/crumb';
import { safeBack } from '../../src/utils/navigation';

interface Section {
  key: string;
  title: string;
  subtitle?: string;
  recipes: LibraryRecipe[];
  seeAll?: () => void;
}

const TOOLBAR_HEIGHT = 62;

// Shelf order on the browse screen — new cuisines slot in after the launch three.
const CUISINE_ORDER: Cuisine[] = [
  'chinese',
  'desi',
  'fastfood',
  'italian',
  'mexican',
  'japanese',
  'korean',
  'thai',
  'vietnamese',
  'middleeastern',
  'american',
  'spanish',
  'filipino',
  'moroccan',
  'caribbean',
  'french',
  'indonesian',
  'german',
  'ethiopian',
  'turkish',
  'persian',
  'portuguese',
  'peruvian',
  'brazilian',
  'westafrican',
  'easterneuropean',
  'greek',
  'cuban',
  'scandinavian',
  'argentinian',
  'southafrican',
  'srilankan',
];

export default function LibraryBrowseScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<Set<FilterId>>(new Set());
  const [yours, setYours] = useState<LibraryRecipe[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadUserRecipesAsLibrary().then(setYours);
    }, [])
  );

  const toggle = (id: FilterId) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openRecipe = (id: string) => router.push({ pathname: '/library/[id]', params: { id } });
  const openCollection = (cuisine: string) =>
    router.push({ pathname: '/library/collection/[cuisine]', params: { cuisine } });

  const visible = useMemo(() => {
    const sections: Section[] = [
      { key: 'popular', title: 'Popular this week', recipes: applyFilters(popularRow(), active) },
      {
        key: 'quick',
        title: 'Quick weeknight dinners',
        subtitle: 'Thirty minutes or less',
        recipes: applyFilters(quickRow(), active),
      },
      {
        key: 'healthy-breakfast',
        title: 'Healthy breakfasts',
        subtitle: 'Light, protein-forward, and easy on the fat',
        recipes: applyFilters(healthyBreakfastRow(), active),
      },
      {
        key: 'healthy',
        title: 'Healthy picks',
        subtitle: 'Moderate calories, real protein, nothing excessive',
        recipes: applyFilters(healthyRow(), active),
      },
      {
        key: 'spicy',
        title: 'Spicy favorites',
        subtitle: 'Bring the heat',
        recipes: applyFilters(flavorRow('spicy'), active),
      },
      {
        key: 'sweet',
        title: 'Something sweet',
        subtitle: 'Desserts and sweet-leaning bites',
        recipes: applyFilters(flavorRow('sweet'), active),
      },
      {
        key: 'party',
        title: 'Party-ready',
        subtitle: 'Built to feed a table',
        recipes: applyFilters(occasionRow('party'), active),
      },
      ...CUISINE_ORDER.map((cuisine) => ({
        key: cuisine,
        title: CUISINE_LABELS[cuisine],
        subtitle: CUISINE_TAGLINE[cuisine],
        recipes: applyFilters(recipesByCuisine(cuisine), active),
        seeAll: () => openCollection(cuisine),
      })),
    ];
    if (yours.length > 0) {
      sections.push({ key: 'yours', title: 'Yours', subtitle: 'From your own kitchen', recipes: yours });
    }
    return sections.filter((s) => s.recipes.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, yours]);
  const noMatches = active.size > 0 && visible.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SectionList
        sections={visible.map((s) => ({ ...s, data: [s] }))}
        keyExtractor={(item) => (item as Section).key}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 56, paddingHorizontal: space.xl }}>
            <Text style={[styles.title, { color: theme.ink }]}>The library</Text>
            <Text style={[styles.tagline, { color: theme.muted }]}>
              Nothing to plan, just something to want tonight.
            </Text>
            <View style={{ marginTop: 16, marginBottom: TOOLBAR_HEIGHT - 24 }}>
              <ShuffleButton
                theme={theme}
                onShuffle={() =>
                  openRecipe(randomRecipe(active.size ? applyFilters(ALL_RECIPES, active) : ALL_RECIPES).id)
                }
              />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => {
          const s = section as unknown as Section;
          return <ShelfHeader title={s.title} subtitle={s.subtitle} theme={theme} onSeeAll={s.seeAll} />;
        }}
        renderItem={({ section }) => {
          const s = section as unknown as Section;
          return <ShelfCards recipes={s.recipes} theme={theme} onOpenRecipe={openRecipe} />;
        }}
        ListEmptyComponent={
          noMatches ? (
            <Text style={[styles.empty, { color: theme.muted }]}>
              Nothing matches that combination yet — try loosening a filter.
            </Text>
          ) : null
        }
      />

      {/* Persistent floating toolbar: back button + filters, independent of scroll. */}
      <View style={[styles.toolbar, { top: insets.top, backgroundColor: theme.bg }]}>
        <View style={styles.toolbarTop}>
          <Pressable onPress={() => safeBack('/')} style={[styles.backBtn, { backgroundColor: theme.surf, borderColor: theme.line }]}>
            <Ionicons name="chevron-back" size={18} color={theme.ink} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/recipe/edit')}
            style={[styles.backBtn, { backgroundColor: theme.surf, borderColor: theme.line }]}
          >
            <Ionicons name="add" size={20} color={theme.ink} />
          </Pressable>
        </View>
      </View>
      <View style={[styles.filterOverlay, { top: insets.top + 52, backgroundColor: theme.bg }]}>
        <FilterChips theme={theme} active={active} onToggle={toggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 34, letterSpacing: -0.6 },
  tagline: { fontFamily: fonts.sansLight, fontSize: 15, marginTop: 6, lineHeight: 21 },
  empty: { fontFamily: fonts.sansLight, fontSize: 14, textAlign: 'center', marginTop: 40, paddingHorizontal: space.xl },
  toolbar: { position: 'absolute', left: 0, right: 0, zIndex: 10, paddingHorizontal: space.xl, paddingTop: 8 },
  toolbarTop: { flexDirection: 'row', justifyContent: 'space-between' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOverlay: { position: 'absolute', left: 0, right: 0, zIndex: 9 },
});
