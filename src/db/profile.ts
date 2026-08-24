// Single-row profile: daily goals + onboarding flag. Stored as JSON in the
// `profile` table (id = 'me').

import { getDb } from './database';
import type { DietTag } from '../crumb/library/types';

export type Sex = 'female' | 'male';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type FitnessGoal = 'lose' | 'maintain' | 'gain';

export interface Profile {
  onboarded: boolean;
  goal: number; // daily kcal target
  waterGoal: number; // glasses
  darkAfterDark: boolean;
  /** Stored dietary preferences — used to rank Cook Mode substitute suggestions. */
  diet: DietTag[];

  // Quiz inputs (all optional — only set once someone's gone through the quiz).
  age?: number;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;

  /** Unlocks the personalized meal plan. No payment SDK is wired up yet —
   * see app/subscribe.tsx for the placeholder purchase flow. */
  subscribed: boolean;
}

const DEFAULT: Profile = {
  onboarded: false,
  goal: 2100,
  waterGoal: 8,
  darkAfterDark: false,
  diet: [],
  subscribed: false,
};

export async function getProfile(): Promise<Profile> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM profile WHERE id = ?', ['me']);
  if (!row) return { ...DEFAULT };
  try {
    return { ...DEFAULT, ...JSON.parse(row.data) };
  } catch {
    return { ...DEFAULT };
  }
}

export async function saveProfile(patch: Partial<Profile>): Promise<Profile> {
  const current = await getProfile();
  const next = { ...current, ...patch };
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO profile (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data',
    ['me', JSON.stringify(next)]
  );
  return next;
}
