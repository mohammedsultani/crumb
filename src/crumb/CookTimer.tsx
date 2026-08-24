// The hearth's countdown timer, shared by both cook-mode screens. Also holds
// the "split a step's text into a big lead sentence + smaller body" helper,
// since both screens author steps as one flowing string rather than a
// separate title/body pair.

import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, hearth } from '../theme/crumb';

export function firstSentence(text: string): string {
  const m = text.match(/^(.*?[.!?])(\s|$)/);
  return m ? m[1] : text;
}

export function restOfSentence(text: string): string {
  const first = firstSentence(text);
  return text.slice(first.length).trim();
}

export function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setDone(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const reset = () => {
    setRemaining(seconds);
    setDone(false);
    setRunning(false);
  };

  return (
    <Pressable onPress={() => (done ? reset() : setRunning((r) => !r))} style={styles.timer}>
      <View style={styles.emberDot} />
      <Text style={styles.timerText}>
        {done
          ? "That's time"
          : running
          ? `${mm}:${ss} — tap to pause`
          : remaining === seconds
          ? `${mm}:${ss} — tap to start`
          : `${mm}:${ss} — paused`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  timer: {
    marginTop: 30,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: hearth.line,
  },
  emberDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: hearth.ember },
  timerText: { fontFamily: fonts.sans, fontSize: 15, color: hearth.inkMuted },
});
