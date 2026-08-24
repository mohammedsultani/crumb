import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogSheet } from '../../../src/components/LogSheet';
import { firstSentence, restOfSentence, StepTimer } from '../../../src/crumb/CookTimer';
import { loadAnyRecipe, NormalizedRecipe } from '../../../src/crumb/library/anyRecipe';
import { IngredientSwapRow } from '../../../src/crumb/library/IngredientSwapRow';
import { getSubstitutes } from '../../../src/crumb/library/substitutes';
import { SubstitutePicker } from '../../../src/crumb/library/SubstitutePicker';
import type { LibraryIngredient, SubOption } from '../../../src/crumb/library/types';
import { addLogEntry } from '../../../src/db/log';
import { getProfile, Profile } from '../../../src/db/profile';
import { PHASE_LABELS } from '../../../src/crumb/library/types';
import { fonts, hearth, hearthTheme } from '../../../src/theme/crumb';
import { safeBack } from '../../../src/utils/navigation';

export default function LibraryCookModeScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState<NormalizedRecipe | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phase, setPhase] = useState<number>(-1); // -1 = "before you start"
  const [subs, setSubs] = useState<Record<string, SubOption>>({});
  const [picking, setPicking] = useState<LibraryIngredient | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    loadAnyRecipe(id).then(setRecipe);
    getProfile().then(setProfile);
  }, [id]);

  const steps = recipe?.steps ?? [];
  const step = phase >= 0 ? steps[phase] : undefined;
  const atEnd = phase >= 0 && phase >= steps.length - 1;

  const adjustedPerServing = useMemo(() => {
    if (!recipe) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const base = { calories: recipe.perServingKcal, protein: recipe.perServing.protein, carbs: recipe.perServing.carbs, fat: recipe.perServing.fat };
    return Object.values(subs).reduce(
      (acc, s) => ({
        calories: acc.calories + s.kcalDelta,
        protein: acc.protein + (s.proteinDelta ?? 0),
        carbs: acc.carbs + (s.carbsDelta ?? 0),
        fat: acc.fat + (s.fatDelta ?? 0),
      }),
      base
    );
  }, [recipe, subs]);

  const activeDelta = adjustedPerServing.calories - (recipe?.perServingKcal ?? 0);

  if (!recipe) return <View style={[styles.root, { backgroundColor: hearth.bg }]} />;

  const pickerOptions = picking ? getSubstitutes(picking.key, profile?.diet ?? []) : [];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {phase === -1 ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.header}>
            <Text style={styles.stepOf}>Before you start</Text>
            <Pressable onPress={() => safeBack(`/library/${id}`)} hitSlop={12} style={styles.close}>
              <Text style={{ color: hearth.faint, fontFamily: fonts.sansLight, fontSize: 16 }}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.introTitle}>{recipe.title}</Text>
          <Text style={styles.introSub}>
            {recipe.ingredients.length} ingredients · tap one to swap it
          </Text>

          <View style={{ marginTop: 22 }}>
            {recipe.ingredients.map((ing) => {
              const options = getSubstitutes(ing.key, profile?.diet ?? []);
              return (
                <IngredientSwapRow
                  key={ing.id}
                  theme={hearthTheme}
                  ingredient={ing}
                  hasOptions={options.length > 0}
                  activeSub={subs[ing.id]}
                  onPressSwap={() => setPicking(ing)}
                />
              );
            })}
          </View>

          {activeDelta !== 0 && (
            <View style={styles.nudge}>
              <Ionicons name="trending-down" size={14} color={hearth.ember} />
              <Text style={styles.nudgeText}>
                With your swaps: {Math.round(adjustedPerServing.calories)} kcal a serving ({activeDelta > 0 ? '+' : ''}
                {Math.round(activeDelta)} from the original)
              </Text>
            </View>
          )}

          <Pressable style={styles.beginBtn} onPress={() => setPhase(0)}>
            <Text style={styles.beginText}>Begin cooking</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.stepOf}>
              Step {phase + 1} of {steps.length}
              {step?.phase ? ` · ${PHASE_LABELS[step.phase]}` : ''}
            </Text>
            <Pressable onPress={() => safeBack(`/library/${id}`)} hitSlop={12} style={styles.close}>
              <Text style={{ color: hearth.faint, fontFamily: fonts.sansLight, fontSize: 16 }}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.progressRow}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.progressDot, { backgroundColor: i <= phase ? hearth.ember : hearth.line }]} />
            ))}
          </View>

          <View style={styles.content}>
            <Pressable style={styles.tapLeft} disabled={phase === 0} onPress={() => setPhase((p) => Math.max(0, p - 1))} />
            <Pressable style={styles.tapRight} disabled={atEnd} onPress={() => setPhase((p) => Math.min(steps.length - 1, p + 1))} />
            <View pointerEvents="box-none" style={{ paddingHorizontal: 4 }}>
              <Text style={styles.stepTitle}>{step?.text ? firstSentence(step.text) : ''}</Text>
              {step?.text && restOfSentence(step.text) ? <Text style={styles.stepBody}>{restOfSentence(step.text)}</Text> : null}
              {step?.minutes ? <StepTimer key={step.id} seconds={step.minutes * 60} /> : null}
            </View>
          </View>

          <View style={styles.navRow}>
            <Pressable
              style={[styles.back, phase === 0 && { opacity: 0.35 }]}
              disabled={phase === 0}
              onPress={() => setPhase((p) => Math.max(0, p - 1))}
            >
              <Text style={{ color: hearth.inkMuted, fontFamily: fonts.sansLight, fontSize: 20 }}>‹</Text>
            </Pressable>
            <Pressable
              style={styles.next}
              onPress={() => (atEnd ? setLogOpen(true) : setPhase((p) => p + 1))}
            >
              <Text style={{ color: hearth.bg, fontFamily: fonts.sansMedium, fontSize: 16 }}>
                {atEnd ? "That's it — log it" : 'Next'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <SubstitutePicker
        visible={!!picking}
        theme={hearthTheme}
        ingredientText={picking?.text ?? ''}
        options={pickerOptions}
        activeId={picking ? subs[picking.id]?.id : undefined}
        onSelect={(opt) => {
          if (picking) setSubs((s) => ({ ...s, [picking.id]: opt }));
          setPicking(null);
        }}
        onClear={() => {
          if (picking) setSubs((s) => { const next = { ...s }; delete next[picking.id]; return next; });
          setPicking(null);
        }}
        onClose={() => setPicking(null)}
      />

      <LogSheet
        visible={logOpen}
        title={recipe.title}
        perServing={adjustedPerServing}
        confirmLabel="Log meal"
        onClose={() => setLogOpen(false)}
        onConfirm={async ({ meal, servings, date }) => {
          await addLogEntry({
            date,
            meal,
            source: 'recipe',
            recipeId: recipe.id,
            name: recipe.title,
            servings,
            nutrition: adjustedPerServing,
          });
          setLogOpen(false);
          Alert.alert('Logged ✓', `${recipe.title} added to your jar.`);
          router.replace('/');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: hearth.bg, paddingHorizontal: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 34, paddingBottom: 8 },
  stepOf: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', color: hearth.faint },
  close: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: hearth.line, alignItems: 'center', justifyContent: 'center' },
  introTitle: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 40, color: hearth.ink, marginTop: 18, letterSpacing: -0.5 },
  introSub: { fontFamily: fonts.sansLight, fontSize: 14.5, color: hearth.inkMuted, marginTop: 8 },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: hearth.line,
  },
  nudgeText: { fontFamily: fonts.sansLight, fontSize: 13, color: hearth.inkMuted, flex: 1, lineHeight: 18 },
  beginBtn: {
    marginTop: 28,
    height: 58,
    borderRadius: 20,
    backgroundColor: hearth.ember,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginText: { fontFamily: fonts.sansMedium, fontSize: 16, color: hearth.bg },
  progressRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  progressDot: { flex: 1, height: 5, borderRadius: 3 },
  content: { flex: 1, justifyContent: 'center' },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%' },
  stepTitle: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 48, letterSpacing: -0.8, color: hearth.ink, marginBottom: 20 },
  stepBody: { fontFamily: fonts.sansLight, fontSize: 20, lineHeight: 32, color: hearth.inkMuted },
  navRow: { flexDirection: 'row', gap: 12, paddingVertical: 20 },
  back: { width: 62, height: 58, borderRadius: 20, borderWidth: 1, borderColor: hearth.line, alignItems: 'center', justifyContent: 'center' },
  next: { flex: 1, height: 58, borderRadius: 20, backgroundColor: hearth.ember, alignItems: 'center', justifyContent: 'center' },
});
