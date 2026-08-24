// Crumb bottom-sheet bodies. One <CrumbSheet> shell hosts whichever body the
// Today hub has open. Warm, editorial, gentle voice throughout.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrumbTheme, fonts, radius, space } from '../theme/crumb';
import { PANTRY } from './data';
import { Crumb, Jar, Trail } from './Visuals';
import { DIET_LABELS, DietTag } from './library/types';

export interface EntryVM {
  id: string;
  name: string;
  time: string;
  kcal: number;
}

// ---- shell ----

export function CrumbSheet({
  visible,
  theme,
  tall,
  onClose,
  children,
}: {
  visible: boolean;
  theme: CrumbTheme;
  tall?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: theme.bg, height: tall ? '90%' : '82%' }]}>
          <Pressable onPress={onClose} style={styles.handleTap}>
            <View style={[styles.handle, { backgroundColor: theme.line }]} />
          </Pressable>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function Title({ theme, children }: { theme: CrumbTheme; children: React.ReactNode }) {
  return <Text style={[styles.title, { color: theme.ink }]}>{children}</Text>;
}
function Label({ theme, children }: { theme: CrumbTheme; children: React.ReactNode }) {
  return <Text style={[styles.label, { color: theme.muted }]}>{children}</Text>;
}

// ---- LOG A MEAL ----

