// Guesses a substitute-lookup key from a free-text ingredient name. Curated
// library recipes carry an explicit `key`; user-created recipes (built from
// USDA search results) don't, so this keyword match gives them the same
// Cook Mode swap affordance rather than leaving them out of the feature.

const KEYWORD_TO_KEY: [RegExp, string][] = [
  [/heavy cream|whipping cream/i, 'heavy-cream'],
  [/cream/i, 'heavy-cream'],
  [/rice vinegar/i, 'rice-vinegar'],
  [/shaoxing/i, 'shaoxing-wine'],
  [/paneer/i, 'paneer'],
  [/kasuri methi|fenugreek leaves/i, 'kasuri-methi'],
  [/ghee/i, 'ghee'],
  [/butter/i, 'butter'],
  [/yogurt|yoghurt|curd/i, 'yogurt'],
  [/milk/i, 'milk'],
  [/mozzarella|cheddar|parmesan|cheese/i, 'cheese'],
  [/parmesan/i, 'parmesan'],
  [/^egg|eggs?,|whole egg/i, 'egg'],
  [/dark soy/i, 'dark-soy-sauce'],
  [/soy sauce|tamari/i, 'soy-sauce'],
  [/oyster sauce/i, 'oyster-sauce'],
  [/fish sauce/i, 'fish-sauce'],
  [/sesame oil/i, 'sesame-oil'],
  [/bacon/i, 'bacon'],
  [/pork.*mince|ground pork/i, 'pork-mince'],
  [/chicken thigh/i, 'chicken-thigh'],
  [/beef.*mince|ground beef/i, 'beef-mince'],
  [/beef|steak|flank/i, 'beef'],
  [/all[- ]purpose flour|plain flour/i, 'all-purpose-flour'],
  [/breadcrumbs/i, 'breadcrumbs'],
  [/pizza dough/i, 'pizza-dough'],
  [/burger bun|brioche bun/i, 'burger-bun'],
  [/paprika/i, 'paprika'],
  [/kashmiri chil/i, 'kashmiri-chili'],
  [/curry leaves/i, 'curry-leaves'],
  [/star anise/i, 'star-anise'],
  [/chili oil|chilli oil/i, 'chili-oil'],
  [/tortilla/i, 'tortilla-flour'],
  [/mirin/i, 'mirin'],
];

export function guessSubstituteKey(ingredientName: string): string | undefined {
  for (const [pattern, key] of KEYWORD_TO_KEY) {
    if (pattern.test(ingredientName)) return key;
  }
  return undefined;
}
