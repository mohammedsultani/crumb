// Small id-stamping helpers used when authoring curated recipe content, so
// each ingredient/step line gets a stable, unique id without repeating
// boilerplate at every call site.

import type { LibraryIngredient, LibraryStep, StepPhase } from './types';

let n = 0;

export function ing(text: string, key?: string): LibraryIngredient {
  n += 1;
  return { id: `ing_${n}`, text, key };
}

/** Legacy, untagged step — defaults to the 'cook' phase. Prefer pstep() for new/rewritten content. */
export function step(text: string, minutes?: number): LibraryStep {
  n += 1;
  return { id: `step_${n}`, text, minutes, phase: 'cook' };
}

/** Phase-tagged step for the Prep / Cook / Finish & plate structure. */
export function pstep(text: string, phase: StepPhase, minutes?: number): LibraryStep {
  n += 1;
  return { id: `step_${n}`, text, minutes, phase };
}
