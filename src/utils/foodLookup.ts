// Builds a foodId -> Food lookup for a recipe's ingredients so the nutrition
// engine can resolve per-100g values. Reads from the local food cache.

import { getFoods } from '../db/foods';
import type { Food, Recipe } from '../types';

export async function buildFoodLookup(
  recipe: Pick<Recipe, 'ingredients'>
): Promise<(foodId: string) => Food | undefined> {
  const ids = recipe.ingredients
    .map((i) => i.foodId)
    .filter((id): id is string => !!id);
  const foods = await getFoods(Array.from(new Set(ids)));
  const map = new Map(foods.map((f) => [f.id, f]));
  return (foodId: string) => map.get(foodId);
}
