// Maps the user's own SQLite recipes into LibraryRecipe-shaped cards so the
// "Yours" shelf can reuse RecipeCard/ShelfRow without a parallel component.

import { getFoods } from '../../db/foods';
import { listRecipes } from '../../db/recipes';
import { perServingNutrition } from '../../utils/nutrition';
import type { Food } from '../../types';
import { guessDishArt } from './DishArt';
import type { LibraryRecipe } from './types';

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export async function loadUserRecipesAsLibrary(): Promise<LibraryRecipe[]> {
  const recipes = await listRecipes();
  if (recipes.length === 0) return [];

  const ids = Array.from(
    new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.foodId).filter((x): x is string => !!x)))
  );
  const foods = await getFoods(ids);
  const map = new Map(foods.map((f) => [f.id, f]));
  const lookup = (id: string) => map.get(id) as Food | undefined;

  return recipes.map((r) => {
    const per = perServingNutrition(r, lookup);
    return {
      id: r.id,
      title: r.title,
      description: r.notes || 'From your own kitchen.',
      cuisine: 'fastfood', // unused for the "Yours" shelf, which isn't filtered by cuisine
      subTag: r.tags[0] ?? 'Your recipe',
      minutes: r.prepMinutes + r.cookMinutes,
      difficulty: r.difficulty,
      spice: 0,
      protein: 'veg',
      vegetarian: true,
      servings: r.servings,
      perServingKcal: Math.round(per.calories),
      perServing: { protein: per.protein, carbs: per.carbs, fat: per.fat },
      ingredients: [],
      steps: [],
      hue: hashHue(r.id),
      art: guessDishArt(r.title, r.tags),
    };
  });
}
