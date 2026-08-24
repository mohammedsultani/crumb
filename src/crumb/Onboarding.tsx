// Crumb's welcome flow: an intro, a short quiz (age, sex, height, weight,
// activity, goal), a free results screen (calorie + hydration target and
// three starter exercises), then the close. Warm, unhurried, "nothing here
// is a rule" — every field has a sensible default so someone can tap through
// without typing anything, or adjust what matters to them.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ActivityLevel, FitnessGoal, Sex } from '../db/profile';
import { ACTIVITY_LABELS, GOAL_LABELS, MacroTargets } from '../services/fitness';
import { freeExercisesFor } from '../data/exercises';
import { CrumbTheme, fonts } from '../theme/crumb';
import { ONBOARDING } from './data';

export interface QuizData {
  age: number;
  sex: Sex;
  heightFt: number;
  heightIn: number;
  weightLb: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
}

const TOTAL_STEPS = 7; // welcome, about-you, body, activity, goal, results, close

export function Onboarding({
  theme,
  step,
  quiz,
  onQuizField,
  calorieGoal,
  waterGoal,
  macros,
  onNext,
  onBack,
}: {
  theme: CrumbTheme;
  step: number;
  quiz: QuizData;
  onQuizField: (patch: Partial<QuizData>) => void;
  calorieGoal: number;
  waterGoal: number;
  macros: MacroTargets;
  onNext: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ flex: 1 }}>
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <Pressable onPress={onBack} hitSlop={12} style={{ marginBottom: 18 }}>
            <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: theme.muted }}>‹ Back</Text>
          </Pressable>
        )}

        {step === 0 && <WelcomeStep theme={theme} />}
        {step === 1 && <AboutYouStep theme={theme} quiz={quiz} onQuizField={onQuizField} />}
        {step === 2 && <BodyStep theme={theme} quiz={quiz} onQuizField={onQuizField} />}
        {step === 3 && <ActivityStep theme={theme} quiz={quiz} onQuizField={onQuizField} />}
        {step === 4 && <GoalStep theme={theme} quiz={quiz} onQuizField={onQuizField} />}
        {step === 5 && (
          <ResultsStep theme={theme} quiz={quiz} calorieGoal={calorieGoal} waterGoal={waterGoal} macros={macros} />
        )}
        {step === 6 && <CloseStep theme={theme} />}
      </View>

      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === step ? theme.acc : theme.line }} />
          ))}
        </View>
        <Pressable onPress={onNext} style={[styles.cta, { backgroundColor: theme.acc }]}>
          <Text style={styles.ctaText}>{ctaLabel(step)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ctaLabel(step: number): string {
  if (step === 0) return ONBOARDING[0].cta;
  if (step === 5) return 'See my plan';
  if (step === 6) return ONBOARDING[2].cta;
  return 'Next';
}

function Heading({ theme, title, body }: { theme: CrumbTheme; title: string; body: string }) {
  return (
    <>
      <View style={[styles.mark, { backgroundColor: theme.accSoft }]}>
        <View style={[styles.markDot, { backgroundColor: theme.acc }]} />
      </View>
      <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
    </>
  );
}

function WelcomeStep({ theme }: { theme: CrumbTheme }) {
  return <Heading theme={theme} title={ONBOARDING[0].title} body={ONBOARDING[0].body} />;
}

function CloseStep({ theme }: { theme: CrumbTheme }) {
  return <Heading theme={theme} title={ONBOARDING[2].title} body={ONBOARDING[2].body} />;
}

function AboutYouStep({
  theme,
  quiz,
  onQuizField,
}: {
  theme: CrumbTheme;
  quiz: QuizData;
  onQuizField: (patch: Partial<QuizData>) => void;
}) {
  return (
    <>
      <Heading theme={theme} title="A little about you." body="This tunes your numbers — nothing here is stored anywhere but your own device." />
      <View style={{ marginTop: 30, gap: 14 }}>
        <Stepper
          theme={theme}
          label="Age"
          value={`${quiz.age}`}
          unit="years"
          onDown={() => onQuizField({ age: Math.max(13, quiz.age - 1) })}
          onUp={() => onQuizField({ age: Math.min(90, quiz.age + 1) })}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SegButton theme={theme} label="Female" active={quiz.sex === 'female'} onPress={() => onQuizField({ sex: 'female' })} />
          <SegButton theme={theme} label="Male" active={quiz.sex === 'male'} onPress={() => onQuizField({ sex: 'male' })} />
        </View>
      </View>
    </>
  );
}

function BodyStep({
  theme,
  quiz,
  onQuizField,
}: {
  theme: CrumbTheme;
  quiz: QuizData;
  onQuizField: (patch: Partial<QuizData>) => void;
}) {
  return (
    <>
      <Heading theme={theme} title="Height and weight." body="A rough number is fine — you can always come back and change it." />
      <View style={{ marginTop: 30, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Stepper
              theme={theme}
              label="Height (ft)"
              value={`${quiz.heightFt}`}
              onDown={() => onQuizField({ heightFt: Math.max(3, quiz.heightFt - 1) })}
              onUp={() => onQuizField({ heightFt: Math.min(7, quiz.heightFt + 1) })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Stepper
              theme={theme}
              label="Height (in)"
              value={`${quiz.heightIn}`}
              onDown={() => onQuizField({ heightIn: quiz.heightIn <= 0 ? 11 : quiz.heightIn - 1 })}
              onUp={() => onQuizField({ heightIn: quiz.heightIn >= 11 ? 0 : quiz.heightIn + 1 })}
            />
          </View>
        </View>
        <Stepper
          theme={theme}
          label="Weight"
          value={`${quiz.weightLb}`}
          unit="lb"
          onDown={() => onQuizField({ weightLb: Math.max(70, quiz.weightLb - 5) })}
          onUp={() => onQuizField({ weightLb: Math.min(400, quiz.weightLb + 5) })}
        />
      </View>
    </>
  );
}

function ActivityStep({
  theme,
  quiz,
  onQuizField,
}: {
  theme: CrumbTheme;
  quiz: QuizData;
  onQuizField: (patch: Partial<QuizData>) => void;
}) {
  const options = Object.keys(ACTIVITY_LABELS) as ActivityLevel[];
  return (
    <>
      <Heading theme={theme} title="How active are you?" body="Think about a normal week, not your best one." />
      <View style={{ marginTop: 26, gap: 10 }}>
        {options.map((opt) => (
          <OptionRow
            key={opt}
            theme={theme}
            label={ACTIVITY_LABELS[opt]}
            active={quiz.activityLevel === opt}
            onPress={() => onQuizField({ activityLevel: opt })}
          />
        ))}
      </View>
    </>
  );
}

function GoalStep({
  theme,
  quiz,
  onQuizField,
}: {
  theme: CrumbTheme;
  quiz: QuizData;
  onQuizField: (patch: Partial<QuizData>) => void;
}) {
  const options = Object.keys(GOAL_LABELS) as FitnessGoal[];
  return (
    <>
      <Heading theme={theme} title="What are you working toward?" body="This shapes your calorie target — you can change your mind later." />
      <View style={{ marginTop: 26, gap: 10 }}>
        {options.map((opt) => (
          <OptionRow
            key={opt}
            theme={theme}
            label={GOAL_LABELS[opt]}
            active={quiz.fitnessGoal === opt}
            onPress={() => onQuizField({ fitnessGoal: opt })}
          />
        ))}
      </View>
    </>
  );
}

function ResultsStep({
  theme,
  quiz,
  calorieGoal,
  waterGoal,
  macros,
}: {
  theme: CrumbTheme;
  quiz: QuizData;
  calorieGoal: number;
  waterGoal: number;
  macros: MacroTargets;
}) {
  const exercises = freeExercisesFor(quiz.fitnessGoal);
  return (
    <>
      <Heading theme={theme} title="Your free starter plan." body="Built from what you just told me — three moves to start with today." />
      <View style={{ marginTop: 22, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <NumberCard theme={theme} label="Daily calories" value={calorieGoal.toLocaleString()} unit="kcal" />
          <NumberCard theme={theme} label="Hydration" value={`${waterGoal}`} unit="glasses" />
        </View>
        <View style={[styles.macroStrip, { backgroundColor: theme.surf, borderColor: theme.line }]}>
          <MacroChip theme={theme} label="Protein" value={macros.proteinG} />
          <View style={[styles.macroDivider, { backgroundColor: theme.line }]} />
          <MacroChip theme={theme} label="Carbs" value={macros.carbsG} />
          <View style={[styles.macroDivider, { backgroundColor: theme.line }]} />
          <MacroChip theme={theme} label="Fat" value={macros.fatG} />
        </View>
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: theme.muted, marginTop: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Three to start with
        </Text>
        {exercises.map((ex) => (
          <View key={ex.id} style={[styles.exCard, { backgroundColor: theme.surf, borderColor: theme.line }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: theme.ink }}>{ex.name}</Text>
              <Text style={{ fontFamily: fonts.sans, fontSize: 12.5, color: theme.acc }}>{ex.detail}</Text>
            </View>
            <Text style={{ fontFamily: fonts.sansLight, fontSize: 13, lineHeight: 19, color: theme.muted, marginTop: 4 }}>{ex.note}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function NumberCard({ theme, label, value, unit }: { theme: CrumbTheme; label: string; value: string; unit: string }) {
  return (
    <View style={[styles.numCard, { backgroundColor: theme.surf, borderColor: theme.line }]}>
      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: theme.muted }}>{label}</Text>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 24, color: theme.ink, letterSpacing: -0.3, marginTop: 4 }}>{value}</Text>
      <Text style={{ fontFamily: fonts.sansLight, fontSize: 12, color: theme.muted }}>{unit}</Text>
    </View>
  );
}

function MacroChip({ theme, label, value }: { theme: CrumbTheme; label: string; value: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 17, color: theme.ink }}>{value}g</Text>
      <Text style={{ fontFamily: fonts.sansLight, fontSize: 11.5, color: theme.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function OptionRow({ theme, label, active, onPress }: { theme: CrumbTheme; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionRow,
        { backgroundColor: active ? theme.accSoft : theme.surf, borderColor: active ? theme.acc : theme.line },
      ]}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14.5, color: active ? theme.acc : theme.ink }}>{label}</Text>
    </Pressable>
  );
}

function SegButton({ theme, label, active, onPress }: { theme: CrumbTheme; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segButton,
        { backgroundColor: active ? theme.accSoft : theme.surf, borderColor: active ? theme.acc : theme.line },
      ]}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14.5, color: active ? theme.acc : theme.ink }}>{label}</Text>
    </Pressable>
  );
}

function Stepper({
  theme,
  label,
  value,
  unit,
  onDown,
  onUp,
}: {
  theme: CrumbTheme;
  label: string;
  value: string;
  unit?: string;
  onDown: () => void;
  onUp: () => void;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.line }]}>
      <View style={{ gap: 3 }}>
        <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: theme.muted }}>{label}</Text>
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 26, color: theme.ink, letterSpacing: -0.3 }}>
          {value}
          {unit ? <Text style={{ fontSize: 14, fontFamily: fonts.sansLight, color: theme.muted }}> {unit}</Text> : null}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Round theme={theme} label="−" onPress={onDown} />
        <Round theme={theme} label="+" onPress={onUp} />
      </View>
    </View>
  );
}

function Round({ theme, label, onPress }: { theme: CrumbTheme; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.round, { borderColor: theme.line }]}>
      <Text style={{ fontFamily: fonts.sansLight, fontSize: 20, color: theme.muted, marginTop: -2 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 34 },
  mark: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  markDot: { width: 13, height: 13, borderRadius: 7, transform: [{ rotate: '-12deg' }] },
  title: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 38, letterSpacing: -0.6, marginBottom: 14 },
  body: { fontFamily: fonts.sansLight, fontSize: 16, lineHeight: 25, maxWidth: 320 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  cta: { flex: 1, maxWidth: 210, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: fonts.sansMedium, fontSize: 15.5, color: '#FFF7EE' },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  round: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  optionRow: { borderWidth: 1.5, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 18 },
  segButton: { flex: 1, borderWidth: 1.5, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  numCard: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 16 },
  macroStrip: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, paddingVertical: 14 },
  macroDivider: { width: StyleSheet.hairlineWidth, height: 30 },
  exCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16 },
});
