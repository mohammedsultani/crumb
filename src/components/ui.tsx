// Small, dependency-free UI kit used across every screen so the app feels like
// one product. Two moods (appetite / data) share these primitives.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, font, radius, shadow, spacing, weight } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: 'md' | 'lg';
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  size = 'md',
}: ButtonProps) {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
      ? colors.danger
      : variant === 'secondary'
      ? colors.surfaceAlt
      : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger'
      ? colors.white
      : variant === 'secondary'
      ? colors.text
      : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        size === 'lg' && styles.btnLg,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { paddingHorizontal: spacing.sm },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.btnInner}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} />}
          <Text style={[styles.btnText, { color: fg }, size === 'lg' && { fontSize: font.body }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color = colors.primary,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.white : colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({ label, color = colors.textMuted }: { label: string; color?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function EmptyState({
  icon = 'restaurant-outline',
  title,
  subtitle,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={colors.textFaint} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** A labeled progress bar (used for macros and daily totals). */
export function ProgressBar({
  value,
  max,
  color = colors.primary,
  height = 8,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height,
        }}
      />
    </View>
  );
}

export const text = {
  h1: { fontSize: font.h1, fontWeight: weight.bold as TextStyle['fontWeight'], color: colors.text },
  h2: { fontSize: font.h2, fontWeight: weight.bold as TextStyle['fontWeight'], color: colors.text },
  h3: { fontSize: font.h3, fontWeight: weight.semibold as TextStyle['fontWeight'], color: colors.text },
  body: { fontSize: font.body, color: colors.text },
  muted: { fontSize: font.small, color: colors.textMuted },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLg: { paddingVertical: 16 },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: font.small, fontWeight: weight.semibold as TextStyle['fontWeight'] },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipText: { fontSize: font.small, fontWeight: weight.medium as TextStyle['fontWeight'] },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginRight: 6,
  },
  pillText: { fontSize: font.tiny, fontWeight: weight.semibold as TextStyle['fontWeight'] },
  sectionTitle: {
    fontSize: font.small,
    fontWeight: weight.semibold as TextStyle['fontWeight'],
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  emptyTitle: {
    fontSize: font.h3,
    fontWeight: weight.semibold as TextStyle['fontWeight'],
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  track: { width: '100%', backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
});
