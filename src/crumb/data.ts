// Static Crumb copy: the pantry of frequent foods and the onboarding lines.

export const PANTRY: { name: string; kcal: number; rot: number }[] = [
  { name: 'Greek yoghurt & honey', kcal: 210, rot: -8 },
  { name: 'Sourdough, one slice', kcal: 160, rot: 14 },
  { name: 'Roast chicken thigh', kcal: 290, rot: -3 },
  { name: 'Olive oil, a tablespoon', kcal: 120, rot: 22 },
  { name: 'Braised white beans', kcal: 340, rot: -16 },
  { name: 'Dark chocolate, two squares', kcal: 110, rot: 6 },
];

export const ONBOARDING: { title: string; body: string; cta: string }[] = [
  {
    title: "Come in, it's warm.",
    body: 'Crumb is a quiet place to keep what you eat and drink. No scolding, no red numbers — just a small trail of your days.',
    cta: 'Go on then',
  },
  {
    title: 'What are we aiming for?',
    body: 'You can change these whenever you like. Nothing here is a rule.',
    cta: "That'll do",
  },
  {
    title: 'One crumb at a time.',
    body: 'Log a bite, tip a glass, drop a crumb on the trail. Miss a day and nothing breaks — the trail just waits for you.',
    cta: 'Open the kitchen',
  },
];

// A month of kept/gap days for the trail (1 = kept, 0 = a small gap).
export const TRAIL_DAYS = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1];

export function greetingForNow(name = 'you'): string {
  const h = new Date().getHours();
  const part = h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
  return `${part}, ${name}.`;
}

export function vesselNote(left: number): string {
  if (left > 400) return `Room for a proper dinner, ${left.toLocaleString()} to go.`;
  if (left > 0) return `Nearly there — ${left.toLocaleString()} left, if you fancy something.`;
  return "That's the day. Well fed.";
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
}