export function LogBody({
  theme,
  onAdd,
  onSearch,
}: {
  theme: CrumbTheme;
  onAdd: (name: string, kcal: number) => void;
  onSearch: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 40 }}>
      <Title theme={theme}>What did you have?</Title>
      <Pressable
        onPress={onSearch}
        style={[styles.searchRow, { backgroundColor: theme.surf, borderColor: theme.line }]}
      >
        <View style={[styles.searchDot, { borderColor: theme.muted }]} />
        <Text style={[styles.searchText, { color: theme.muted }]}>Search, or find it in the pantry</Text>
      </Pressable>
      <Label theme={theme}>Things you often have</Label>
      <View style={{ gap: 9 }}>
        {PANTRY.map((p) => (
          <Pressable
            key={p.name}
            onPress={() => onAdd(p.name, p.kcal)}
            style={[styles.pantryRow, { backgroundColor: theme.surf, borderColor: theme.line }]}
          >
            <View style={[styles.pantryIcon, { backgroundColor: theme.accSoft }]}>
              <Crumb size={9} color={theme.acc} rotate={p.rot} />
            </View>
            <Text style={[styles.pantryName, { color: theme.ink }]}>{p.name}</Text>
            <Text style={[styles.pantryKcal, { color: theme.muted }]}>{p.kcal}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ---- JAR ----

export function JarBody({
  theme,
  tiles,
  entries,
  total,
  note,
}: {
  theme: CrumbTheme;
  tiles: { h: number; color: string }[];
  entries: EntryVM[];
  total: number;
  note: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 40 }}>
      <Title theme={theme}>Today's jar</Title>
      <Text style={[styles.sub, { color: theme.muted }]}>{note}</Text>
      <View style={{ flexDirection: 'row', gap: 20, marginTop: 20, alignItems: 'flex-start' }}>
        <Jar tiles={tiles} theme={theme} big />
        <View style={{ flex: 1 }}>
          {entries.map((e) => (
            <View key={e.id} style={[styles.entry, { borderBottomColor: theme.line }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.entryName, { color: theme.ink }]}>{e.name}</Text>
                <Text style={[styles.entryTime, { color: theme.muted }]}>{e.time}</Text>
              </View>
              <Text style={[styles.entryKcal, { color: theme.muted }]}>{e.kcal}</Text>
            </View>
          ))}
          <View style={styles.soFar}>
            <Text style={[styles.soFarLabel, { color: theme.ink }]}>So far</Text>
            <Text style={[styles.soFarVal, { color: theme.ink }]}>{total.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ---- RECIPES ----

// ---- TRAIL ----

export function TrailBody({
  theme,
  days,
  streakDays,
  monthTotal,
}: {
  theme: CrumbTheme;
  days: number[];
  streakDays: number;
  monthTotal: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 40 }}>
      <Title theme={theme}>Your trail</Title>
      <Text style={[styles.sub, { color: theme.muted, marginBottom: 20 }]}>
        {monthTotal} crumbs this month. A couple of small gaps, which is exactly fine — the trail picks up wherever you
        left it.
      </Text>
      <Trail days={days} theme={theme} />
      <View style={{ flexDirection: 'row', gap: 26, marginTop: 22 }}>
        <Stat theme={theme} value={streakDays} label="days in a row" />
        <Stat theme={theme} value={monthTotal} label="crumbs this month" />
      </View>
    </ScrollView>
  );
}

// ---- WEEK ----

export function WeekBody({
  theme,
  week,
  goalLineBottom,
  avg,
}: {
  theme: CrumbTheme;
  week: { day: string; val: string; hPx: number; isToday: boolean }[];
  goalLineBottom: number;
  avg: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 40 }}>
      <Title theme={theme}>This week</Title>
      <Text style={[styles.sub, { color: theme.muted, marginBottom: 30 }]}>
        Steady. Some days generous, some light, and it all comes out about even.
      </Text>
      <View style={styles.weekChart}>
        <View style={[styles.goalLine, { bottom: goalLineBottom, backgroundColor: theme.line }]} />
        {week.map((w, i) => (
          <View key={i} style={styles.weekCol}>
            <Text style={[styles.weekVal, { color: theme.muted }]}>{w.val}</Text>
            <View
              style={{
                width: '100%',
                height: w.hPx,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                backgroundColor: w.isToday ? theme.acc : theme.sageSoft,
              }}
            />
            <Text style={[styles.weekDay, { color: theme.muted }]}>{w.day}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 26, gap: 14 }}>
        <Row theme={theme} left="Average day" right={`${avg} kcal`} />
        <Row theme={theme} left="Water, most days" right="7 glasses" rightColor={theme.sage} />
        <Row theme={theme} left="Cooked at home" right="5 nights" last />
      </View>
    </ScrollView>
  );
}

// ---- YOU ----

export function YouBody({
  theme,
  goalLabel,
  waterGoal,
  toggles,
  onToggle,
  diet,
  onToggleDiet,
  onRetakeQuiz,
}: {
  theme: CrumbTheme;
  goalLabel: string;
  waterGoal: number;
  toggles: { label: string; sub: string; on: boolean }[];
  onToggle: (i: number) => void;
  diet: DietTag[];
  onToggleDiet: (tag: DietTag) => void;
  onRetakeQuiz?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 28 }}>
        <View style={[styles.avatar, { backgroundColor: theme.accSoft }]}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: theme.acc }}>N</Text>
        </View>
        <View>
          <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: theme.ink }}>You</Text>
          <Text style={{ fontFamily: fonts.sansLight, fontSize: 13.5, color: theme.muted, marginTop: 4 }}>
            Keeping a trail
          </Text>
        </View>
      </View>

      <Label theme={theme}>What we're aiming for</Label>
      <View style={[styles.group, { backgroundColor: theme.surf, borderColor: theme.line }]}>
        <GroupRow theme={theme} label="A day's worth of food" val={`${goalLabel} kcal`} />
        <GroupRow theme={theme} label="Water" val={`${waterGoal} glasses`} />
        <GroupRow theme={theme} label="Weigh-in" val="Sundays, if you like" last />
      </View>
      {onRetakeQuiz && (
        <Pressable onPress={onRetakeQuiz} style={{ marginTop: 10, marginBottom: 4 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13.5, color: theme.acc }}>Retake the quiz →</Text>
        </Pressable>
      )}

      <Label theme={theme}>What you eat</Label>
      <Text style={[styles.dietHint, { color: theme.muted }]}>
        We'll put the right substitute first when you're cooking.
      </Text>
      <View style={styles.dietWrap}>
        {(Object.keys(DIET_LABELS) as DietTag[]).map((tag) => {
          const on = diet.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => onToggleDiet(tag)}
              style={[
                styles.dietChip,
                on ? { backgroundColor: theme.acc, borderColor: theme.acc } : { backgroundColor: theme.surf, borderColor: theme.line },
              ]}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: on ? '#FFF7EE' : theme.muted }}>
                {DIET_LABELS[tag]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Label theme={theme}>The quiet stuff</Label>
      <View style={[styles.group, { backgroundColor: theme.surf, borderColor: theme.line }]}>
        {toggles.map((t, i) => (
          <Pressable
            key={i}
            onPress={() => onToggle(i)}
            style={[styles.toggleRow, { borderBottomColor: theme.line }, i === toggles.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: theme.ink }}>{t.label}</Text>
              <Text style={{ fontFamily: fonts.sansLight, fontSize: 12.5, color: theme.muted, marginTop: 3, lineHeight: 17 }}>
                {t.sub}
              </Text>
            </View>
            <View
              style={{
                width: 46,
                height: 27,
                borderRadius: 15,
                padding: 3,
                backgroundColor: t.on ? theme.sage : theme.surf2,
                alignItems: t.on ? 'flex-end' : 'flex-start',
              }}
            >
              <View style={[styles.knob, { backgroundColor: theme.surf }]} />
            </View>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.quiet, { color: theme.muted }]}>
        Nothing here is shared with anyone. It's your kitchen.
      </Text>
    </ScrollView>
  );
}

