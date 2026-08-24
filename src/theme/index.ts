// One cohesive brand with two moods:
//  - "appetite" surfaces (recipes): warm, photo-forward, inviting
//  - "data" surfaces (log/tracker): clean, calm, high signal-to-noise
// Colors are chosen for AA contrast on their intended backgrounds.

export const colors = {
  // Brand
  primary: '#E8642C', // warm terracotta — appetite, CTAs
  primaryDark: '#C24E1C',
  primarySoft: '#FCEBE2',

  accent: '#2E9E7B', // fresh green — nutrition / positive
  accentSoft: '#E4F3EE',

  water: '#2F8FE0', // hydration blue
  waterSoft: '#E4F1FB',

  // Neutrals
  bg: '#FBF8F5', // warm off-white app background
  surface: '#FFFFFF',
  surfaceAlt: '#F4F0EB',
  border: '#EBE4DC',

  text: '#2A2622',
  textMuted: '#7A726A',
  textFaint: '#A79E95',

  // Macro colors (used consistently in rings/bars everywhere)
  protein: '#E8642C',
  carbs: '#E0A62F',
  fat: '#7B6FD0',

  success: '#2E9E7B',
  danger: '#D6453B',
  warning: '#E0A62F',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const font = {
  // Sizes tuned so cook mode is legible across a kitchen counter.
  h1: 30,
  h2: 24,
  h3: 20,
  body: 16,
  small: 14,
  tiny: 12,
  cook: 34, // cook-mode step text
} as const;

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
