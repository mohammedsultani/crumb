import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { firstSentence, restOfSentence, StepTimer } from '../../../src/crumb/CookTimer';
import { getRecipe } from '../../../src/db/recipes';
import { fonts, hearth } from '../../../src/theme/crumb';
import type { Recipe } from '../../../src/types';
import { safeBack } from '../../../src/utils/navigation';

// Cook mode = the "hearth": a warm, dark, unhurried room. Screen stays awake,
// serif step text large enough to read across a kitchen.
export default function CookModeScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getRecipe(id).then((r) => setRecipe(r ?? null));
  }, [id]);

  const steps = recipe?.steps ?? [];
  const step = steps[index];
  const atStart = index === 0;
  const atEnd = index >= steps.length - 1;

  if (!recipe) return <View style={[styles.root, { backgroundColor: hearth.bg }]} />;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.stepOf}>Step {index + 1} of {steps.length}</Text>
        <Pressable onPress={() => safeBack('/')} hitSlop={12} style={styles.close}>
          <Text style={{ color: hearth.faint, fontFamily: fonts.sansLight, fontSize: 16 }}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.progressDot, { backgroundColor: i <= index ? hearth.ember : hearth.line }]} />
        ))}
      </View>

      <View style={styles.content}>
        <Pressable style={styles.tapLeft} disabled={atStart} onPress={() => setIndex((i) => Math.max(0, i - 1))} />
        <Pressable style={styles.tapRight} disabled={atEnd} onPress={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} />
        <View pointerEvents="box-none" style={{ paddingHorizontal: 4 }}>
          <Text style={styles.stepTitle}>{step?.text ? firstSentence(step.text) : 'No steps.'}</Text>
          {step?.text && restOfSentence(step.text) ? <Text style={styles.stepBody}>{restOfSentence(step.text)}</Text> : null}
          {step?.timerSeconds ? <StepTimer key={step.id} seconds={step.timerSeconds} /> : null}
        </View>
      </View>

      <View style={styles.navRow}>
        <Pressable style={[styles.back, atStart && { opacity: 0.35 }]} disabled={atStart} onPress={() => setIndex((i) => Math.max(0, i - 1))}>
          <Text style={{ color: hearth.inkMuted, fontFamily: fonts.sansLight, fontSize: 20 }}>‹</Text>
        </Pressable>
        <Pressable style={styles.next} onPress={() => (atEnd ? safeBack('/') : setIndex((i) => i + 1))}>
          <Text style={{ color: hearth.bg, fontFamily: fonts.sansMedium, fontSize: 16 }}>
            {atEnd ? "That's it — done" : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: hearth.bg, paddingHorizontal: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 34, paddingBottom: 8 },
  stepOf: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', color: hearth.faint },
  close: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: hearth.line, alignItems: 'center', justifyContent: 'center' },
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
