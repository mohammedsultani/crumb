// Unit handling. We keep nutrition math in grams, so every ingredient unit must
// resolve to grams. Volume units use water-equivalent density (1 ml = 1 g) as a
// sensible default; users can always switch to weighing for accuracy.

export interface UnitDef {
  key: string;
  label: string;
  /** grams per one unit, or null when the unit is count-based (e.g. "piece"). */
  gramsPerUnit: number | null;
  kind: 'mass' | 'volume' | 'count';
}

export const UNITS: UnitDef[] = [
  { key: 'g', label: 'g', gramsPerUnit: 1, kind: 'mass' },
  { key: 'kg', label: 'kg', gramsPerUnit: 1000, kind: 'mass' },
  { key: 'oz', label: 'oz', gramsPerUnit: 28.3495, kind: 'mass' },
  { key: 'lb', label: 'lb', gramsPerUnit: 453.592, kind: 'mass' },
  { key: 'ml', label: 'ml', gramsPerUnit: 1, kind: 'volume' },
  { key: 'l', label: 'l', gramsPerUnit: 1000, kind: 'volume' },
  { key: 'tsp', label: 'tsp', gramsPerUnit: 4.93, kind: 'volume' },
  { key: 'tbsp', label: 'tbsp', gramsPerUnit: 14.79, kind: 'volume' },
  { key: 'cup', label: 'cup', gramsPerUnit: 236.6, kind: 'volume' },
  // Count-based: grams unknown until the user provides a per-piece weight.
  { key: 'piece', label: 'piece', gramsPerUnit: null, kind: 'count' },
  { key: 'serving', label: 'serving', gramsPerUnit: null, kind: 'count' },
];

export function getUnit(key: string): UnitDef | undefined {
  return UNITS.find((u) => u.key === key);
}

/**
 * Resolve an ingredient quantity to grams.
 * For count-based units the caller must supply gramsPerPiece; otherwise we fall
 * back to a rough 100 g/piece so the recipe still gets an estimate.
 */
export function toGrams(quantity: number, unitKey: string, gramsPerPiece = 100): number {
  const unit = getUnit(unitKey);
  if (!unit) return quantity; // treat unknown unit as already-grams
  if (unit.kind === 'count') return quantity * gramsPerPiece;
  return quantity * (unit.gramsPerUnit ?? 1);
}

// ---- Height / weight helpers for the profile (metric <-> imperial) ----

export const cmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number) =>
  Math.round((feet * 12 + inches) * 2.54);

export const kgToLb = (kg: number) => kg * 2.20462;
export const lbToKg = (lb: number) => lb / 2.20462;

export const mlToOz = (ml: number) => ml / 29.5735;
export const ozToMl = (oz: number) => oz * 29.5735;
