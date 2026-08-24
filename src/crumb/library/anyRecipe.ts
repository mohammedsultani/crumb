// Unifies curated library recipes and the user's own SQLite recipes into one
// shape, so the detail screen and Cook Mode don't need to branch on source.
// Curated recipe ids never collide with user ids: user recipes are always
// stamped `r_...` by makeId (see src/db/recipes.ts), curated ids are
// hand-authored slugs like `chinese-egg-fried-rice`.

import { getFoods } from '../../db/foods';
import { getRecipe } from '../../db/recipes';
import { perServingNutrition } from '../../utils/nutrition';
import { getRecipeById } from './content';
import { guessDishArt } from './DishArt';
import { guessSubstituteKey } from './subKeyGuess';
import type { DietTag, DishArtKind, FlavorTag, LibraryIngredient, LibraryStep, MealOccasion } from './types';
import type { ImageSourcePropType } from 'react-native';

export interface NormalizedRecipe {
  id: string;
  kind: 'library' | 'user';
  title: string;
  description?: string;
  subTag?: string;
  minutes: number;
  prepMinutes?: number;
  activeMinutes?: number;
  passiveMinutes?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  perServingKcal: number;
  perServing: { protein: number; carbs: number; fat: number };
  ingredients: LibraryIngredient[];
  steps: LibraryStep[];
  chefTips?: string[];
  flavor?: FlavorTag[];
  occasion?: MealOccasion[];
  dietTags?: DietTag[];
  hue: number;
  art: DishArtKind;
  photoSource?: ImageSourcePropType;
}

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export async function loadAnyRecipe(id: string): Promise<NormalizedRecipe | null> {
  const curated = getRecipeById(id);
  if (curated) {
    return {
      id: curated.id,
      kind: 'library',
      title: curated.title,
      description: curated.description,
      subTag: curated.subTag,
      minutes: curated.minutes,
      prepMinutes: curated.prepMinutes,
      activeMinutes: curated.activeMinutes,
      passiveMinutes: curated.passiveMinutes,
      difficulty: curated.difficulty,
      servings: curated.servings,
      perServingKcal: curated.perServingKcal,
      perServing: curated.perServing,
      ingredients: curated.ingredients,
      steps: curated.steps,
      chefTips: curated.chefTips,
      flavor: curated.flavor,
      occasion: curated.occasion,
      dietTags: curated.dietTags,
      hue: curated.hue,
      art: curated.art,
      photoSource: curated.photoSource,
    };
  }

  const userRecipe = await getRecipe(id);
  if (!userRecipe) return null;

  const foodIds = userRecipe.ingredients.map((i) => i.foodId).filter((x): x is string => !!x);
  const foods = await getFoods(foodIds);
  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const lookup = (fid: string) => foodMap.get(fid);
  const perServing = perServingNutrition(userRecipe, lookup);

  return {
    id: userRecipe.id,
    kind: 'user',
    title: userRecipe.title,
    description: userRecipe.notes,
    subTag: userRecipe.tags[0],
    minutes: userRecipe.prepMinutes + userRecipe.cookMinutes,
    difficulty: userRecipe.difficulty,
    servings: Math.max(1, userRecipe.servings),
    perServingKcal: Math.round(perServing.calories),
    perServing: { protein: perServing.protein, carbs: perServing.carbs, fat: perServing.fat },
    ingredients: userRecipe.ingredients.map((i) => ({
      id: i.id,
      text: `${i.quantity} ${i.unit} ${i.foodName}`,
      key: guessSubstituteKey(i.foodName),
    })),
    steps: userRecipe.steps.map((s) => ({
      id: s.id,
      text: s.text,
      minutes: s.timerSeconds ? Math.round(s.timerSeconds / 60) : undefined,
      phase: 'cook' as const,
    })),
    hue: hashHue(userRecipe.id),
    art: guessDishArt(userRecipe.title, userRecipe.tags),
  };
}
