import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FoodSearchModal } from '../src/components/FoodSearchModal';
import { CrumbSheet, EntryVM, JarBody, LogBody, TrailBody, WeekBody, YouBody } from '../src/crumb/Sheets';
import { Onboarding, QuizData } from '../src/crumb/Onboarding';
import { Crumb, Trail, Vessel, WaterGlass } from '../src/crumb/Visuals';
import { TRAIL_DAYS, formatTime, greetingForNow, vesselNote } from '../src/crumb/data';
import type { DietTag } from '../src/crumb/library/types';
import { addLogEntry, getLogForDate } from '../src/db/log';
import { getProfile, Profile, saveProfile } from '../src/db/profile';
import { addGlass, glassesForDate, removeLastGlass } from '../src/db/water';
import { computeQuizResult, ftInToCm, lbToKg } from '../src/services/fitness';
import { guessMeal } from '../src/services/logging';
import { fonts, radius, space, useTheme } from '../src/theme/crumb';
import { todayKey } from '../src/utils/date';

const DEFAULT_QUIZ: QuizData = {
  age: 30,
  sex: 'female',
  heightFt: 5,
  heightIn: 6,
  weightLb: 150,
  activityLevel: 'moderate',
  fitnessGoal: 'maintain',
};

type SheetName = 'log' | 'jar' | 'trail' | 'week' | 'you';

const TODAY = todayKey();

