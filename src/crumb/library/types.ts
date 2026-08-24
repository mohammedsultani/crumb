// The recipe library's own type system. Kept separate from src/types (the
// SQLite user-recipe model) because library content is curated + static, not
// USDA-linked — but the nutrition shape matches so both flow into the same
// food log.

import type { ImageSourcePropType } from 'react-native';

export type Cuisine =
  | 'chinese'
  | 'desi'
  | 'fastfood'
  | 'italian'
  | 'mexican'
  | 'japanese'
  | 'korean'
  | 'thai'
  | 'vietnamese'
  | 'middleeastern'
  | 'american'
  | 'spanish'
  | 'filipino'
  | 'moroccan'
  | 'caribbean'
  | 'french'
  | 'indonesian'
  | 'german'
  | 'ethiopian'
  | 'turkish'
  | 'persian'
  | 'portuguese'
  | 'peruvian'
  | 'brazilian'
  | 'westafrican'
  | 'easterneuropean'
  | 'greek'
  | 'cuban'
  | 'scandinavian'
  | 'argentinian'
  | 'southafrican'
  | 'srilankan';

export type ProteinTag = 'chicken' | 'beef' | 'lamb' | 'seafood' | 'egg' | 'paneer' | 'tofu' | 'veg';

/** 0 = none, 1 = mild, 2 = medium, 3 = hot. */
export type SpiceLevel = 0 | 1 | 2 | 3;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DietTag = 'vegetarian' | 'vegan' | 'dairyFree' | 'glutenFree' | 'halal';

export const DIET_LABELS: Record<DietTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  dairyFree: 'Dairy-free',
  glutenFree: 'Gluten-free',
  halal: 'Halal',
};

export const SPICE_LABELS: Record<SpiceLevel, string> = {
  0: 'No heat',
  1: 'Mild',
  2: 'Medium',
  3: 'Hot',
};

// The set of original line-illustration cover archetypes (see DishArt.tsx).
// No photo backend exists, and stock photography can't be redistributed
// freely, so each dish gets a small original illustration instead — closer
// in spirit to Crumb's hand-drawn, editorial voice than a photo would be.
export type DishArtKind =
  | 'rice'
  | 'stirfry'
  | 'curry'
  | 'noodles'
  | 'soup'
  | 'dumplings'
  | 'kebab'
  | 'samosa'
  | 'pizza'
  | 'burger'
  | 'fries'
  | 'friedchicken'
  | 'wrap'
  | 'taco'
  | 'quesadilla'
  | 'pasta'
  | 'nuggets'
  | 'hotdog'
  | 'salad'
  | 'dessert'
  | 'dip'
  | 'sushi';

export type SubCategory = 'pantry' | 'dietary' | 'regional';

/** One candidate replacement for an ingredient, surfaced in Cook Mode. */
export interface SubOption {
  id: string;
  label: string; // "Cashew cream, blended with a little milk"
  note: string; // one line of why/how
  category: SubCategory;
  dietTags?: DietTag[]; // dietary needs this swap satisfies
  imperfect?: boolean; // a distant stand-in — flagged clearly, not hidden
  kcalDelta: number; // change to the recipe's per-serving kcal if used
  proteinDelta?: number;
  carbsDelta?: number;
  fatDelta?: number;
}

/** An ingredient line. `key` looks it up in the substitute knowledge base. */
export interface LibraryIngredient {
  id: string;
  text: string; // full display text, e.g. "2 tbsp heavy cream"
  key?: string; // normalized key, e.g. "heavy-cream" — omit if nothing to swap
}

/** Which stage of cooking a step belongs to — powers the Prep / Cook / Finish grouping in the UI. */
export type StepPhase = 'prep' | 'cook' | 'finish';

export const PHASE_LABELS: Record<StepPhase, string> = {
  prep: 'Prep',
  cook: 'Cook',
  finish: 'Finish & plate',
};

export interface LibraryStep {
  id: string;
  text: string;
  minutes?: number; // optional timer
  phase: StepPhase;
}

/** How a dish tastes, independent of cuisine — powers cross-cutting browse/filter. */
export type FlavorTag = 'spicy' | 'sweet' | 'savory' | 'tangy' | 'mild' | 'smoky' | 'creamy';

export const FLAVOR_LABELS: Record<FlavorTag, string> = {
  spicy: 'Spicy',
  sweet: 'Sweet',
  savory: 'Savory',
  tangy: 'Tangy',
  mild: 'Mild',
  smoky: 'Smoky',
  creamy: 'Creamy',
};

/** When/why someone would make this — a dish can carry several. */
export type MealOccasion = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'side' | 'party';

export const OCCASION_LABELS: Record<MealOccasion, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
  side: 'Side dish',
  party: 'Party & entertaining',
};

