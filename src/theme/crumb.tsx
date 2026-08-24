// Crumb design system — warm, editorial, "slow food".
// Two themes: "Morning light" and "Midnight kitchen". Petrona (serif) for
// display, Jost (sans) for UI. Palette + tokens transcribed from the Crumb
// design (Crumb.dc.html).

import React, { createContext, useContext, useMemo, useState } from 'react';

export interface CrumbTheme {
  id: 'light' | 'dark';
  name: string;
  bg: string;
  surf: string;
  surf2: string;
  ink: string;
  muted: string;
  line: string;
  acc: string;
  accSoft: string;
  accDeep: string;
  sage: string;
  sageSoft: string;
  scrim: string;
}

export const lightTheme: CrumbTheme = {
  id: 'light',
  name: 'Morning light',
  bg: '#F8F3EA',
  surf: '#FFFCF6',
  surf2: '#F1E9DB',
  ink: '#2E241D',
  muted: '#8C7B6B',
  line: 'rgba(46,36,29,0.11)',
  acc: '#C4562E',
  accSoft: 'rgba(196,86,46,0.11)',
  accDeep: '#9E3F1E',
  sage: '#778D69',
  sageSoft: 'rgba(119,141,105,0.14)',
  scrim: 'rgba(255,252,246,0.84)',
};

export const darkTheme: CrumbTheme = {
  id: 'dark',
  name: 'Midnight kitchen',
  bg: '#1B1411',
  surf: '#241C18',
  surf2: '#2E241F',
  ink: '#F2E8DC',
  muted: '#9C8A7B',
  line: 'rgba(242,232,220,0.13)',
  acc: '#DB824B',
  accSoft: 'rgba(219,130,75,0.16)',
  accDeep: '#A85428',
  sage: '#93A98C',
  sageSoft: 'rgba(147,169,140,0.16)',
  scrim: 'rgba(36,28,24,0.82)',
};

// The cook-mode surface is always the dark "hearth" regardless of theme.
export const hearth = {
  bg: '#1A1310',
  ink: '#F5EADC',
  inkMuted: 'rgba(245,234,220,0.76)',
  faint: 'rgba(245,234,220,0.42)',
  line: 'rgba(245,234,220,0.2)',
  ember: '#D97A45',
};

// The hearth's palette reshaped as a CrumbTheme, so shared theme-aware
// components (sheets, ingredient rows, cards) can be dropped into Cook Mode
// and come out looking like they belong there.
export const hearthTheme: CrumbTheme = {
  id: 'dark',
  name: 'The hearth',
  bg: hearth.bg,
  surf: '#241B16',
  surf2: '#2E2219',
  ink: hearth.ink,
  muted: 'rgba(245,234,220,0.55)',
  line: hearth.line,
  acc: hearth.ember,
  accSoft: 'rgba(217,122,69,0.18)',
  accDeep: '#B85A2A',
  sage: '#93A98C',
  sageSoft: 'rgba(147,169,140,0.16)',
  scrim: 'rgba(26,19,16,0.85)',
};

// Font family names as registered by @expo-google-fonts.
export const fonts = {
  serifLight: 'Petrona_300Light',
  serif: 'Petrona_400Regular',
  serifMedium: 'Petrona_500Medium',
  serifItalic: 'Petrona_400Regular_Italic',
  sansLight: 'Jost_300Light',
  sans: 'Jost_400Regular',
  sansMedium: 'Jost_500Medium',
  sansSemi: 'Jost_600SemiBold',
} as const;

export const radius = { sm: 8, md: 16, lg: 20, xl: 26, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 32 };

interface ThemeCtx {
  theme: CrumbTheme;
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: lightTheme,
  mode: 'light',
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const value = useMemo<ThemeCtx>(
    () => ({
      mode,
      theme: mode === 'dark' ? darkTheme : lightTheme,
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
