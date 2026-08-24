// Aggregates the curated collections and exposes the small set of queries the
// browse/collection/detail screens need. This is Crumb's launch catalog —
// dozens of fully-detailed dishes per collection, built to expand toward a
// much larger library over time rather than pretending to be there already.

import { AMERICAN_RECIPES } from './content.american';
import { ARGENTINIAN_RECIPES } from './content.argentinian';
import { BRAZILIAN_RECIPES } from './content.brazilian';
import { CARIBBEAN_RECIPES } from './content.caribbean';
import { CHINESE_RECIPES } from './content.chinese';
import { CUBAN_RECIPES } from './content.cuban';
import { DESI_RECIPES } from './content.desi';
import { EASTERNEUROPEAN_RECIPES } from './content.easterneuropean';
import { ETHIOPIAN_RECIPES } from './content.ethiopian';
import { FASTFOOD_RECIPES } from './content.fastfood';
import { FILIPINO_RECIPES } from './content.filipino';
import { FRENCH_RECIPES } from './content.french';
import { GERMAN_RECIPES } from './content.german';
import { GREEK_RECIPES } from './content.greek';
import { INDONESIAN_RECIPES } from './content.indonesian';
import { ITALIAN_RECIPES } from './content.italian';
import { JAPANESE_RECIPES } from './content.japanese';
import { KOREAN_RECIPES } from './content.korean';
import { MEXICAN_RECIPES } from './content.mexican';
import { MIDDLEEASTERN_RECIPES } from './content.middleeastern';
import { MOROCCAN_RECIPES } from './content.moroccan';
import { PERSIAN_RECIPES } from './content.persian';
import { PERUVIAN_RECIPES } from './content.peruvian';
import { PORTUGUESE_RECIPES } from './content.portuguese';
import { SCANDINAVIAN_RECIPES } from './content.scandinavian';
import { SOUTHAFRICAN_RECIPES } from './content.southafrican';
import { SPANISH_RECIPES } from './content.spanish';
import { SRILANKAN_RECIPES } from './content.srilankan';
import { THAI_RECIPES } from './content.thai';
import { TURKISH_RECIPES } from './content.turkish';
import { VIETNAMESE_RECIPES } from './content.vietnamese';
import { WESTAFRICAN_RECIPES } from './content.westafrican';
import type { Cuisine, FlavorTag, LibraryRecipe, MealOccasion } from './types';

export const ALL_RECIPES: LibraryRecipe[] = [
  ...CHINESE_RECIPES,
  ...DESI_RECIPES,
  ...FASTFOOD_RECIPES,
  ...ITALIAN_RECIPES,
  ...MEXICAN_RECIPES,
  ...JAPANESE_RECIPES,
  ...KOREAN_RECIPES,
  ...THAI_RECIPES,
  ...VIETNAMESE_RECIPES,
  ...MIDDLEEASTERN_RECIPES,
  ...AMERICAN_RECIPES,
  ...SPANISH_RECIPES,
  ...FILIPINO_RECIPES,
  ...MOROCCAN_RECIPES,
  ...CARIBBEAN_RECIPES,
  ...FRENCH_RECIPES,
  ...INDONESIAN_RECIPES,
  ...GERMAN_RECIPES,
  ...ETHIOPIAN_RECIPES,
  ...TURKISH_RECIPES,
  ...PERSIAN_RECIPES,
  ...PORTUGUESE_RECIPES,
  ...PERUVIAN_RECIPES,
  ...BRAZILIAN_RECIPES,
  ...WESTAFRICAN_RECIPES,
  ...EASTERNEUROPEAN_RECIPES,
  ...GREEK_RECIPES,
  ...CUBAN_RECIPES,
  ...SCANDINAVIAN_RECIPES,
  ...ARGENTINIAN_RECIPES,
  ...SOUTHAFRICAN_RECIPES,
  ...SRILANKAN_RECIPES,
];

const BY_ID = new Map(ALL_RECIPES.map((r) => [r.id, r]));

export function getRecipeById(id: string): LibraryRecipe | undefined {
  return BY_ID.get(id);
}

export function recipesByCuisine(cuisine: Cuisine): LibraryRecipe[] {
  return ALL_RECIPES.filter((r) => r.cuisine === cuisine);
}

/** A fixed, hand-picked "popular" row — one of Crumb's algorithmic shelves. */
const POPULAR_IDS = [
  'desi-butter-chicken',
  'chinese-kung-pao-chicken',
  'fastfood-beef-burger',
  'desi-chicken-tikka-masala',
  'chinese-orange-chicken',
  'fastfood-margherita-pizza',
  'desi-chicken-biryani',
  'chinese-mapo-tofu',
  'fastfood-fried-chicken',
  'desi-paneer-butter-masala',
];

export function popularRow(): LibraryRecipe[] {
  return POPULAR_IDS.map((id) => BY_ID.get(id)).filter((r): r is LibraryRecipe => !!r);
}

/** "Quick weeknight dinners" — under 30 minutes, fastest first. */
export function quickRow(): LibraryRecipe[] {
  return ALL_RECIPES.filter((r) => r.minutes <= 30).sort((a, b) => a.minutes - b.minutes);
}

/** Recipes carrying a given flavor tag — powers shelves like "Something sweet" / "Spicy favorites". */
export function flavorRow(tag: FlavorTag): LibraryRecipe[] {
  return ALL_RECIPES.filter((r) => r.flavor?.includes(tag));
}

/** Recipes carrying a given meal-occasion tag — powers shelves like "Party-ready". */
export function occasionRow(tag: MealOccasion): LibraryRecipe[] {
  return ALL_RECIPES.filter((r) => r.occasion?.includes(tag));
}

/**
 * "Healthy picks" — a nutrition heuristic, not a tag, so every recipe in the
 * library is eligible without needing to be hand-labeled: moderate calories,
 * genuinely protein-forward, and not excessive on fat. Lightest first.
 */
export function healthyRow(): LibraryRecipe[] {
  return ALL_RECIPES.filter(
    (r) => r.perServingKcal <= 550 && r.perServing.protein >= 20 && r.perServing.fat <= 25
  ).sort((a, b) => a.perServingKcal - b.perServingKcal);
}

/** Same heuristic, scoped to breakfast — powers "Healthy breakfasts". */
export function healthyBreakfastRow(): LibraryRecipe[] {
  return healthyRow().filter((r) => r.occasion?.includes('breakfast'));
}

export function randomRecipe(pool: LibraryRecipe[] = ALL_RECIPES): LibraryRecipe {
  return pool[Math.floor(Math.random() * pool.length)];
}
