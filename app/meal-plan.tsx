import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DishPhoto } from '../src/crumb/library/DishPhoto';
import { PhotoCover } from '../src/crumb/library/PhotoCover';
import { getProfile, Profile } from '../src/db/profile';
import { calcMacroTargets } from '../src/services/fitness';
import { buildMealPlan, MealPlan } from '../src/services/mealPlan';
import { CrumbTheme, fonts, radius, space, useTheme } from '../src/theme/crumb';
import { todayKey } from '../src/utils/date';
import { safeBack } from '../src/utils/navigation';

const CARD_HEIGHT = 150;

export default function MealPlanScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    getProfile().then((p) => {
      if (!p.subscribed) {
        router.replace('/subscribe');
        return;
      }
      setProfile(p);
      const macros = calcMacroTargets(p.weightKg ?? 70, p.goal, p.fitnessGoal ?? 'maintain');
      setPlan(buildMealPlan(p.goal, macros, p.diet, todayKey()));
    });
  }, []);

  if (!profile) return <View style={{ flex: 1, backgroundColor: theme.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 56, paddingHorizontal: space.xl, paddingBottom: insets.bottom + 40 }}>
        <Text style={[styles.title, { color: theme.ink }]}>Today's meal plan</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Sized to your {profile.goal.toLocaleString()} kcal target and your protein, carb, and fat needs.
        </Text>

        {plan ? (
          <View style={{ marginTop: 24, gap: 16 }}>
            <View style={[styles.totalCard, { backgroundColor: theme.accSoft }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: theme.acc }}>
                  {plan.totalKcal.toLocaleString()} kcal planned
                </Text>
                <Text style={{ fontFamily: fonts.sansLight, fontSize: 12.5, color: theme.acc }}>
                  Target: {plan.targetKcal.toLocaleString()} kcal
                </Text>
              </View>
              <View style={{ marginTop: 14, gap: 10 }}>
                <MacroRow theme={theme} label="Protein" actual={plan.totalMacros.proteinG} target={plan.targetMacros.proteinG} color={theme.acc} />
                <MacroRow theme={theme} label="Carbs" actual={plan.totalMacros.carbsG} target={plan.targetMacros.carbsG} color={theme.sage} />
                <MacroRow theme={theme} label="Fat" actual={plan.totalMacros.fatG} target={plan.targetMacros.fatG} color={theme.accDeep} />
              </View>
            </View>

            {plan.meals.map((m) => (
              <Pressable
                key={m.slot}
                onPress={() => router.push({ pathname: '/library/[id]', params: { id: m.recipe.id } })}
                style={[styles.mealCard, { backgroundColor: theme.surf, borderColor: theme.line }]}
              >
                <View style={{ borderRadius: radius.lg, overflow: 'hidden', width: 96, height: CARD_HEIGHT }}>
                  {m.recipe.photoSource ? (
                    <DishPhoto source={m.recipe.photoSource} height={CARD_HEIGHT} />
                  ) : (
                    <PhotoCover theme={theme} hue={m.recipe.hue} art={m.recipe.art} height={CARD_HEIGHT} />
                  )}
                </View>
                <View style={{ flex: 1, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.acc }}>
                    {m.slotLabel}
                  </Text>
                  <Text style={{ fontFamily: fonts.serif, fontSize: 17, color: theme.ink, marginTop: 3 }} numberOfLines={2}>
                    {m.recipe.title}
                  </Text>
                  <Text style={{ fontFamily: fonts.sansLight, fontSize: 12.5, color: theme.muted, marginTop: 4 }} numberOfLines={2}>
                    {m.recipe.description}
                  </Text>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12.5, color: theme.ink, marginTop: 6 }}>
                    {m.recipe.perServingKcal} kcal
                  </Text>
                  <Text style={{ fontFamily: fonts.sansLight, fontSize: 11.5, color: theme.muted, marginTop: 2 }}>
                    {m.recipe.perServing.protein}g protein · {m.recipe.perServing.carbs}g carbs · {m.recipe.perServing.fat}g fat
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.backBtnWrap, { top: insets.top + 8 }]}>
        <Pressable onPress={() => safeBack('/')} style={[styles.backBtn, { backgroundColor: theme.surf, borderColor: theme.line }]}>
          <Ionicons name="chevron-back" size={18} color={theme.ink} />
        </Pressable>
      </View>
    </View>
  );
}

function MacroRow({
  theme,
  label,
  actual,
  target,
  color,
}: {
  theme: CrumbTheme;
  label: string;
  actual: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(1, actual / target) : 0;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: theme.acc }}>{label}</Text>
        <Text style={{ fontFamily: fonts.sansLight, fontSize: 12, color: theme.acc }}>
          {actual}g / {target}g
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 30, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.sansLight, fontSize: 14.5, marginTop: 6, lineHeight: 21 },
  totalCard: { borderRadius: radius.lg, padding: 16 },
  mealCard: { flexDirection: 'row', gap: 14, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: 10 },
  backBtnWrap: { position: 'absolute', left: space.xl, zIndex: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
});
