// Food diary repository. Every entry stores its own nutrition (per serving) so
// the daily total is a simple sum and history stays correct even if a recipe
// later changes.

import type { LogEntry, MealType, Nutrition } from '../types';
import { getDb, makeId } from './database';

interface LogRow {
  id: string;
  date: string;
  meal: string;
  source: string;
  recipeId: string | null;
  foodId: string | null;
  name: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: number;
}

function rowToEntry(r: LogRow): LogEntry {
  return {
    id: r.id,
    date: r.date,
    meal: r.meal as MealType,
    source: r.source as LogEntry['source'],
    recipeId: r.recipeId ?? undefined,
    foodId: r.foodId ?? undefined,
    name: r.name,
    servings: r.servings,
    nutrition: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat },
    createdAt: r.createdAt,
  };
}

export async function addLogEntry(entry: Omit<LogEntry, 'id' | 'createdAt'>): Promise<LogEntry> {
  const db = await getDb();
  const full: LogEntry = { ...entry, id: makeId('l_'), createdAt: Date.now() };
  await db.runAsync(
    `INSERT INTO log_entries
       (id, date, meal, source, recipeId, foodId, name, servings, calories, protein, carbs, fat, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full.id,
      full.date,
      full.meal,
      full.source,
      full.recipeId ?? null,
      full.foodId ?? null,
      full.name,
      full.servings,
      full.nutrition.calories,
      full.nutrition.protein,
      full.nutrition.carbs,
      full.nutrition.fat,
      full.createdAt,
    ]
  );
  return full;
}

export async function updateLogEntry(entry: LogEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE log_entries SET
       date=?, meal=?, name=?, servings=?, calories=?, protein=?, carbs=?, fat=?
     WHERE id=?`,
    [
      entry.date,
      entry.meal,
      entry.name,
      entry.servings,
      entry.nutrition.calories,
      entry.nutrition.protein,
      entry.nutrition.carbs,
      entry.nutrition.fat,
      entry.id,
    ]
  );
}

export async function deleteLogEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM log_entries WHERE id = ?', [id]);
}

export async function getLogForDate(date: string): Promise<LogEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LogRow>(
    'SELECT * FROM log_entries WHERE date = ? ORDER BY createdAt ASC',
    [date]
  );
  return rows.map(rowToEntry);
}

export async function getLogBetween(startDate: string, endDate: string): Promise<LogEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LogRow>(
    'SELECT * FROM log_entries WHERE date >= ? AND date <= ? ORDER BY date ASC, createdAt ASC',
    [startDate, endDate]
  );
  return rows.map(rowToEntry);
}

/** Sum of nutrition for a day (servings already baked into stored values). */
export function sumNutrition(entries: LogEntry[]): Nutrition {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.nutrition.calories * e.servings,
      protein: acc.protein + e.nutrition.protein * e.servings,
      carbs: acc.carbs + e.nutrition.carbs * e.servings,
      fat: acc.fat + e.nutrition.fat * e.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
