// Lightweight filter chips shared by the browse screen and collection grids.

import type { DietTag, Difficulty, FlavorTag, LibraryRecipe, MealOccasion, ProteinTag, SpiceLevel } from './types';

export type FilterId =
  | 'vegetarian'
  | 'under30'
  | 'weeknight'
  | 'weekend'
  | `spice-${SpiceLevel}`
  | `protein-${ProteinTag}`
  | `flavor-${FlavorTag}`
  | `occasion-${MealOccasion}`
  | `diet-${DietTag}`
  | `skill-${Difficulty}`;

export interface FilterChipDef {
  id: FilterId;
  label: string;
}

export const FILTER_CHIPS: FilterChipDef[] = [
  // Time
  { id: 'under30', label: 'Under 30 min' },
  { id: 'weeknight', label: 'Weeknight (30-60m)' },
  { id: 'weekend', label: 'Weekend project' },
  // Skill
  { id: 'skill-easy', label: 'Beginner' },
  { id: 'skill-medium', label: 'Intermediate' },
  { id: 'skill-hard', label: 'Advanced' },
  // Flavor
  { id: 'flavor-spicy', label: 'Spicy' },
  { id: 'flavor-sweet', label: 'Sweet' },
  { id: 'flavor-savory', label: 'Savory' },
  { id: 'flavor-tangy', label: 'Tangy' },
  { id: 'flavor-mild', label: 'Mild' },
  { id: 'flavor-smoky', label: 'Smoky' },
  { id: 'flavor-creamy', label: 'Creamy' },
  // Occasion
  { id: 'occasion-breakfast', label: 'Breakfast' },
  { id: 'occasion-lunch', label: 'Lunch' },
  { id: 'occasion-dinner', label: 'Dinner' },
  { id: 'occasion-snack', label: 'Snack' },
  { id: 'occasion-dessert', label: 'Dessert' },
  { id: 'occasion-side', label: 'Side dish' },
  { id: 'occasion-party', label: 'Party' },
  // Dietary
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'diet-vegan', label: 'Vegan' },
  { id: 'diet-glutenFree', label: 'Gluten-free' },
  { id: 'diet-dairyFree', label: 'Dairy-free' },
  { id: 'diet-halal', label: 'Halal' },
  // Spice level
  { id: 'spice-1', label: 'Mild heat' },
  { id: 'spice-2', label: 'Medium heat' },
  { id: 'spice-3', label: 'Hot' },
  // Protein
  { id: 'protein-chicken', label: 'Chicken' },
  { id: 'protein-beef', label: 'Beef' },
  { id: 'protein-paneer', label: 'Paneer' },
  { id: 'protein-tofu', label: 'Tofu' },
  { id: 'protein-seafood', label: 'Seafood' },
];

export function applyFilters(recipes: LibraryRecipe[], active: Set<FilterId>): LibraryRecipe[] {
  if (active.size === 0) return recipes;
  return recipes.filter((r) => {
    for (const f of active) {
      if (f === 'under30' && r.minutes > 30) return false;
      if (f === 'weeknight' && (r.minutes < 30 || r.minutes > 60)) return false;
      if (f === 'weekend' && r.minutes <= 60) return false;
      if (f === 'vegetarian' && !r.vegetarian) return false;
      if (f.startsWith('spice-') && r.spice !== Number(f.split('-')[1])) return false;
      if (f.startsWith('protein-') && r.protein !== f.split('-')[1]) return false;
      if (f.startsWith('skill-') && r.difficulty !== f.split('-')[1]) return false;
      if (f.startsWith('flavor-') && !r.flavor?.includes(f.split('-')[1] as FlavorTag)) return false;
      if (f.startsWith('occasion-') && !r.occasion?.includes(f.split('-')[1] as MealOccasion)) return false;
      if (f.startsWith('diet-') && !r.dietTags?.includes(f.split('-')[1] as DietTag)) return false;
    }
    return true;
  });
}
