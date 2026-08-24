import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogSheet } from '../../src/components/LogSheet';
import { NutritionSummary } from '../../src/components/Nutrition';
import { loadAnyRecipe, NormalizedRecipe } from '../../src/crumb/library/anyRecipe';
import { Crumb } from '../../src/crumb/Visuals';
import { DishPhoto } from '../../src/crumb/library/DishPhoto';
import { PhotoCover } from '../../src/crumb/library/PhotoCover';
import { addLogEntry } from '../../src/db/log';
import { PHASE_LABELS, StepPhase } from '../../src/crumb/library/types';
import { fonts, radius, space, useTheme } from '../../src/theme/crumb';
import { todayKey } from '../../src/utils/date';
import { safeBack } from '../../src/utils/navigation';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<NormalizedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadAnyRecipe(id).then((r) => {
      if (active) {
        setRecipe(r);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  if (!recipe) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.muted, fontFamily: fonts.sansLight }}>That dish wandered off somewhere.</Text>
      </View>
    );
  }

  const perServing = {
    calories: recipe.perServingKcal,
    protein: recipe.perServing.protein,
    carbs: recipe.perServing.carbs,
    fat: recipe.perServing.fat,
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={{ marginHorizontal: 18, marginTop: insets.top + 8 }}>
          {recipe.photoSource ? (
            <DishPhoto source={recipe.photoSource} height={220} rounded={22} />
          ) : (
            <PhotoCover theme={theme} hue={recipe.hue} art={recipe.art} height={220} rounded={22} fadeBottom={false} />
          )}
        </View>

        <View style={{ paddingHorizontal: space.xl, paddingTop: 20 }}>
          {recipe.subTag ? (
            <Text style={[styles.subTag, { color: theme.acc }]}>{recipe.subTag.toUpperCase()}</Text>
          ) : null}
          <Text style={[styles.title, { color: theme.ink }]}>{recipe.title}</Text>
          {recipe.description ? <Text style={[styles.desc, { color: theme.muted }]}>{recipe.description}</Text> : null}

          <View style={[styles.metaCard, { backgroundColor: theme.surf, borderColor: theme.line }]}>
            <Meta icon="time-outline" label="Time" value={`${recipe.minutes}m`} theme={theme} />
            <Meta icon="speedometer-outline" label="Difficulty" value={cap(recipe.difficulty)} theme={theme} />
            <Meta icon="people-outline" label="Serves" value={String(recipe.servings)} theme={theme} />
          </View>

          {(recipe.passiveMinutes ?? 0) > 0 && (
            <Text style={[styles.timeSplit, { color: theme.muted }]}>
              {[
                recipe.prepMinutes ? `${recipe.prepMinutes}m prep` : null,
                recipe.activeMinutes ? `${recipe.activeMinutes}m active` : null,
                `${formatWait(recipe.passiveMinutes!)} hands-off`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}

          {(recipe.flavor?.length || recipe.occasion?.length || recipe.dietTags?.length) ? (
            <View style={styles.tagRow}>
              {[...(recipe.flavor ?? []), ...(recipe.occasion ?? []), ...(recipe.dietTags ?? [])].map((t) => (
                <View key={t} style={[styles.tag, { backgroundColor: theme.surf, borderColor: theme.line }]}>
                  <Text style={[styles.tagText, { color: theme.muted }]}>{cap(t)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ marginTop: space.lg }}>
            <NutritionSummary n={perServing} label="Per serving" />
          </View>

          {recipe.ingredients.length > 0 && (
            <>
              <Text style={[styles.section, { color: theme.muted }]}>You'll need</Text>
              <View style={{ gap: 9, marginBottom: 6 }}>
                {recipe.ingredients.map((ing) => (
                  <View key={ing.id} style={{ flexDirection: 'row', gap: 11, alignItems: 'baseline' }}>
                    <Crumb size={5} color={theme.acc} rotate={0} />
                    <Text style={[styles.ingText, { color: theme.ink }]}>{ing.text}</Text>
                  </View>
                ))}
              </View>
              {recipe.steps.length > 0 && (
                <Text style={[styles.swapHint, { color: theme.muted }]}>
                  Missing something? Swap options show up right on the ingredient once you're cooking.
                </Text>
              )}
            </>
          )}

          {recipe.steps.length > 0 && (
            <>
              <Text style={[styles.section, { color: theme.muted }]}>Instructions</Text>
              {(['prep', 'cook', 'finish'] as StepPhase[]).map((phase) => {
                const phaseSteps = recipe.steps.filter((s) => s.phase === phase);
                if (phaseSteps.length === 0) return null;
                return (
                  <View key={phase} style={{ marginBottom: 14 }}>
                    <Text style={[styles.phaseLabel, { color: theme.acc }]}>{PHASE_LABELS[phase]}</Text>
                    <View style={{ gap: 10 }}>
                      {phaseSteps.map((s, i) => (
                        <View key={s.id} style={{ flexDirection: 'row', gap: 11 }}>
                          <Text style={[styles.stepNum, { color: theme.muted }]}>{i + 1}</Text>
                          <Text style={[styles.stepText, { color: theme.ink }]}>
                            {s.text}
                            {s.minutes ? <Text style={{ color: theme.muted }}>{`  (${s.minutes}m)`}</Text> : null}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {recipe.chefTips && recipe.chefTips.length > 0 && (
            <View style={[styles.tipsCard, { backgroundColor: theme.surf, borderColor: theme.line }]}>
              <Text style={[styles.tipsTitle, { color: theme.ink }]}>Chef's tips</Text>
              {recipe.chefTips.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 9, marginTop: i === 0 ? 8 : 6 }}>
                  <Crumb size={5} color={theme.acc} rotate={0} />
                  <Text style={[styles.tipText, { color: theme.muted }]}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: insets.bottom + space.sm, backgroundColor: theme.surf, borderTopColor: theme.line }]}>
        {recipe.steps.length > 0 && (
          <Pressable
            onPress={() => router.push({ pathname: '/library/cook/[id]', params: { id: recipe.id } })}
            style={[styles.ctaGhost, { borderColor: theme.line, backgroundColor: theme.surf }]}
          >
            <Text style={[styles.ctaGhostText, { color: theme.ink }]}>Cook it</Text>
          </Pressable>
        )}
        <Pressable onPress={() => setSheetOpen(true)} style={[styles.cta, { backgroundColor: theme.acc, flex: recipe.steps.length > 0 ? 1.4 : 1 }]}>
          <Text style={styles.ctaText}>Log this meal</Text>
        </Pressable>
      </View>

      <View style={[styles.backBtnWrap, { top: insets.top + 8 }]}>
        <Pressable onPress={() => safeBack('/library')} style={[styles.backBtn, { backgroundColor: theme.surf, borderColor: theme.line }]}>
          <Ionicons name="chevron-back" size={18} color={theme.ink} />
        </Pressable>
      </View>

      <LogSheet
        visible={sheetOpen}
        title={recipe.title}
        perServing={perServing}
        confirmLabel="Log meal"
        onClose={() => setSheetOpen(false)}
        onConfirm={async ({ meal, servings, date }) => {
          await addLogEntry({
            date,
            meal,
            source: 'recipe',
            recipeId: recipe.id,
            name: recipe.title,
            servings,
            nutrition: perServing,
          });
          setSheetOpen(false);
          Alert.alert('Logged ✓', `${recipe.title} added to your jar.`);
          safeBack('/');
        }}
      />
    </View>
  );
}

function Meta({ icon, label, value, theme }: { icon: any; label: string; value: string; theme: any }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={theme.acc} />
      <Text style={[styles.metaValue, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.metaLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function formatWait(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subTag: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.5, marginBottom: 6 },
  title: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, letterSpacing: -0.4, marginBottom: 8 },
  desc: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 24, marginBottom: 4 },
  metaCard: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.md,
    marginTop: space.lg,
  },
  meta: { flex: 1, alignItems: 'center', gap: 3 },
  metaValue: { fontFamily: fonts.sansMedium, fontSize: 15 },
  metaLabel: { fontFamily: fonts.sans, fontSize: 11 },
  section: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  ingText: { fontFamily: fonts.sansLight, fontSize: 15, lineHeight: 21, flex: 1 },
  swapHint: { fontFamily: fonts.sansLight, fontSize: 12.5, fontStyle: 'italic', marginTop: 10, lineHeight: 18 },
  timeSplit: { fontFamily: fonts.sansLight, fontSize: 12.5, marginTop: 8, textAlign: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  tagText: { fontFamily: fonts.sansMedium, fontSize: 11.5 },
  phaseLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepNum: { fontFamily: fonts.sansMedium, fontSize: 14, width: 16 },
  stepText: { fontFamily: fonts.sansLight, fontSize: 15, lineHeight: 22, flex: 1 },
  tipsCard: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tipsTitle: { fontFamily: fonts.sansMedium, fontSize: 13.5 },
  tipText: { fontFamily: fonts.sansLight, fontSize: 13.5, lineHeight: 19, flex: 1 },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: { height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: fonts.sansMedium, fontSize: 15.5, color: '#FFF7EE' },
  ctaGhost: { flex: 1, height: 56, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  ctaGhostText: { fontFamily: fonts.sans, fontSize: 15.5 },
  backBtnWrap: { position: 'absolute', left: space.xl, zIndex: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
