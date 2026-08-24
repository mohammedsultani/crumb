// A cuisine/algorithmic shelf, split into two pieces so the browse screen can
// place the header in a SectionList's sticky slot (real pin-then-release,
// native to the platform) while the card row scrolls underneath it:
//  - ShelfHeader: title + "See all", meant for renderSectionHeader
//  - ShelfCards: the horizontally-scrolling row, parallaxed against its own
//    scroll position, meant for renderItem
//  - ShelfRow: both together, for anywhere that doesn't need the split

import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CrumbTheme, fonts, space } from '../../theme/crumb';
import type { LibraryRecipe } from './types';
import { RecipeCard } from './RecipeCard';

export const CARD_WIDTH = 168;
export const CARD_HEIGHT = 226;
export const CARD_GAP = 14;

export function ShelfHeader({
  title,
  subtitle,
  theme,
  onSeeAll,
}: {
  title: string;
  subtitle?: string;
  theme: CrumbTheme;
  onSeeAll?: () => void;
}) {
  return (
    <View style={[styles.header, { backgroundColor: theme.bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAll} hitSlop={8}>
          <Text style={[styles.seeAllText, { color: theme.acc }]}>See all</Text>
          <Ionicons name="chevron-forward" size={13} color={theme.acc} />
        </Pressable>
      )}
    </View>
  );
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<LibraryRecipe>);

export function ShelfCards({
  recipes,
  theme,
  onOpenRecipe,
}: {
  recipes: LibraryRecipe[];
  theme: CrumbTheme;
  onOpenRecipe: (id: string) => void;
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  if (recipes.length === 0) return null;

  return (
    <AnimatedFlatList
      horizontal
      data={recipes}
      keyExtractor={(r) => r.id}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + CARD_GAP}
      contentContainerStyle={{ paddingHorizontal: space.xl, gap: CARD_GAP, paddingBottom: 26 }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
      scrollEventThrottle={16}
      // Only a handful of cards are ever on-screen at once in a horizontal
      // shelf — virtualize aggressively so a 100+ item row (e.g. "Quick
      // weeknight dinners" across the full library) doesn't mount every
      // card's photo, gradient, and grain overlay up front.
      initialNumToRender={6}
      maxToRenderPerBatch={4}
      windowSize={5}
      removeClippedSubviews
      renderItem={({ item: r, index: i }) => (
        <RecipeCard
          recipe={r}
          theme={theme}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          index={i}
          variant="shelf"
          onPress={() => onOpenRecipe(r.id)}
          scrollX={scrollX}
          cardStride={CARD_WIDTH + CARD_GAP}
        />
      )}
    />
  );
}

export function ShelfRow({
  title,
  subtitle,
  recipes,
  theme,
  onOpenRecipe,
  onSeeAll,
}: {
  title: string;
  subtitle?: string;
  recipes: LibraryRecipe[];
  theme: CrumbTheme;
  onOpenRecipe: (id: string) => void;
  onSeeAll?: () => void;
}) {
  if (recipes.length === 0) return null;
  return (
    <View>
      <ShelfHeader title={title} subtitle={subtitle} theme={theme} onSeeAll={onSeeAll} />
      <ShelfCards recipes={recipes} theme={theme} onOpenRecipe={onOpenRecipe} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingBottom: 12,
    paddingTop: 14,
  },
  title: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 24 },
  subtitle: { fontFamily: fonts.sansLight, fontSize: 12.5, marginTop: 2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 2 },
  seeAllText: { fontFamily: fonts.sansMedium, fontSize: 13 },
});
