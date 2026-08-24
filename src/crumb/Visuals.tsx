// The tactile Crumb visuals: the calorie "vessel", the water glass, the meal
// "jar", the streak "trail", and the week bars. These carry the app's warmth.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CrumbTheme, fonts } from '../theme/crumb';

/** A soft asymmetric "crumb" blob mark. */
export function Crumb({ size = 12, color, rotate = -12 }: { size?: number; color: string; rotate?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        borderTopLeftRadius: size * 0.52,
        borderTopRightRadius: size * 0.48,
        borderBottomRightRadius: size * 0.46,
        borderBottomLeftRadius: size * 0.54,
        backgroundColor: color,
        transform: [{ rotate: `${rotate}deg` }],
      }}
    />
  );
}

/** The calorie vessel — a bowl that fills with liquid toward the day's goal. */
export function Vessel({
  pct,
  kcalTotal,
  goalLabel,
  note,
  theme,
}: {
  pct: number;
  kcalTotal: string;
  goalLabel: string;
  note: string;
  theme: CrumbTheme;
}) {
  const fill = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(fill, {
      toValue: pct,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, fill]);

  const heightPct = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const steamOn = pct > 0.82;

  return (
    <View style={styles.vesselWrap}>
      <View style={styles.vesselInner}>
        {steamOn && <Steam color={theme.acc} />}
        <View style={[styles.bowl, { borderColor: theme.line, backgroundColor: theme.surf2 }]}>
          <Animated.View style={[styles.liquid, { height: heightPct, backgroundColor: theme.acc }]}>
            <View style={[styles.liquidDeep, { backgroundColor: theme.accDeep }]} />
            <View style={styles.liquidTop} />
          </Animated.View>
        </View>
        <View style={styles.vesselCenter} pointerEvents="none">
          <View style={[styles.scrim, { backgroundColor: theme.scrim }]}>
            <Text style={[styles.kcalBig, { color: theme.ink }]}>{kcalTotal}</Text>
            <Text style={[styles.kcalSub, { color: theme.muted }]}>of {goalLabel} kcal</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.vesselNote, { color: theme.muted }]}>{note}</Text>
    </View>
  );
}

function Steam({ color }: { color: string }) {
  return (
    <View style={styles.steam} pointerEvents="none">
      {[0, 900, 1800].map((delay) => (
        <SteamWisp key={delay} color={color} delay={delay} />
      ))}
    </View>
  );
}

function SteamWisp({ color, delay }: { color: string; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 3400, delay, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [4, -30] });
  const opacity = v.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.45, 0] });
  return (
    <Animated.View
      style={{ width: 3, height: 26, borderRadius: 2, backgroundColor: color, opacity, transform: [{ translateY }] }}
    />
  );
}

/** A glass that fills as water is logged. Tap to add a glass. */
export function WaterGlass({ pct, theme }: { pct: number; theme: CrumbTheme }) {
  const fill = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(fill, { toValue: pct, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct, fill]);
  const heightPct = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.glassWrap}>
      <View style={[styles.glass, { borderColor: theme.line, backgroundColor: theme.surf2 }]}>
        <Animated.View style={[styles.glassLiquid, { height: heightPct, backgroundColor: theme.sage }]} />
      </View>
      <View style={styles.glassShine} />
    </View>
  );
}

/** The jar — food entries stack up as tiles from the bottom. */
export function Jar({
  tiles,
  theme,
  big = false,
}: {
  tiles: { h: number; color: string }[];
  theme: CrumbTheme;
  big?: boolean;
}) {
  const w = big ? 96 : 62;
  const h = big ? 210 : 82;
  const lidH = big ? 13 : 9;
  return (
    <View style={{ width: w, height: h }}>
      <View
        style={{
          position: 'absolute',
          left: big ? 18 : 11,
          right: big ? 18 : 11,
          top: 0,
          height: lidH,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderWidth: 1.5,
          borderBottomWidth: 0,
          borderColor: theme.line,
          backgroundColor: theme.surf2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: lidH,
          bottom: 0,
          borderWidth: 1.5,
          borderColor: theme.line,
          borderTopLeftRadius: big ? 12 : 8,
          borderTopRightRadius: big ? 12 : 8,
          borderBottomLeftRadius: big ? 20 : 14,
          borderBottomRightRadius: big ? 20 : 14,
          backgroundColor: theme.surf2,
          overflow: 'hidden',
          flexDirection: 'column-reverse',
          padding: big ? 6 : 4,
          gap: big ? 4 : 3,
        }}
      >
        {tiles.map((t, i) => (
          <View key={i} style={{ height: t.h, borderRadius: big ? 4 : 3, backgroundColor: t.color }} />
        ))}
      </View>
    </View>
  );
}

