// USDA FoodData Central search.
// Docs: https://fdc.nal.usda.gov/api-guide.html
// We read the per-100g nutrient values (foodNutrients) and map them to our
// Nutrition shape. Results are cached into the local `foods` table on selection.

import { USDA_API_KEY } from '../config';
import type { Food, Nutrition } from '../types';

const BASE = 'https://api.nal.usda.gov/fdc/v1';

// USDA nutrient ids for the four figures we care about.
const NUTRIENT = {
  energyKcal: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
} as const;

// Some records report energy in kJ (id 1062) instead of kcal.
const ENERGY_KJ = 1062;

interface FdcNutrient {
  nutrientId?: number;
  nutrientName?: string;
  unitName?: string;
  value?: number;
}

interface FdcFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  dataType?: string;
  foodNutrients?: FdcNutrient[];
}

function extractNutrition(nutrients: FdcNutrient[] = []): Nutrition {
  const find = (id: number) => nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
  let calories = find(NUTRIENT.energyKcal);
  if (!calories) {
    const kj = find(ENERGY_KJ);
    if (kj) calories = kj / 4.184; // kJ -> kcal
  }
  return {
    calories: round(calories),
    protein: round(find(NUTRIENT.protein)),
    carbs: round(find(NUTRIENT.carbs)),
    fat: round(find(NUTRIENT.fat)),
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

function toFood(f: FdcFood): Food {
  const brand = f.brandName || f.brandOwner || undefined;
  return {
    id: `usda:${f.fdcId}`,
    fdcId: f.fdcId,
    name: cleanName(f.description),
    brand,
    per100g: extractNutrition(f.foodNutrients),
    source: 'usda',
    updatedAt: Date.now(),
  };
}

function cleanName(desc: string): string {
  // USDA descriptions are often ALL CAPS for branded items — soften to Title-ish.
  if (desc === desc.toUpperCase()) {
    return desc
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return desc;
}

export interface UsdaSearchResult {
  foods: Food[];
  error?: string;
}

/** Search USDA for foods matching a query. Returns per-100g nutrition. */
export async function searchUsdaFoods(query: string, signal?: AbortSignal): Promise<UsdaSearchResult> {
  const q = query.trim();
  if (!q) return { foods: [] };
  const url =
    `${BASE}/foods/search?api_key=${encodeURIComponent(USDA_API_KEY)}` +
    `&query=${encodeURIComponent(q)}` +
    `&pageSize=25&dataType=${encodeURIComponent('Foundation,SR Legacy,Branded')}`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      if (res.status === 429) {
        return { foods: [], error: 'USDA rate limit reached. Add your own free API key in src/config.ts.' };
      }
      return { foods: [], error: `USDA search failed (${res.status}).` };
    }
    const data = (await res.json()) as { foods?: FdcFood[] };
    const foods = (data.foods ?? []).map(toFood).filter((f) => f.per100g.calories > 0 || f.per100g.protein > 0);
    return { foods };
  } catch (e: any) {
    if (e?.name === 'AbortError') return { foods: [] };
    return { foods: [], error: 'Network error. Check your connection.' };
  }
}
