// A two-column staggered grid for "See all" collection pages. Card heights
// vary a little with how much there is to say about each dish, then get
// greedily bin-packed into the shorter column — real masonry, not just a
// decorative zig-zag.

import React, { useMemo } from 'react';
import { View } from 'react-native';
import { CrumbTheme, space } from '../../theme/crumb';
import type { LibraryRecipe } from './types';
import { RecipeCard } from './RecipeCard';

const GAP = 14;

function estimateHeight(r: LibraryRecipe): number {
  const base = 210;
  const bonus = r.description.length > 80 ? 28 : r.description.length > 50 ? 14 : 0;
  return base + bonus;
}

export function MasonryGrid({
  recipes,
  theme,
  screenWidth,
  onOpenRecipe,
}: {
  recipes: LibraryRecipe[];
  theme: CrumbTheme;
  screenWidth: number;
  onOpenRecipe: (id: string) => void;
}) {
  const colWidth = (screenWidth - space.xl * 2 - GAP) / 2;

  const columns = useMemo(() => {
    const cols: { recipe: LibraryRecipe; index: number; height: number }[][] = [[], []];
    const heights = [0, 0];
    recipes.forEach((r, i) => {
      const h = estimateHeight(r);
      const target = heights[0] <= heights[1] ? 0 : 1;
      cols[target].push({ recipe: r, index: i, height: h });
      heights[target] += h + GAP;
    });
    return cols;
  }, [recipes]);

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: space.xl, gap: GAP }}>
      {columns.map((col, ci) => (
        <View key={ci} style={{ flex: 1, gap: GAP }}>
          {col.map(({ recipe, index, height }) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              theme={theme}
              width={colWidth}
              height={height}
              index={index}
              variant="grid"
              onPress={() => onOpenRecipe(recipe.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
