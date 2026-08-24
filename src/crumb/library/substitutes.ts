// The substitution knowledge base for Cook Mode. Keyed by a normalized
// ingredient `key` (see LibraryIngredient.key). Each entry lists ranked
// candidate swaps across three situations: pantry gaps, dietary needs, and
// regional availability — matching the three cases Crumb's swap affordance
// is meant to cover.
//
// Nutrition deltas are approximate, per serving, relative to the original
// ingredient's contribution — good enough to visibly nudge the tracker
// without pretending to lab-grade precision.

import type { DietTag, SubOption } from './types';

export const SUBSTITUTES: Record<string, SubOption[]> = {
  'heavy-cream': [
    {
      id: 'cream-cashew',
      label: 'Cashew paste blended with milk',
      note: 'Soak cashews, blend smooth with a splash of milk. Silkier than you’d expect.',
      category: 'pantry',
      dietTags: ['vegetarian'],
      kcalDelta: -35,
      fatDelta: -3,
      carbsDelta: 2,
    },
    {
      id: 'cream-coconut',
      label: 'Full-fat coconut milk',
      note: 'The dairy-free default — adds a faint sweetness that works in most gravies.',
      category: 'dietary',
      dietTags: ['dairyFree', 'vegan'],
      kcalDelta: -10,
      fatDelta: -1,
    },
    {
      id: 'cream-yogurt',
      label: 'Whisked plain yogurt, off the heat',
      note: 'Stir in after the pan comes off direct heat, or it’ll split.',
      category: 'pantry',
      dietTags: ['vegetarian'],
      kcalDelta: -60,
      proteinDelta: 2,
      fatDelta: -6,
    },
  ],
  'rice-vinegar': [
    {
      id: 'vinegar-lemon',
      label: 'Lemon juice + a pinch of sugar',
      note: 'Close enough for a stir-fry — a little brighter, a little less rounded.',
      category: 'pantry',
      kcalDelta: 2,
    },
    {
      id: 'vinegar-white',
      label: 'White vinegar, half the amount',
      note: 'Sharper than rice vinegar, so use less than the recipe calls for.',
      category: 'pantry',
      kcalDelta: 0,
    },
  ],
  'shaoxing-wine': [
    {
      id: 'shaoxing-stock',
      label: 'Stock with a splash of vinegar',
      note: 'What the base recipes already use — alcohol-free and close enough on flavor.',
      category: 'dietary',
      dietTags: ['halal'],
      kcalDelta: -8,
    },
  ],
  paneer: [
    {
      id: 'paneer-tofu',
      label: 'Firm tofu, pressed',
      note: 'Press it for 10 minutes first so it holds up in the pan.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -45,
      proteinDelta: 1,
      fatDelta: -6,
    },
    {
      id: 'paneer-halloumi',
      label: 'Halloumi, cubed',
      note: 'Saltier and firmer — sears beautifully if you have it on hand.',
      category: 'pantry',
      kcalDelta: 20,
      proteinDelta: 2,
    },
  ],
  'kasuri-methi': [
    {
      id: 'methi-thyme',
      label: 'A small pinch of dried thyme',
      note: 'A distant stand-in — different plant entirely, but it fills the same "dried herb, right at the end" role.',
      category: 'pantry',
      imperfect: true,
      kcalDelta: 0,
    },
    {
      id: 'methi-skip',
      label: 'Leave it out',
      note: 'The dish loses a little of its signature aroma but still works.',
      category: 'pantry',
      imperfect: true,
      kcalDelta: 0,
    },
  ],
  butter: [
    {
      id: 'butter-oil',
      label: 'Neutral oil or vegan butter',
      note: 'Use about 20% less by volume — butter carries more flavor per spoon.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -15,
      fatDelta: -2,
    },
    {
      id: 'butter-ghee',
      label: 'Ghee',
      note: 'Nuttier, higher smoke point — swap 1:1.',
      category: 'regional',
      kcalDelta: 5,
    },
  ],
  ghee: [
    {
      id: 'ghee-oil',
      label: 'Neutral oil',
      note: 'You lose the nuttiness but the dish still comes together.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -10,
    },
    {
      id: 'ghee-butter',
      label: 'Unsalted butter',
      note: 'The easiest swap if ghee isn’t in the cupboard.',
      category: 'pantry',
      kcalDelta: -5,
    },
  ],
  yogurt: [
    {
      id: 'yogurt-coconut',
      label: 'Coconut yogurt',
      note: 'Tangy enough to stand in for marinades and raitas alike.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: 5,
    },
    {
      id: 'yogurt-buttermilk',
      label: 'Buttermilk, reduced slightly',
      note: 'Thinner, so simmer the sauce a touch longer to bring it back together.',
      category: 'pantry',
      kcalDelta: -20,
    },
  ],
  milk: [
    {
      id: 'milk-oat',
      label: 'Oat milk',
      note: 'The steadiest dairy-free swap for sauces — doesn’t split under heat.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -5,
    },
    {
      id: 'milk-almond',
      label: 'Unsweetened almond milk',
      note: 'Thinner than dairy milk — fine for batters, less rich in sauces.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -25,
      fatDelta: -3,
    },
  ],
  cheese: [
    {
      id: 'cheese-vegan',
      label: 'A melting vegan cheese',
      note: 'Pick one labeled for melting — the block kind mostly won’t.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -10,
      fatDelta: -2,
    },
    {
      id: 'cheese-nutritional-yeast',
      label: 'Nutritional yeast, a savory dusting',
      note: 'Not a melt, but a good savory finish if that’s all you’re after.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      imperfect: true,
      kcalDelta: -60,
      proteinDelta: 2,
    },
  ],
  egg: [
    {
      id: 'egg-flax',
      label: '1 tbsp ground flaxseed + 3 tbsp water',
      note: 'Let it sit 5 minutes to gel — best for binding in batters, not for scrambling.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      imperfect: true,
      kcalDelta: -40,
      fatDelta: -2,
    },
    {
      id: 'egg-tofu-scramble',
      label: 'Crumbled silken tofu, turmeric-tinted',
      note: 'For dishes where the egg is scrambled in — closest texture match.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -50,
      proteinDelta: 1,
      fatDelta: -4,
    },
  ],
  tofu: [
    {
      id: 'tofu-paneer',
      label: 'Paneer, cubed',
      note: 'Firmer and milkier — sears without pressing first, but is no longer vegan.',
      category: 'pantry',
      kcalDelta: 25,
      proteinDelta: 2,
      fatDelta: 3,
    },
    {
      id: 'tofu-chickpea',
      label: 'Drained, mashed chickpeas',
      note: 'A soy-free stand-in for soups and braises — won’t hold a cube shape, so best where the tofu gets broken up anyway.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree', 'glutenFree'],
      imperfect: true,
      kcalDelta: -15,
      proteinDelta: -2,
      carbsDelta: 5,
    },
  ],
  'soy-sauce': [
    {
      id: 'soy-tamari',
      label: 'Tamari',
      note: 'Nearly identical flavor and usually gluten-free — check the label.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: 0,
    },
    {
      id: 'soy-coconut-aminos',
      label: 'Coconut aminos',
      note: 'Sweeter and milder — use a little extra to match the savoriness.',
      category: 'dietary',
      dietTags: ['glutenFree', 'vegan'],
      kcalDelta: 5,
    },
  ],
  'dark-soy-sauce': [
    {
      id: 'darksoy-regular-molasses',
      label: 'Regular soy sauce + a drop of molasses',
      note: 'Mostly a color and slight sweetness fix — this gets you close.',
      category: 'pantry',
      kcalDelta: 3,
    },
  ],
  'oyster-sauce': [
    {
      id: 'oyster-mushroom',
      label: 'Vegetarian "oyster" sauce (mushroom-based)',
      note: 'Widely sold, tastes remarkably close, fully plant-based.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -5,
    },
    {
      id: 'oyster-hoisin-soy',
      label: 'Hoisin sauce thinned with soy sauce',
      note: 'Sweeter than the real thing but works in a pinch.',
      category: 'pantry',
      kcalDelta: 8,
    },
  ],
  'fish-sauce': [
    {
      id: 'fishsauce-soy-lime',
      label: 'Soy sauce + a squeeze of lime',
      note: 'Not identical, but covers the salty-savory-sour base note.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -3,
    },
  ],
  'sesame-oil': [
    {
      id: 'sesame-tahini-neutral',
      label: 'A drop of tahini stirred into neutral oil',
      note: 'Approximates the nuttiness — start with far less than you think.',
      category: 'pantry',
      imperfect: true,
      kcalDelta: 5,
    },
  ],
  bacon: [
    {
      id: 'bacon-turkey',
      label: 'Turkey bacon',
      note: 'Leaner and halal-friendly if certified — crisps up a little differently. Already the default in Crumb’s own recipes.',
      category: 'dietary',
      dietTags: ['halal'],
      kcalDelta: -35,
      fatDelta: -4,
    },
    {
      id: 'bacon-mushroom',
      label: 'Smoked mushrooms',
      note: 'Sear sliced mushrooms hard with a little smoked paprika for the savory hit.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -70,
      proteinDelta: -3,
      fatDelta: -6,
    },
  ],
  'pork-mince': [
    {
      id: 'pork-chicken-mince',
      label: 'Ground chicken or turkey',
      note: 'Halal-friendly and leaner — add a little extra oil so it doesn’t dry out. Already the default in Crumb’s own recipes.',
      category: 'dietary',
      dietTags: ['halal'],
      kcalDelta: -40,
      fatDelta: -5,
    },
    {
      id: 'pork-mushroom-mince',
      label: 'Finely chopped mushroom + walnut',
      note: 'A genuinely good vegetarian filling for dumplings and the like.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -90,
      proteinDelta: -6,
      fatDelta: -8,
    },
  ],
  'chicken-mince': [
    {
      id: 'chicken-mince-turkey',
      label: 'Ground turkey',
      note: 'Even leaner than chicken thigh mince — add a little extra oil so it doesn’t dry out.',
      category: 'pantry',
      kcalDelta: -15,
      fatDelta: -2,
    },
    {
      id: 'chicken-mince-mushroom',
      label: 'Finely chopped mushroom + walnut',
      note: 'A genuinely good vegetarian filling for dumplings and the like.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -90,
      proteinDelta: -6,
      fatDelta: -8,
    },
  ],
  'chicken-thigh': [
    {
      id: 'chicken-tofu',
      label: 'Extra-firm tofu, pressed and cubed',
      note: 'Marinate a few minutes longer since tofu drinks up flavor slower.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -80,
      proteinDelta: -8,
      fatDelta: -6,
    },
    {
      id: 'chicken-breast',
      label: 'Chicken breast',
      note: 'Leaner, cooks a touch faster — watch it so it doesn’t dry out.',
      category: 'pantry',
      kcalDelta: -30,
      fatDelta: -4,
    },
  ],
  beef: [
    {
      id: 'beef-mushroom',
      label: 'Portobello mushroom strips',
      note: 'Sear hard for real browning — closest meat-free texture for stir-fries.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -130,
      proteinDelta: -20,
      fatDelta: -8,
    },
    {
      id: 'beef-lamb-swap',
      label: 'Lamb, thinly sliced',
      note: 'Richer, slightly gamier — works well in most beef stir-fries.',
      category: 'pantry',
      kcalDelta: 25,
    },
  ],
  'all-purpose-flour': [
    {
      id: 'flour-gf-blend',
      label: '1:1 gluten-free flour blend',
      note: 'Look for one with xanthan gum already in it for the best texture.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: -2,
    },
  ],
  breadcrumbs: [
    {
      id: 'breadcrumbs-gf',
      label: 'Gluten-free breadcrumbs or crushed rice crackers',
      note: 'Crushed rice crackers give a nice extra crunch.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: 0,
    },
  ],
  'pizza-dough': [
    {
      id: 'dough-gf',
      label: 'Store-bought gluten-free pizza base',
      note: 'Par-bake it a few minutes before topping so the middle doesn’t go soggy.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: -10,
    },
    {
      id: 'dough-cauliflower',
      label: 'Cauliflower crust',
      note: 'Lighter and lower-carb — press out as much water as you can first.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: -90,
      carbsDelta: -18,
    },
  ],
  'burger-bun': [
    {
      id: 'bun-lettuce',
      label: 'Lettuce wrap',
      note: 'Low-carb and gluten-free — messier, but genuinely good.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: -150,
      carbsDelta: -28,
    },
    {
      id: 'bun-gf',
      label: 'Gluten-free bun',
      note: 'Toast it a little longer — GF buns dry out fast otherwise.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: -10,
    },
  ],
  'beef-mince': [
    {
      id: 'beefmince-blackbean',
      label: 'Mashed black beans + walnut',
      note: 'Crumbles and browns surprisingly close — press it firmly when shaping.',
      category: 'dietary',
      dietTags: ['vegetarian', 'vegan'],
      kcalDelta: -110,
      proteinDelta: -12,
      fatDelta: -10,
      carbsDelta: 8,
    },
    {
      id: 'beefmince-turkey',
      label: 'Ground turkey',
      note: 'Leaner — add a spoon of oil to the pan so it doesn’t stick.',
      category: 'pantry',
      kcalDelta: -50,
      fatDelta: -6,
    },
  ],
  paprika: [
    {
      id: 'paprika-cayenne',
      label: 'A pinch of cayenne + extra tomato paste for color',
      note: 'Hotter than paprika, so start with about a third of the amount.',
      category: 'regional',
      kcalDelta: 0,
    },
  ],
  'kashmiri-chili': [
    {
      id: 'kashmiri-paprika',
      label: 'Sweet paprika + a small pinch of cayenne',
      note: 'Kashmiri chili is prized for color more than heat — this combo gets both.',
      category: 'regional',
      kcalDelta: 0,
    },
  ],
  'curry-leaves': [
    {
      id: 'curryleaves-bayleaf',
      label: 'A bay leaf, added earlier in the cook',
      note: 'A different aroma entirely, but a reasonable stand-in where curry leaves aren’t sold.',
      category: 'regional',
      imperfect: true,
      kcalDelta: 0,
    },
  ],
  'star-anise': [
    {
      id: 'staranise-fivespice',
      label: 'A pinch of five-spice powder',
      note: 'Five-spice already contains star anise, so this is the closest single swap.',
      category: 'pantry',
      kcalDelta: 0,
    },
  ],
  'chili-oil': [
    {
      id: 'chilioil-flakes',
      label: 'Chili flakes bloomed in warm neutral oil',
      note: 'Two minutes on low heat and you’ve made a rough version at home.',
      category: 'pantry',
      kcalDelta: -3,
    },
  ],
  parmesan: [
    {
      id: 'parmesan-nutyeast',
      label: 'Nutritional yeast',
      note: 'Savory and cheese-adjacent — a genuine vegan-cooking staple for this reason.',
      category: 'dietary',
      dietTags: ['vegan', 'dairyFree'],
      kcalDelta: -70,
      proteinDelta: 1,
      fatDelta: -7,
    },
  ],
  mirin: [
    {
      id: 'mirin-halal',
      label: 'Rice vinegar + a little extra sugar',
      note: 'Real mirin is a sweet rice wine — this alcohol-free mix is already the default in Crumb’s own recipes.',
      category: 'dietary',
      dietTags: ['halal'],
      kcalDelta: -2,
    },
    {
      id: 'mirin-applejuice',
      label: 'Apple juice, reduced slightly',
      note: 'Sweeter and fruitier than mirin, but alcohol-free and works in a pinch.',
      category: 'pantry',
      kcalDelta: 8,
    },
  ],
  'tortilla-flour': [
    {
      id: 'tortilla-corn',
      label: 'Corn tortillas',
      note: 'Naturally gluten-free — warm them longer so they don’t crack when folded.',
      category: 'dietary',
      dietTags: ['glutenFree'],
      kcalDelta: -20,
    },
  ],
};

/**
 * Resolve substitute options for an ingredient key, ranked so a match with
 * the user's stored dietary preferences surfaces first — not buried in a
 * generic list.
 */
export function getSubstitutes(key: string | undefined, dietPrefs: DietTag[]): SubOption[] {
  if (!key) return [];
  const options = SUBSTITUTES[key] ?? [];
  if (options.length === 0) return [];
  const prefSet = new Set(dietPrefs);
  const matchesPref = (o: SubOption) => (o.dietTags ?? []).some((t) => prefSet.has(t));
  return options
    .slice()
    .sort((a, b) => {
      const aMatch = matchesPref(a) ? 1 : 0;
      const bMatch = matchesPref(b) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      // Otherwise: pantry, then dietary, then regional, imperfect last.
      const order: Record<SubOption['category'], number> = { pantry: 0, dietary: 1, regional: 2 };
      if (!!a.imperfect !== !!b.imperfect) return a.imperfect ? 1 : -1;
      return order[a.category] - order[b.category];
    });
}
