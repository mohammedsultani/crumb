// The integration point between recipes and the food log. This is what makes the
// "I made this" one-tap logging work — the whole reason the two halves are one app.

import { addLogEntry } from '../db/log';
import type { LogEntry, MealType, Recipe } from '../types';
import { buildFoodLookup } from '../utils/foodLookup';
import { perServingNutrition } from '../utils/nutrition';
import { todayKey } from './../utils/date';

/** Guess the most likely meal from the current time so logging is one tap. */
export function guessMeal(date = new Date()): MealType {
  const h = date.getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snacks';
}

/** Log a recipe as a meal. Nutrition is per-serving; `servings` is the multiplier. */
export async function logRecipe(
  recipe: Recipe,
  opts: { meal?: MealType; servings?: number; date?: string } = {}
): Promise<LogEntry> {
  const lookup = await buildFoodLookup(recipe);
  const perServing = perServingNutrition(recipe, lookup);
  return addLogEntry({
    date: opts.date ?? todayKey(),
    meal: opts.meal ?? guessMeal(),
    source: 'recipe',
    recipeId: recipe.id,
    name: recipe.title || 'Recipe',
    servings: opts.servings ?? 1,
    nutrition: perServing,
  });
}
