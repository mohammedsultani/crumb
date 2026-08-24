# Crumb — Recipe & Nutrition Companion

A recipe app that doubles as a nutrition coach. The core idea is a **closed loop**:
browse a recipe → cook it → tap **"I made this"** → it's logged as a meal → calories &
macros roll into your day. The recipe library is the content engine that feeds tracking,
so logging is one tap instead of retyping what you ate.

Built with **Expo (React Native)** — one TypeScript codebase targets **iOS, Android, and web**.

## What's built (first pass)

- **Recipes** — library with search + diet/meal filters; create/edit recipes with
  ingredients linked to the USDA food database (so calories/macros calculate
  automatically), ordered steps with timers, favorites, and notes.
- **Recipe detail** — auto-calculated per-serving nutrition, a live **serving-size
  scaler** (rescales ingredients + nutrition), and a one-tap **"I made this"** logger.
- **Cook mode** — full-screen, high-contrast, screen stays awake (`expo-keep-awake`),
  swipe/tap through steps, per-step countdown timers.
- **Food Log** — daily diary split into Breakfast/Lunch/Dinner/Snacks with a running
  total + macro breakdown. Three ways to add: log a recipe, search a USDA food (with a
  gram portion), or manual quick-add. Edit/delete entries, log to past days, and export
  history to **CSV**.

Designed-but-not-yet-built (data model already accounts for them): calorie-target
dashboard, hydration reminders, cloud sync. See `.claude/plans/` for the full roadmap.

## Run it

```bash
npm install
npx expo start
```

Then:
- **Web:** press `w` (or open http://localhost:8081)
- **iOS / Android:** install **Expo Go** on your phone and scan the QR code

## USDA nutrition data (free)

Food search uses **USDA FoodData Central**. It works out of the box with a rate-limited
`DEMO_KEY`. For real use, grab a free key at
https://fdc.nal.usda.gov/api-key-signup.html and set it:

```bash
# .env
EXPO_PUBLIC_USDA_API_KEY=your_key_here
```

(See `src/config.ts`.)

## Project layout

```
app/                     Expo Router screens
  (tabs)/index.tsx       Recipes list
  (tabs)/log.tsx         Food log
  recipe/[id].tsx        Recipe detail (+ "I made this")
  recipe/edit.tsx        Create / edit recipe
  recipe/cook/[id].tsx   Cook mode
src/
  db/                    SQLite schema + repositories (recipes, foods, log) + seed
  services/              USDA search, recipe→log logging, CSV export
  utils/                 nutrition math, units, dates, food lookup
  components/            UI kit, nutrition displays, modals (food search, log sheet, add-entry)
  theme/                 colors, spacing, type scale
```

## Notes

- **Local-first:** all data is stored on-device in SQLite (`expo-sqlite`) and works
  offline. A cloud sync layer (Supabase) can be added later without changing call sites.
- **Web + SQLite:** `metro.config.js` bundles the wa-sqlite `.wasm` and serves COOP/COEP
  headers so the SQLite web worker can use `SharedArrayBuffer`.
