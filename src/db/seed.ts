// First-launch seed data: a few recipes with real USDA-derived nutrition baked
// in, so the app feels alive before the user creates anything. Foods are stored
// with source 'manual' (pre-cached) so no network call is needed at seed time.

import type { Food, Recipe } from '../types';
import { upsertFood } from './foods';
import { countRecipes, saveRecipe } from './recipes';
import { makeId } from './database';

// Per-100g values (approximate, USDA-derived).
const SEED_FOODS: Food[] = [
  food('seed:oats', 'Rolled oats, dry', { calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5 }),
  food('seed:banana', 'Banana, raw', { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 }),
  food('seed:milk', 'Milk, 2% fat', { calories: 50, protein: 3.4, carbs: 4.9, fat: 2 }),
  food('seed:pb', 'Peanut butter', { calories: 588, protein: 25, carbs: 20, fat: 50 }),
  food('seed:chicken', 'Chicken breast, cooked', { calories: 165, protein: 31, carbs: 0, fat: 3.6 }),
  food('seed:rice', 'Rice, white, cooked', { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }),
  food('seed:broccoli', 'Broccoli, cooked', { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4 }),
  food('seed:oliveoil', 'Olive oil', { calories: 884, protein: 0, carbs: 0, fat: 100 }),
  food('seed:egg', 'Egg, whole, cooked', { calories: 155, protein: 13, carbs: 1.1, fat: 11 }),
  food('seed:spinach', 'Spinach, raw', { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }),
  food('seed:tomato', 'Tomato, raw', { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 }),
  food('seed:feta', 'Feta cheese', { calories: 264, protein: 14, carbs: 4, fat: 21 }),
];

function food(id: string, name: string, per100g: Food['per100g']): Food {
  return { id, name, per100g, source: 'manual', updatedAt: Date.now() };
}

const SEED_RECIPES: Recipe[] = [
  recipe({
    title: 'Peanut Butter Banana Oatmeal',
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 8,
    difficulty: 'easy',
    tags: ['Breakfast', 'Vegetarian'],
    ingredients: [
      ing('seed:oats', 'Rolled oats, dry', 80, 'g'),
      ing('seed:milk', 'Milk, 2% fat', 400, 'ml'),
      ing('seed:banana', 'Banana, raw', 120, 'g'),
      ing('seed:pb', 'Peanut butter', 32, 'g'),
    ],
    steps: [
      step('Combine oats and milk in a small pot.', 60),
      step('Simmer on medium, stirring, until creamy.', 300),
      step('Slice the banana and stir half through; top with the rest.'),
      step('Swirl peanut butter over the top and serve warm.'),
    ],
  }),
  recipe({
    title: 'Chicken, Rice & Broccoli Bowl',
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    difficulty: 'easy',
    tags: ['Dinner', 'High-protein', 'Gluten-free'],
    ingredients: [
      ing('seed:chicken', 'Chicken breast, cooked', 300, 'g'),
      ing('seed:rice', 'Rice, white, cooked', 300, 'g'),
      ing('seed:broccoli', 'Broccoli, cooked', 200, 'g'),
      ing('seed:oliveoil', 'Olive oil', 14, 'ml'),
    ],
    steps: [
      step('Cook rice according to package directions.', 900),
      step('Season and pan-sear the chicken until 74°C internal.', 600),
      step('Steam the broccoli until bright and tender.', 300),
      step('Slice chicken, build bowls, drizzle with olive oil.'),
    ],
  }),
  recipe({
    title: 'Spinach & Feta Egg Scramble',
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 7,
    difficulty: 'easy',
    tags: ['Breakfast', 'Vegetarian', 'Low-carb'],
    ingredients: [
      ing('seed:egg', 'Egg, whole', 100, 'g'),
      ing('seed:spinach', 'Spinach, raw', 50, 'g'),
      ing('seed:feta', 'Feta cheese', 30, 'g'),
      ing('seed:tomato', 'Tomato, raw', 80, 'g'),
      ing('seed:oliveoil', 'Olive oil', 7, 'ml'),
    ],
    steps: [
      step('Heat olive oil in a nonstick pan over medium.'),
      step('Wilt the spinach and diced tomato, ~2 min.', 120),
      step('Add beaten eggs; stir gently until just set.', 120),
      step('Fold through crumbled feta and serve.'),
    ],
  }),
];

// ---- builders ----

function ing(foodId: string, foodName: string, grams: number, unit: string) {
  return { id: makeId('i_'), foodId, foodName, quantity: grams, unit, grams };
}

function step(text: string, timerSeconds?: number) {
  return { id: makeId('s_'), order: 0, text, timerSeconds };
}

function recipe(
  data: Omit<Recipe, 'id' | 'favorite' | 'createdAt' | 'updatedAt'>
): Recipe {
  const now = Date.now();
  return {
    ...data,
    steps: data.steps.map((s, i) => ({ ...s, order: i })),
    id: makeId('r_'),
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Seed once, only if the recipe table is empty. */
export async function seedIfEmpty(): Promise<void> {
  const existing = await countRecipes();
  if (existing > 0) return;
  for (const f of SEED_FOODS) await upsertFood(f);
  for (const r of SEED_RECIPES) await saveRecipe(r);
}
