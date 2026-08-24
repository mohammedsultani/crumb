// Recipe repository. Nested arrays are JSON-encoded in storage and parsed back
// into typed Recipe objects here.

import type { Recipe, RecipeIngredient, RecipeStep } from '../types';
import { getDb, makeId } from './database';

interface RecipeRow {
  id: string;
  title: string;
  heroPhotoUri: string | null;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  tags: string;
  notes: string | null;
  favorite: number;
  ingredients: string;
  steps: string;
  createdAt: number;
  updatedAt: number;
}

function rowToRecipe(r: RecipeRow): Recipe {
  return {
    id: r.id,
    title: r.title,
    heroPhotoUri: r.heroPhotoUri ?? undefined,
    servings: r.servings,
    prepMinutes: r.prepMinutes,
    cookMinutes: r.cookMinutes,
    difficulty: r.difficulty as Recipe['difficulty'],
    tags: safeParse<string[]>(r.tags, []),
    notes: r.notes ?? undefined,
    favorite: r.favorite === 1,
    ingredients: safeParse<RecipeIngredient[]>(r.ingredients, []),
    steps: safeParse<RecipeStep[]>(r.steps, []),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function newRecipeDraft(): Recipe {
  const now = Date.now();
  return {
    id: makeId('r_'),
    title: '',
    servings: 2,
    prepMinutes: 0,
    cookMinutes: 0,
    difficulty: 'easy',
    tags: [],
    favorite: false,
    ingredients: [],
    steps: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const db = await getDb();
  const updatedAt = Date.now();
  await db.runAsync(
    `INSERT INTO recipes
       (id, title, heroPhotoUri, servings, prepMinutes, cookMinutes, difficulty,
        tags, notes, favorite, ingredients, steps, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, heroPhotoUri=excluded.heroPhotoUri, servings=excluded.servings,
       prepMinutes=excluded.prepMinutes, cookMinutes=excluded.cookMinutes,
       difficulty=excluded.difficulty, tags=excluded.tags, notes=excluded.notes,
       favorite=excluded.favorite, ingredients=excluded.ingredients, steps=excluded.steps,
       updatedAt=excluded.updatedAt`,
    [
      recipe.id,
      recipe.title,
      recipe.heroPhotoUri ?? null,
      recipe.servings,
      recipe.prepMinutes,
      recipe.cookMinutes,
      recipe.difficulty,
      JSON.stringify(recipe.tags),
      recipe.notes ?? null,
      recipe.favorite ? 1 : 0,
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.steps),
      recipe.createdAt,
      updatedAt,
    ]
  );
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<RecipeRow>('SELECT * FROM recipes WHERE id = ?', [id]);
  return row ? rowToRecipe(row) : undefined;
}

export async function listRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RecipeRow>(
    'SELECT * FROM recipes ORDER BY favorite DESC, updatedAt DESC'
  );
  return rows.map(rowToRecipe);
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

export async function toggleFavorite(id: string, favorite: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE recipes SET favorite = ?, updatedAt = ? WHERE id = ?', [
    favorite ? 1 : 0,
    Date.now(),
    id,
  ]);
}

export async function countRecipes(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM recipes');
  return row?.c ?? 0;
}
