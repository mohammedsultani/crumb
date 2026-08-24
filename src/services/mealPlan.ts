// Builds a day's meal plan from the curated recipe library, sized to hit both
// a calorie target and the day's protein/carb/fat targets, and respecting
// stored diet preferences. Subscriber-only feature — see app/meal-plan.tsx.

import { ALL_RECIPES } from '../crumb/library/content';
import type { DietTag, LibraryRecipe, MealOccasion } from '../crumb/library/types';
import type { MacroTargets } from './fitness';

export interface PlannedMeal {
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  slotLabel: string;
  recipe: LibraryRecipe;
}

export interface MealPlan {
  meals: PlannedMeal[];
  totalKcal: number;
  targetKcal: number;
  totalMacros: MacroTargets;
  targetMacros: MacroTargets;
}

// Roughly how a day's calories (and, proportionally, macros) tend to split across meals.
const SLOTS: { slot: PlannedMeal['slot']; slotLabel: string; occasion: MealOccasion; share: number }[] = [
  { slot: 'breakfast', slotLabel: 'Breakfast', occasion: 'breakfast', share: 0.25 },
  { slot: 'lunch', slotLabel: 'Lunch', occasion: 'lunch', share: 0.35 },
  { slot: 'dinner', slotLabel: 'Dinner', occasion: 'dinner', share: 0.32 },
  { slot: 'snack', slotLabel: 'Snack', occasion: 'snack', share: 0.08 },
];

function matchesDiet(recipe: LibraryRecipe, diet: DietTag[]): boolean {
  if (diet.length === 0) return true;
  if (diet.includes('vegetarian') && !recipe.vegetarian) return false;
  return diet
    .filter((d) => d !== 'vegetarian')
    .every((d) => recipe.dietTags?.includes(d));
}

/** A small deterministic hash so "today's plan" varies by date without being random/unstable. */
function seededIndex(seed: string, length: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return length > 0 ? h % length : 0;
}

/** Relative-error distance across calories and all three macros, so a recipe that's
 * calorie-perfect but protein-poor doesn't outrank one that's well-rounded on both. */
function distance(
  recipe: LibraryRecipe,
  budget: { kcal: number; proteinG: number; carbsG: number; fatG: number }
): number {
  const relErr = (actual: number, target: number) => Math.abs(actual - target) / Math.max(target, 1);
  return (
    relErr(recipe.perServingKcal, budget.kcal) * 1.0 +
    relErr(recipe.perServing.protein, budget.proteinG) * 0.9 +
    relErr(recipe.perServing.carbs, budget.carbsG) * 0.35 +
    relErr(recipe.perServing.fat, budget.fatG) * 0.35
  );
}

export function buildMealPlan(
  targetKcal: number,
  targetMacros: MacroTargets,
  diet: DietTag[],
  dateKey: string
): MealPlan {
  const pool = ALL_RECIPES.filter((r) => matchesDiet(r, diet));

  const meals: PlannedMeal[] = SLOTS.map(({ slot, slotLabel, occasion, share }) => {
    const budget = {
      kcal: targetKcal * share,
      proteinG: targetMacros.proteinG * share,
      carbsG: targetMacros.carbsG * share,
      fatG: targetMacros.fatG * share,
    };
    let candidates = pool.filter((r) => r.occasion?.includes(occasion));
    if (candidates.length === 0) candidates = pool; // graceful fallback if a slot's tag pool is thin

    // Closest 5 matches on calories + macros combined, then pick one deterministically
    // by date+slot so the plan rotates day to day instead of always serving the single
    // "best fit" recipe.
    const ranked = candidates
      .slice()
      .sort((a, b) => distance(a, budget) - distance(b, budget))
      .slice(0, 5);
    const pick = ranked[seededIndex(`${dateKey}-${slot}`, ranked.length)] ?? candidates[0];

    return { slot, slotLabel, recipe: pick };
  }).filter((m): m is PlannedMeal => !!m.recipe);

  const totalKcal = meals.reduce((sum, m) => sum + m.recipe.perServingKcal, 0);
  const totalMacros = meals.reduce(
    (sum, m) => ({
      proteinG: sum.proteinG + m.recipe.perServing.protein,
      carbsG: sum.carbsG + m.recipe.perServing.carbs,
      fatG: sum.fatG + m.recipe.perServing.fat,
    }),
    { proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return { meals, totalKcal, targetKcal: Math.round(targetKcal), totalMacros, targetMacros };
}