export interface LibraryRecipe {
  id: string;
  title: string;
  description: string; // 1-2 line sell copy, "a friend's recommendation"
  cuisine: Cuisine;
  subTag: string; // "Sichuan", "Punjabi", "Copycat Takeout"
  minutes: number;
  /** Hands-on time before heat: chopping, marinating start, mise en place. */
  prepMinutes?: number;
  /** Hands-on time at the stove/oven. */
  activeMinutes?: number;
  /** Unattended wait: marinating, resting, simmering, chilling. 0/omitted if none. */
  passiveMinutes?: number;
  difficulty: Difficulty;
  spice: SpiceLevel;
  protein: ProteinTag;
  vegetarian: boolean;
  servings: number;
  perServingKcal: number;
  perServing: { protein: number; carbs: number; fat: number };
  ingredients: LibraryIngredient[];
  steps: LibraryStep[];
  /** Two or three common-mistake / pro-tip lines, shown as a callout after the steps. */
  chefTips?: string[];
  flavor?: FlavorTag[];
  occasion?: MealOccasion[];
  /** Dietary claims this dish actually satisfies — a subset, not every applicable one needs listing. */
  dietTags?: DietTag[];
  hue: number; // 0-360, tints the cover art for shelf variety
  art: DishArtKind; // which cover illustration this dish gets (fallback when no photo)
  /**
   * A real cover photo, when one's been sourced (require()'d from
   * assets/recipes/). Licensed source only — see PHOTO_CREDITS.md for
   * attribution. Falls back to the DishArt illustration when absent.
   */
  photoSource?: ImageSourcePropType;
}

export const CUISINE_LABELS: Record<Cuisine, string> = {
  chinese: 'Chinese',
  desi: 'Desi & South Asian',
  fastfood: 'Homemade Fast Food',
  italian: 'Italian',
  mexican: 'Mexican',
  japanese: 'Japanese',
  korean: 'Korean',
  thai: 'Thai',
  vietnamese: 'Vietnamese',
  middleeastern: 'Middle Eastern & Mediterranean',
  american: 'American & British',
  spanish: 'Spanish',
  filipino: 'Filipino',
  moroccan: 'Moroccan',
  caribbean: 'Caribbean',
  french: 'French',
  indonesian: 'Indonesian & Malaysian',
  german: 'German',
  ethiopian: 'Ethiopian',
  turkish: 'Turkish',
  persian: 'Persian',
  portuguese: 'Portuguese',
  peruvian: 'Peruvian',
  brazilian: 'Brazilian',
  westafrican: 'West African',
  easterneuropean: 'Eastern European',
  greek: 'Greek',
  cuban: 'Cuban',
  scandinavian: 'Scandinavian',
  argentinian: 'Argentinian',
  southafrican: 'South African',
  srilankan: 'Sri Lankan',
};

export const CUISINE_TAGLINE: Record<Cuisine, string> = {
  chinese: 'Wok heat, big flavor, faster than delivery.',
  desi: 'Slow spice, generous gravies, the good kind of leftovers.',
  fastfood: 'Everything you’d order in — made fresh, minus the guesswork.',
  italian: 'Slow sauces, good cheese, the food everyone already loves.',
  mexican: 'Bright, punchy, built for a crowd.',
  japanese: 'Precise, clean flavors — comfort food with technique.',
  korean: 'Bold ferments and char, straight off the grill.',
  thai: 'Sweet, sour, salty, spicy — all at once, on purpose.',
  vietnamese: 'Fresh herbs, light broths, built for a hot day.',
  middleeastern: 'Shared plates, good bread, generous with the garlic.',
  american: 'Diner classics and pub favorites, made at home.',
  spanish: 'Long lunches, good olive oil, no rush anywhere.',
  filipino: 'Sour, salty, sweet, all in one pot — deeply homestyle.',
  moroccan: 'Warm spice, slow braises, built for scooping up with bread.',
  caribbean: 'Sun-bright heat and jerk spice, straight off the grill.',
  french: 'Technique-driven and buttery, worth the extra step.',
  indonesian: 'Wok-charred and peanut-rich, big flavor from a small kitchen.',
  german: 'Hearty, golden, and built to go with a big mustard squeeze.',
  ethiopian: 'Deeply spiced stews, meant for scooping, not cutlery.',
  turkish: 'Charcoal and warm spice, from the grill to the tea after.',
  persian: 'Fragrant rice and slow-grilled skewers, saffron-forward.',
  portuguese: 'Coastal and citrus-bright, with a soft spot for custard.',
  peruvian: 'Sharp citrus and big char, where the coast meets the Andes.',
  brazilian: 'Bite-sized and crowd-ready, sweet and savory in equal measure.',
  westafrican: 'One-pot and deeply seasoned, built to feed a table.',
  easterneuropean: 'Hearty, dumpling-forward comfort food for cold weather.',
  greek: 'Olive oil, lemon, and oregano, layered or grilled.',
  cuban: 'Slow-braised and citrus-marinated, built for a lazy Sunday.',
  scandinavian: 'Clean, cold-cured flavors built for short winter days.',
  argentinian: 'Fire-grilled and herb-bright, built around good beef.',
  southafrican: 'Spiced, baked, and braaied — a real melting-pot table.',
  srilankan: 'Coconut-rich and chili-hot, built around rice and roti.',
};
