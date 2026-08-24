// Food cache repository. USDA lookups are cached here so repeat ingredient use
// is instant and works offline. Manual foods live here too.

import type { Food } from '../types';
import { getDb } from './database';

interface FoodRow {
  id: string;
  fdcId: number | null;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  updatedAt: number;
}

function rowToFood(r: FoodRow): Food {
  return {
    id: r.id,
    fdcId: r.fdcId ?? undefined,
    name: r.name,
    brand: r.brand ?? undefined,
    per100g: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat },
    source: (r.source as Food['source']) ?? 'usda',
    updatedAt: r.updatedAt,
  };
}

export async function upsertFood(food: Food): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO foods (id, fdcId, name, brand, calories, protein, carbs, fat, source, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       fdcId=excluded.fdcId, name=excluded.name, brand=excluded.brand,
       calories=excluded.calories, protein=excluded.protein, carbs=excluded.carbs,
       fat=excluded.fat, source=excluded.source, updatedAt=excluded.updatedAt`,
    [
      food.id,
      food.fdcId ?? null,
      food.name,
      food.brand ?? null,
      food.per100g.calories,
      food.per100g.protein,
      food.per100g.carbs,
      food.per100g.fat,
      food.source,
      food.updatedAt,
    ]
  );
}

export async function getFood(id: string): Promise<Food | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<FoodRow>('SELECT * FROM foods WHERE id = ?', [id]);
  return row ? rowToFood(row) : undefined;
}

/** Load many foods at once (used to build the lookup map for a recipe). */
export async function getFoods(ids: string[]): Promise<Food[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  const rows = await db.getAllAsync<FoodRow>(
    `SELECT * FROM foods WHERE id IN (${placeholders})`,
    ids
  );
  return rows.map(rowToFood);
}

/** Recently used cached foods, for quick re-selection without hitting the network. */
export async function recentFoods(limit = 25): Promise<Food[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<FoodRow>(
    'SELECT * FROM foods ORDER BY updatedAt DESC LIMIT ?',
    [limit]
  );
  return rows.map(rowToFood);
}
