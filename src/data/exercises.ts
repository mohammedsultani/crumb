// A small curated set of exercises for the quiz's free "starter" recommendations.
// Not a full training program — three goal-matched moves someone can start
// today, no equipment assumptions beyond what's noted.

import type { FitnessGoal } from '../db/profile';

export interface Exercise {
  id: string;
  name: string;
  detail: string; // sets/reps or duration
  note: string; // one line on form/why it's here
}

const BY_GOAL: Record<FitnessGoal, Exercise[]> = {
  lose: [
    {
      id: 'lose-brisk-walk',
      name: 'Brisk walk',
      detail: '25-30 minutes',
      note: 'Easy on the joints and genuinely effective — aim for a pace where talking is possible but singing isn’t.',
    },
    {
      id: 'lose-bodyweight-circuit',
      name: 'Bodyweight circuit',
      detail: '3 rounds: 10 squats, 10 push-ups, 20 sec plank',
      note: 'Minimal rest between moves keeps your heart rate up through the whole circuit.',
    },
    {
      id: 'lose-jump-rope',
      name: 'Jump rope intervals',
      detail: '8 rounds: 30 sec on, 30 sec rest',
      note: 'One of the highest calorie-burns per minute of anything on this list.',
    },
    {
      id: 'lose-stairs',
      name: 'Stair climbs',
      detail: '10 minutes continuous',
      note: 'If you don’t have a stair machine, a stairwell works exactly as well.',
    },
  ],
  maintain: [
    {
      id: 'maintain-full-body',
      name: 'Full-body strength',
      detail: '3 sets: 10 squats, 10 push-ups, 10 rows',
      note: 'Two to three sessions a week keeps muscle and metabolism steady without extra time in the gym.',
    },
    {
      id: 'maintain-steady-run',
      name: 'Steady-pace jog',
      detail: '20 minutes',
      note: 'A conversational pace — this is about consistency, not speed.',
    },
    {
      id: 'maintain-mobility',
      name: 'Mobility flow',
      detail: '10 minutes: hips, shoulders, spine',
      note: 'Easy to skip, but it’s what keeps everything else pain-free long-term.',
    },
    {
      id: 'maintain-cycle',
      name: 'Easy cycle',
      detail: '25 minutes',
      note: 'Low-impact cardio that’s gentle enough to do most days.',
    },
  ],
  gain: [
    {
      id: 'gain-squats',
      name: 'Squats',
      detail: '4 sets of 8-10',
      note: 'The single best return-on-investment move for building lower-body mass.',
    },
    {
      id: 'gain-push-pull',
      name: 'Push-up / row superset',
      detail: '4 sets: 10 push-ups + 10 rows',
      note: 'Pairing a push and a pull movement keeps your upper body balanced as you add weight.',
    },
    {
      id: 'gain-deadlift-hinge',
      name: 'Romanian deadlift (or hip hinge)',
      detail: '3 sets of 8',
      note: 'Builds the posterior chain — hamstrings and glutes — that squats and presses don’t reach.',
    },
    {
      id: 'gain-overhead-press',
      name: 'Overhead press',
      detail: '3 sets of 8',
      note: 'Shoulders lag behind everything else if you don’t train them directly — this fixes that.',
    },
  ],
};

/** Deterministic top-3 for a goal — the free tier's starter set. */
export function freeExercisesFor(goal: FitnessGoal): Exercise[] {
  return BY_GOAL[goal].slice(0, 3);
}
