// Core domain types shared across all four features.
// Designed up front (recipes, log, tracker, hydration) so nothing gets bolted on later.

/** Macro + energy figures. Always kilocalories + grams. */
export interface Nutrition {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

/**
 * A food record. Nutrition is stored per 100 g (USDA's native basis) so we can
 * scale to any ingredient quantity. Sourced from USDA FoodData Central and cached
 * locally, or created locally for manual entries.
 */
export interface Food {
  id: string; // local id (e.g. "usda:169967" or "manual:uuid")
  fdcId?: number; // USDA FoodData Central id, when applicable
  name: string;
  brand?: string;
  per100g: Nutrition;
  source: 'usda' | 'manual';
  updatedAt: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

/** A single ingredient line in a recipe, linked to a Food for nutrition. */
export interface RecipeIngredient {
  id: string;
  foodId: string | null; // null = free text only (no nutrition)
  foodName: string; // denormalized display name
  quantity: number;
  unit: string; // "g", "ml", "cup", "tbsp", "piece"...
  grams: number; // resolved weight in grams, used for nutrition math
}

/** A single ordered instruction step. */
export interface RecipeStep {
  id: string;
  order: number;
  text: string;
  photoUri?: string;
  timerSeconds?: number;
}

export interface Recipe {
  id: string;
  title: string;
  heroPhotoUri?: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: Difficulty;
  tags: string[]; // cuisine / diet / meal type
  notes?: string;
  favorite: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  createdAt: number;
  updatedAt: number;
}

export type LogSource = 'recipe' | 'search' | 'manual';

/** One entry in the food diary. Nutrition is baked in at log time. */
export interface LogEntry {
  id: string;
  date: string; // "YYYY-MM-DD" (local day)
  meal: MealType;
  source: LogSource;
  recipeId?: string; // set when source === 'recipe'
  foodId?: string; // set when source === 'search'
  name: string;
  servings: number; // multiplier applied to the base nutrition below
  nutrition: Nutrition; // per single serving
  createdAt: number;
}

// ---- Designed now, built in the second pass (tracker + hydration) ----

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  id: 'me';
  heightCm?: number;
  weightKg?: number;
  age?: number;
  sex?: Sex;
  activity?: ActivityLevel;
  goal?: Goal;
  units: 'metric' | 'imperial';
  // Daily targets — auto-calculated or manually overridden.
  calorieTarget?: number;
  macroTargets?: Nutrition;
  waterTargetMl?: number;
}

export interface WaterLogEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  amountMl: number;
  createdAt: number;
}