// ---- shared small pieces ----

function Stat({ theme, value, label }: { theme: CrumbTheme; value: number; label: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 26, color: theme.ink, letterSpacing: -0.5 }}>{value}</Text>
      <Text style={{ fontFamily: fonts.sansLight, fontSize: 12.5, color: theme.muted }}>{label}</Text>
    </View>
  );
}

function Row({ theme, left, right, rightColor, last }: { theme: CrumbTheme; left: string; right: string; rightColor?: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingBottom: last ? 0 : 12,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: theme.line,
      }}
    >
      <Text style={{ fontFamily: fonts.serif, fontSize: 15, color: theme.ink }}>{left}</Text>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 17, color: rightColor ?? theme.ink }}>{right}</Text>
    </View>
  );
}

function GroupRow({ theme, label, val, last }: { theme: CrumbTheme; label: string; val: string; last?: boolean }) {
  return (
    <View
      style={[
        styles.groupRow,
        { borderBottomColor: theme.line },
        last && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: theme.ink }}>{label}</Text>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: theme.muted }}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill as any, backgroundColor: 'rgba(28,18,12,0.34)' },
  panel: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  handleTap: { paddingTop: 12, paddingBottom: 4, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 3 },
  title: { fontFamily: fonts.serif, fontSize: 27, lineHeight: 31, marginBottom: 16 },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  sub: { fontFamily: fonts.sansLight, fontSize: 14.5, lineHeight: 22 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 15,
    marginBottom: 18,
  },
  searchDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1.5 },
  searchText: { fontFamily: fonts.sansLight, fontSize: 15 },
  pantryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  pantryIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pantryName: { flex: 1, fontFamily: fonts.sans, fontSize: 15.5 },
  pantryKcal: { fontFamily: fonts.sans, fontSize: 14 },
  entry: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  entryName: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 19 },
  entryTime: { fontFamily: fonts.sansLight, fontSize: 12, marginTop: 3 },
  entryKcal: { fontFamily: fonts.sans, fontSize: 14.5 },
  soFar: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 14 },
  soFarLabel: { fontFamily: fonts.serif, fontSize: 15 },
  soFarVal: { fontFamily: fonts.sansMedium, fontSize: 20, letterSpacing: -0.4 },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 190, paddingBottom: 26 },
  goalLine: { position: 'absolute', left: 0, right: 0, height: 1 },
  weekCol: { flex: 1, alignItems: 'center', gap: 9, height: '100%', justifyContent: 'flex-end' },
  weekVal: { fontFamily: fonts.sans, fontSize: 11 },
  weekDay: { fontFamily: fonts.sans, fontSize: 11.5, position: 'absolute', bottom: 0 },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  group: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  groupRow: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  knob: { width: 21, height: 21, borderRadius: 11 },
  quiet: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: 26 },
  dietHint: { fontFamily: fonts.sansLight, fontSize: 12.5, marginTop: -6, marginBottom: 12, lineHeight: 17 },
  dietWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  dietChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});
