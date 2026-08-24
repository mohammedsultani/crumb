// Quiz-driven calorie and hydration targets. Formulas are standard,
// well-established estimates — not medical advice, and deliberately
// conservative (nothing below a safe floor).

import type { ActivityLevel, FitnessGoal, Sex } from '../db/profile';

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary — little to no exercise',
  light: 'Light — exercise 1-3 days a week',
  moderate: 'Moderate — exercise 3-5 days a week',
  active: 'Active — exercise 6-7 days a week',
  veryActive: 'Very active — hard exercise or a physical job',
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose: 'Lose weight',
  maintain: 'Maintain weight',
  gain: 'Build muscle',
};

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

/** Mifflin-St Jeor — the formula most dietitians default to for resting energy needs. */
export function calcBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activity];
}

/** Daily calorie target for the stated goal, rounded to the nearest 10 and floored for safety. */
export function calcCalorieGoal(tdee: number, goal: FitnessGoal): number {
  const adjusted = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 350 : tdee;
  return Math.max(1200, Math.round(adjusted / 10) * 10);
}

/** ~35ml per kg of body weight is the common baseline hydration estimate, converted to 8oz/250ml glasses. */
export function calcWaterGoalGlasses(weightKg: number): number {
  const ml = weightKg * 35;
  const glasses = Math.round(ml / 250);
  return Math.max(6, Math.min(14, glasses));
}

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// Protein scaled to body weight (preserves/builds muscle regardless of a
// deficit or surplus — the thing flat percentage splits get wrong), fat as a
// percentage of total calories, carbs fill whatever's left.
const PROTEIN_PER_KG: Record<FitnessGoal, number> = { lose: 2.0, maintain: 1.6, gain: 1.8 };
const FAT_PERCENT: Record<FitnessGoal, number> = { lose: 0.25, maintain: 0.3, gain: 0.25 };

export function calcMacroTargets(weightKg: number, calorieGoal: number, goal: FitnessGoal): MacroTargets {
  const proteinG = Math.round(weightKg * PROTEIN_PER_KG[goal]);
  const proteinKcal = proteinG * 4;
  const fatKcal = calorieGoal * FAT_PERCENT[goal];
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = Math.max(0, calorieGoal - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);
  return { proteinG, carbsG, fatG };
}

export interface QuizResult {
  bmr: number;
  tdee: number;
  calorieGoal: number;
  waterGoalGlasses: number;
  macros: MacroTargets;
}

export function computeQuizResult(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
}): QuizResult {
  const bmr = calcBMR(input.sex, input.weightKg, input.heightCm, input.age);
  const tdee = calcTDEE(bmr, input.activityLevel);
  const calorieGoal = calcCalorieGoal(tdee, input.fitnessGoal);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieGoal,
    waterGoalGlasses: calcWaterGoalGlasses(input.weightKg),
    macros: calcMacroTargets(input.weightKg, calorieGoal, input.fitnessGoal),
  };
}

// --- Unit conversions for the quiz's imperial inputs ---
export const lbToKg = (lb: number) => lb * 0.453592;
export const kgToLb = (kg: number) => kg / 0.453592;
export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * 2.54;
export const cmToFtIn = (cm: number): { ft: number; inch: number } => {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return inch === 12 ? { ft: ft + 1, inch: 0 } : { ft, inch };
};