export default function TodayScreen() {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<EntryVM[]>([]);
  const [total, setTotal] = useState(0);
  const [glasses, setGlasses] = useState(0);

  // local UI
  const [obStep, setObStep] = useState(0);
  const [quiz, setQuiz] = useState<QuizData>(DEFAULT_QUIZ);
  const [goal, setGoal] = useState(2100);
  const [waterGoal, setWaterGoal] = useState(8);
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toggles, setToggles] = useState([true, true, false, mode === 'dark']);

  const load = useCallback(async () => {
    const [p, log, g] = await Promise.all([getProfile(), getLogForDate(TODAY), glassesForDate(TODAY)]);
    setProfile(p);
    setGoal(p.goal);
    setWaterGoal(p.waterGoal);

    const t = log.reduce((a, e) => a + e.nutrition.calories * e.servings, 0);
    setTotal(Math.round(t));
    setEntries(
      log
        .slice()
        .reverse()
        .map((e) => ({ id: e.id, name: e.name, time: formatTime(e.createdAt), kcal: Math.round(e.nutrition.calories * e.servings) }))
    );
    setGlasses(g);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!profile) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  // ----- Onboarding -----
  if (!profile.onboarded) {
    const quizResult = computeQuizResult({
      sex: quiz.sex,
      weightKg: lbToKg(quiz.weightLb),
      heightCm: ftInToCm(quiz.heightFt, quiz.heightIn),
      age: quiz.age,
      activityLevel: quiz.activityLevel,
      fitnessGoal: quiz.fitnessGoal,
    });

    return (
      <>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Onboarding
          theme={theme}
          step={obStep}
          quiz={quiz}
          onQuizField={(patch) => setQuiz((prev) => ({ ...prev, ...patch }))}
          calorieGoal={quizResult.calorieGoal}
          waterGoal={quizResult.waterGoalGlasses}
          macros={quizResult.macros}
          onBack={() => setObStep((s) => Math.max(0, s - 1))}
          onNext={async () => {
            if (obStep < 6) {
              setObStep(obStep + 1);
            } else {
              await saveProfile({
                onboarded: true,
                goal: quizResult.calorieGoal,
                waterGoal: quizResult.waterGoalGlasses,
                age: quiz.age,
                sex: quiz.sex,
                heightCm: Math.round(ftInToCm(quiz.heightFt, quiz.heightIn)),
                weightKg: Math.round(lbToKg(quiz.weightLb)),
                activityLevel: quiz.activityLevel,
                fitnessGoal: quiz.fitnessGoal,
              });
              await load();
            }
          }}
        />
      </>
    );
  }

  // ----- derived -----
  const pct = goal > 0 ? Math.min(1, total / goal) : 0;
  const left = goal - total;
  const jarTiles = entries
    .slice(0, 8)
    .reverse()
    .map((e) => ({
      h: Math.max(9, Math.round(e.kcal / 9)),
      color: e.kcal > 250 ? theme.acc : e.kcal > 120 ? theme.accSoft : theme.sageSoft,
    }));
  const jarTilesSmall = jarTiles.map((t) => ({ h: Math.max(5, Math.round(t.h * 0.4)), color: t.color }));

  // Week bars: prior days illustrative, today real.
  const weekVals = [1980, 2240, 1760, 2090, 2310, 1890, total];
  const weekMax = 2600;
  const week = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].map((day, i) => ({
    day,
    val: weekVals[i].toLocaleString(),
    hPx: Math.round((weekVals[i] / weekMax) * 150),
    isToday: i === 6,
  }));

  // ----- actions -----
  const addFood = async (name: string, kcal: number) => {
    await addLogEntry({
      date: TODAY,
      meal: guessMeal(),
      source: 'manual',
      name,
      servings: 1,
      nutrition: { calories: kcal, protein: 0, carbs: 0, fat: 0 },
    });
    await load();
    setSheet('jar');
  };

  const onWaterAdd = async () => {
    await addGlass(TODAY);
    setGlasses((g) => Math.min(waterGoal, g + 1));
  };
  const onWaterUndo = async () => {
    await removeLastGlass(TODAY);
    setGlasses((g) => Math.max(0, g - 1));
  };

  const flipToggle = (i: number) => {
    setToggles((prev) => {
      const next = prev.slice();
      next[i] = !next[i];
      if (i === 3) setMode(next[3] ? 'dark' : 'light');
      return next;
    });
  };

  const toggleDiet = async (tag: DietTag) => {
    const next = profile.diet.includes(tag) ? profile.diet.filter((t) => t !== tag) : [...profile.diet, tag];
    const saved = await saveProfile({ diet: next });
    setProfile(saved);
  };

  const closeSheet = () => setSheet(null);
  const tallSheet = sheet === 'log' || sheet === 'you';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 22, paddingBottom: insets.bottom + 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ gap: 5 }}>
            <Text style={[styles.date, { color: theme.muted }]}>{longDate()}</Text>
            <Text style={[styles.greeting, { color: theme.ink }]}>{greetingForNow()}</Text>
          </View>
          <Pressable onPress={() => setSheet('you')} style={[styles.avatar, { backgroundColor: theme.surf2, borderColor: theme.line }]}>
            <Crumb size={13} color={theme.acc} />
          </Pressable>
        </View>

        {/* Vessel */}
        <View style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.line, alignItems: 'center' }]}>
          <Vessel pct={pct} kcalTotal={total.toLocaleString()} goalLabel={goal.toLocaleString()} note={vesselNote(left)} theme={theme} />
        </View>

        {/* Water */}
        <View style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 20 }]}>
          <Pressable onPress={onWaterAdd}>
            <WaterGlass pct={waterGoal > 0 ? glasses / waterGoal : 0} theme={theme} />
          </Pressable>
          <View style={{ flex: 1, gap: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: theme.ink }}>Water</Text>
              <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: theme.muted }}>
                {glasses} of {waterGoal}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {Array.from({ length: waterGoal }).map((_, i) => (
                <View key={i} style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: i < glasses ? theme.sage : theme.line }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
              <Pressable onPress={onWaterAdd} style={[styles.waterBtn, { backgroundColor: theme.sageSoft }]}>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: theme.sage }}>＋ a glass</Text>
              </Pressable>
              <Pressable onPress={onWaterUndo} style={[styles.waterUndo, { borderColor: theme.line }]}>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: theme.muted }}>undo</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Jar preview */}
        <Pressable onPress={() => setSheet('jar')} style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 20 }]}>
          <MiniJar tiles={jarTilesSmall} theme={theme} />
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 17, color: theme.ink }}>Today's jar</Text>
            <Text style={{ fontFamily: fonts.sansLight, fontSize: 14, lineHeight: 20, color: theme.muted }}>
              {entries.length} {entries.length === 1 ? 'thing' : 'things'} so far, {total.toLocaleString()} kcal between them.
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.sansLight, fontSize: 18, color: theme.muted }}>›</Text>
        </Pressable>

        {/* Trail strip */}
        <Pressable onPress={() => setSheet('trail')} style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.line }]}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 17, color: theme.ink }}>Your trail</Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: theme.muted }}>12 days</Text>
          </View>
          <Trail days={TRAIL_DAYS} theme={theme} compact />
        </Pressable>

        {/* Shortcuts */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Pressable onPress={() => router.push('/library')} style={[styles.shortcut, { backgroundColor: theme.surf, borderColor: theme.line }]}>
            <View style={{ width: 26, height: 22, borderRadius: 4, borderWidth: 1.5, borderLeftWidth: 3, borderColor: theme.acc, transform: [{ rotate: '-3deg' }] }} />
            <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: theme.ink }}>Recipes</Text>
          </Pressable>
          <Pressable onPress={() => setSheet('week')} style={[styles.shortcut, { backgroundColor: theme.surf, borderColor: theme.line }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 }}>
              <View style={{ width: 4, height: 9, borderRadius: 2, backgroundColor: theme.sage }} />
              <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: theme.sage }} />
              <View style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: theme.sage }} />
              <View style={{ width: 4, height: 21, borderRadius: 2, backgroundColor: theme.acc }} />
            </View>
            <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: theme.ink }}>This week</Text>
          </Pressable>
        </View>

        {/* Meal plan */}
        <Pressable
          onPress={() => router.push(profile.subscribed ? '/meal-plan' : '/subscribe')}
          style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }]}
        >
          <View style={[styles.mealPlanIcon, { backgroundColor: theme.accSoft }]}>
            <Ionicons name="restaurant-outline" size={20} color={theme.acc} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 17, color: theme.ink }}>Your meal plan</Text>
            <Text style={{ fontFamily: fonts.sansLight, fontSize: 13, lineHeight: 18, color: theme.muted }}>
              {profile.subscribed ? 'Today’s meals, sized to your goal.' : 'A day of meals built to your target — $1.99/mo.'}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.sansLight, fontSize: 18, color: theme.muted }}>›</Text>
        </Pressable>
      </ScrollView>

      {/* Log button */}
      <View style={[styles.logBar, { paddingBottom: insets.bottom + 20 }]} pointerEvents="box-none">
        <Pressable onPress={() => setSheet('log')} style={[styles.logBtn, { backgroundColor: theme.acc }]}>
          <Text style={{ fontFamily: fonts.sansLight, fontSize: 19, color: '#FFF7EE', marginTop: -2 }}>＋</Text>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: '#FFF7EE' }}>  Log something</Text>
        </Pressable>
      </View>

      {/* Sheets */}
      <CrumbSheet visible={!!sheet} theme={theme} tall={tallSheet} onClose={closeSheet}>
        {sheet === 'log' && (
          <LogBody theme={theme} onAdd={(n, k) => addFood(n, k)} onSearch={() => setSearchOpen(true)} />
        )}
        {sheet === 'jar' && (
          <JarBody
            theme={theme}
            tiles={jarTiles}
            entries={entries}
            total={total}
            note={`${entries.length} things so far, ${total.toLocaleString()} kcal between them.`}
          />
        )}
        {sheet === 'trail' && <TrailBody theme={theme} days={TRAIL_DAYS} streakDays={12} monthTotal={19} />}
        {sheet === 'week' && (
          <WeekBody theme={theme} week={week} goalLineBottom={Math.round((goal / weekMax) * 150) + 26} avg="2,038" />
        )}
        {sheet === 'you' && (
          <YouBody
            theme={theme}
            goalLabel={goal.toLocaleString()}
            waterGoal={waterGoal}
            diet={profile.diet}
            onToggleDiet={toggleDiet}
            toggles={[
              { label: 'A droplet when you log water', sub: 'The faintest sound, nothing more', on: toggles[0] },
              { label: 'A wooden knock at your goal', sub: 'Like a lid settling onto a pot', on: toggles[1] },
              { label: 'Evening nudge', sub: "A single reminder at eight, if the day's still empty", on: toggles[2] },
              { label: 'Follow the light', sub: 'Switch to the midnight kitchen after dark', on: toggles[3] },
            ]}
            onToggle={flipToggle}
            onRetakeQuiz={async () => {
              setSheet(null);
              setObStep(0);
              setQuiz(DEFAULT_QUIZ);
              await saveProfile({ onboarded: false });
              await load();
            }}
          />
        )}
      </CrumbSheet>

      {/* USDA search from the log sheet */}
      <FoodSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(food) => {
          setSearchOpen(false);
          addFood(food.name, Math.round(food.per100g.calories));
        }}
      />
    </View>
  );
}

function MiniJar({ tiles, theme }: { tiles: { h: number; color: string }[]; theme: any }) {
  return (
    <View style={{ width: 62, height: 82 }}>
      <View style={{ position: 'absolute', left: 11, right: 11, top: 0, height: 9, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderWidth: 1.5, borderBottomWidth: 0, borderColor: theme.line, backgroundColor: theme.surf2 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 9, bottom: 0, borderWidth: 1.5, borderColor: theme.line, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, backgroundColor: theme.surf2, overflow: 'hidden', flexDirection: 'column-reverse', padding: 4, gap: 3 }}>
        {tiles.map((t, i) => (
          <View key={i} style={{ height: t.h, borderRadius: 3, backgroundColor: t.color }} />
        ))}
      </View>
    </View>
  );
}

function longDate(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  date: { fontFamily: fonts.sans, fontSize: 11.5, letterSpacing: 2.1, textTransform: 'uppercase' },
  greeting: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, letterSpacing: -0.4 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.xl, padding: 22, marginBottom: 14 },
  waterBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 16 },
  waterUndo: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  shortcut: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 22, padding: 18, gap: 22 },
  mealPlanIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  logBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22 },
  logBtn: { height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
