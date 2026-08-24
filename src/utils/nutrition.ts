// The nutrition calculation engine.
// Given a recipe's ingredients (each linked to a Food with per-100g nutrition)
// it computes total nutrition, per-serving nutrition, and rescales for the
// serving-size scaler. This is the math that makes "auto nutrition" work.

import type { Food, Nutrition, Recipe, RecipeIngredient } from '../types';

export const EMPTY_NUTRITION: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

export function scaleNutrition(n: Nutrition, factor: number): Nutrition {
  return {
    calories: n.calories * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
  };
}

/** Nutrition contributed by one ingredient, using its resolved gram weight. */
export function nutritionForIngredient(
  ing: RecipeIngredient,
  foodLookup: (foodId: string) => Food | undefined
): Nutrition {
  if (!ing.foodId) return EMPTY_NUTRITION;
  const food = foodLookup(ing.foodId);
  if (!food) return EMPTY_NUTRITION;
  const factor = ing.grams / 100; // per100g basis
  return scaleNutrition(food.per100g, factor);
}

/** Total nutrition for the whole recipe (all servings combined). */
export function totalRecipeNutrition(
  ingredients: RecipeIngredient[],
  foodLookup: (foodId: string) => Food | undefined
): Nutrition {
  return ingredients.reduce(
    (acc, ing) => addNutrition(acc, nutritionForIngredient(ing, foodLookup)),
    { ...EMPTY_NUTRITION }
  );
}

/** Nutrition for a single serving. */
export function perServingNutrition(
  recipe: Pick<Recipe, 'servings' | 'ingredients'>,
  foodLookup: (foodId: string) => Food | undefined
): Nutrition {
  const total = totalRecipeNutrition(recipe.ingredients, foodLookup);
  const servings = Math.max(1, recipe.servings);
  return scaleNutrition(total, 1 / servings);
}

/**
 * Scale an ingredient's quantity/grams for a new serving count.
 * Used by the serving-size scaler on the recipe screen.
 */
export function scaleIngredient(
  ing: RecipeIngredient,
  fromServings: number,
  toServings: number
): RecipeIngredient {
  const factor = toServings / Math.max(1, fromServings);
  return {
    ...ing,
    quantity: round(ing.quantity * factor, 2),
    grams: round(ing.grams * factor, 1),
  };
}

// ---- Formatting helpers used across the UI ----

export const round = (n: number, dp = 0) => {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
};

export const kcal = (n: number) => `${Math.round(n)} kcal`;
export const grams = (n: number) => `${round(n, 1)} g`;

/** Format a Nutrition object into a compact "C / P / C / F" summary string. */
export function formatMacros(n: Nutrition): string {
  return `${Math.round(n.calories)} kcal · ${round(n.protein)}P ${round(n.carbs)}C ${round(n.fat)}F`;
}

/** Percentage of calories from each macro (protein/carbs = 4, fat = 9 kcal/g). */
export function macroCaloriePercents(n: Nutrition): { protein: number; carbs: number; fat: number } {
  const p = n.protein * 4;
  const c = n.carbs * 4;
  const f = n.fat * 9;
  const total = p + c + f;
  if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: (p / total) * 100,
    carbs: (c / total) * 100,
    fat: (f / total) * 100,
  };
}