/** The trail — a dotted meandering path with a dot per day. */
export function Trail({
  days,
  theme,
  compact = false,
}: {
  days: number[]; // 1 = kept, 0 = gap
  theme: CrumbTheme;
  compact?: boolean;
}) {
  if (compact) {
    const pts: [number, number][] = [];
    const dots = [];
    for (let i = 0; i < 7; i++) {
      const x = 20 + i * 43;
      const y = 31 + 17 * Math.sin(i * 0.85 + 0.4);
      pts.push([x, y]);
      const today = i === 6;
      dots.push(
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={today ? 6.5 : 4.5}
          fill={i === 4 ? 'transparent' : today ? theme.acc : theme.accSoft}
          stroke={i === 4 ? theme.line : theme.acc}
          strokeWidth={1.3}
        />
      );
    }
    const d = 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
    return (
      <Svg viewBox="0 0 300 62" width="100%" height={62}>
        <Path d={d} fill="none" stroke={theme.line} strokeWidth={1.5} strokeLinecap="round" strokeDasharray="1 5" />
        {dots}
      </Svg>
    );
  }

  const pts: [number, number][] = [];
  const dots = [];
  for (let i = 0; i < days.length; i++) {
    const row = Math.floor(i / 7);
    const col = i % 7;
    const x = row % 2 === 0 ? 22 + col * 43 : 280 - col * 43;
    const y = 34 + row * 104 + 15 * Math.sin(i * 1.1);
    pts.push([x, y]);
    const on = days[i] === 1;
    const today = i === days.length - 1;
    dots.push(
      <Circle
        key={i}
        cx={x}
        cy={y}
        r={today ? 7.5 : on ? 5.5 : 3}
        fill={on ? (today ? theme.acc : theme.accSoft) : 'transparent'}
        stroke={on ? theme.acc : theme.line}
        strokeWidth={1.4}
      />
    );
  }
  const d = 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  return (
    <Svg viewBox="0 0 306 300" width="100%" height={300}>
      <Path d={d} fill="none" stroke={theme.line} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="1 6" />
      {dots}
    </Svg>
  );
}

const styles = StyleSheet.create({
  vesselWrap: { alignItems: 'center' },
  vesselInner: { width: 194, height: 194, marginBottom: 6 },
  steam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -26,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  bowl: {
    position: 'absolute',
    inset: 0,
    borderRadius: 97,
    borderWidth: 1.5,
    overflow: 'hidden',
  } as any,
  liquid: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  liquidDeep: { position: 'absolute', left: 0, right: 0, bottom: 0, top: '55%', opacity: 0.55 },
  liquidTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: 'rgba(255,240,220,0.45)' },
  vesselCenter: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' } as any,
  scrim: { alignItems: 'center', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 15, borderRadius: 22 },
  kcalBig: { fontFamily: fonts.sansMedium, fontSize: 46, letterSpacing: -1.2 },
  kcalSub: { fontFamily: fonts.sansLight, fontSize: 12.5, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 8 },
  vesselNote: { fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 23, textAlign: 'center', maxWidth: 250, marginTop: 4 },
  glassWrap: { width: 52, height: 66 },
  glass: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1.5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  } as any,
  glassLiquid: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  glassShine: { position: 'absolute', top: 6, left: 8, width: 5, height: 26, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.32)' },
});
