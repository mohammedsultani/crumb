import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfile, saveProfile } from '../src/db/profile';
import { fonts, radius, space, useTheme } from '../src/theme/crumb';
import { safeBack } from '../src/utils/navigation';

const BENEFITS = [
  { icon: 'restaurant-outline' as const, title: 'A full day’s meal plan', body: 'Breakfast, lunch, dinner, and a snack pulled from the recipe library, sized to your calorie target.' },
  { icon: 'refresh-outline' as const, title: 'Rotates daily', body: 'A fresh set of meals each day so it never feels like the same three dinners on repeat.' },
  { icon: 'leaf-outline' as const, title: 'Respects your diet', body: 'Vegetarian, vegan, gluten-free, dairy-free — whatever you’ve set stays honored.' },
];

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return (digits.match(/.{1,4}/g) || []).join(' ');
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function SubscribeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const cardDigits = cardNumber.replace(/\D/g, '');
  const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
  const formValid = name.trim().length > 1 && cardDigits.length === 16 && expiryValid && cvv.length >= 3;

  const subscribe = async () => {
    if (!formValid) {
      Alert.alert('Check your details', 'Fill in your name, card number, expiry, and CVV to continue.');
      return;
    }
    setWorking(true);
    try {
      // No payment SDK is wired up in this build — nothing is charged and no
      // card details leave this screen. Before shipping, replace this with a
      // real purchase flow (RevenueCat or native StoreKit/Play Billing for
      // mobile, Stripe Checkout for web) and only call
      // saveProfile({ subscribed: true }) once that purchase actually succeeds.
      await new Promise((resolve) => setTimeout(resolve, 700));
      await saveProfile({ subscribed: true });
      setDone(true);
    } finally {
      setWorking(false);
    }
  };

  const restore = async () => {
    const p = await getProfile();
    if (p.subscribed) {
      router.replace('/meal-plan');
    } else {
      Alert.alert('Nothing to restore', 'No active subscription was found for this device.');
    }
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <View style={[styles.successWrap, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 }]}>
          <View style={[styles.mark, { backgroundColor: theme.sageSoft }]}>
            <Ionicons name="checkmark" size={30} color={theme.sage} />
          </View>
          <Text style={[styles.title, { color: theme.ink, textAlign: 'center' }]}>You're subscribed.</Text>
          <Text style={[styles.subtitle, { color: theme.muted, textAlign: 'center' }]}>
            Your meal plan is ready — sized to your calorie and macro targets, starting today.
          </Text>

          <Pressable onPress={() => router.replace('/meal-plan')} style={[styles.cta, { backgroundColor: theme.acc, marginTop: 36 }]}>
            <Text style={styles.ctaText}>See today's plan</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/')} style={[styles.homeBtn, { borderColor: theme.line }]}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: theme.ink }}>Back to home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 56, paddingHorizontal: space.xl, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.mark, { backgroundColor: theme.accSoft }]}>
            <Ionicons name="calendar-outline" size={26} color={theme.acc} />
          </View>
          <Text style={[styles.title, { color: theme.ink }]}>Your meal plan, done for you.</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Everything from your quiz — your calorie target, your diet, your goal — turned into an actual day of meals.
          </Text>

          <View style={{ marginTop: 30, gap: 14 }}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={[styles.benefit, { backgroundColor: theme.surf, borderColor: theme.line }]}>
                <View style={[styles.benefitIcon, { backgroundColor: theme.accSoft }]}>
                  <Ionicons name={b.icon} size={18} color={theme.acc} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: theme.ink }}>{b.title}</Text>
                  <Text style={{ fontFamily: fonts.sansLight, fontSize: 13.5, lineHeight: 19, color: theme.muted, marginTop: 2 }}>
                    {b.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.priceCard, { backgroundColor: theme.surf, borderColor: theme.acc }]}>
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
              Crumb Plan
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 40, color: theme.ink, letterSpacing: -0.8 }}>$1.99</Text>
              <Text style={{ fontFamily: fonts.sansLight, fontSize: 15, color: theme.muted, marginLeft: 4 }}>/ month</Text>
            </View>
            <Text style={{ fontFamily: fonts.sansLight, fontSize: 12.5, color: theme.muted, marginTop: 6 }}>
              Cancel anytime. No commitment.
            </Text>
          </View>

          {/* Payment method */}
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>Payment method</Text>
          <View style={[styles.paymentCard, { backgroundColor: theme.surf, borderColor: theme.line }]}>
            <View style={styles.paymentHeader}>
              <Ionicons name="card-outline" size={18} color={theme.acc} />
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: theme.ink }}>Card</Text>
            </View>

            <Field theme={theme} label="Name on card">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Jordan Rivera"
                placeholderTextColor={theme.muted}
                autoCapitalize="words"
                style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
              />
            </Field>

            <Field theme={theme} label="Card number">
              <TextInput
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                maxLength={19}
                style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
              />
            </Field>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field theme={theme} label="Expiry">
                  <TextInput
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiry(t))}
                    placeholder="MM/YY"
                    placeholderTextColor={theme.muted}
                    keyboardType="number-pad"
                    maxLength={5}
                    style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field theme={theme} label="CVV">
                  <TextInput
                    value={cvv}
                    onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    placeholderTextColor={theme.muted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
                  />
                </Field>
              </View>
            </View>

            <View style={styles.secureRow}>
              <Ionicons name="lock-closed-outline" size={13} color={theme.muted} />
              <Text style={{ fontFamily: fonts.sansLight, fontSize: 11.5, color: theme.muted }}>
                Kept on your device only — nothing is sent anywhere.
              </Text>
            </View>
          </View>

          <Pressable
            disabled={working}
            onPress={subscribe}
            style={[styles.cta, { backgroundColor: theme.acc, opacity: working ? 0.7 : formValid ? 1 : 0.5 }]}
          >
            <Text style={styles.ctaText}>{working ? 'Setting things up…' : 'Subscribe — $1.99/mo'}</Text>
          </Pressable>
          <Text style={[styles.devNote, { color: theme.muted }]}>
            Development build — this is a mock payment form. No card details are transmitted and nothing is actually charged.
          </Text>

          <Pressable onPress={restore} style={{ marginTop: 18, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.sans, fontSize: 13.5, color: theme.muted }}>Restore purchase</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.backBtnWrap, { top: insets.top + 8 }]}>
        <Pressable onPress={() => safeBack('/')} style={[styles.backBtn, { backgroundColor: theme.surf, borderColor: theme.line }]}>
          <Ionicons name="chevron-back" size={18} color={theme.ink} />
        </Pressable>
      </View>
    </View>
  );
}

function Field({ theme, label, children }: { theme: import('../src/theme/crumb').CrumbTheme; label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: theme.muted, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  title: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34, letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { fontFamily: fonts.sansLight, fontSize: 15.5, lineHeight: 23 },
  benefit: { flexDirection: 'row', gap: 14, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: 16, alignItems: 'flex-start' },
  benefitIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  priceCard: { marginTop: 24, borderWidth: 1.5, borderRadius: radius.xl, padding: 22, alignItems: 'center' },
  sectionLabel: { fontFamily: fonts.sansMedium, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 1, marginTop: 28, marginBottom: 10 },
  paymentCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.xl, padding: 18 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  input: { height: 46, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingHorizontal: 14, fontFamily: fonts.sansMedium, fontSize: 15 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  cta: { marginTop: 22, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: fonts.sansMedium, fontSize: 16, color: '#FFF7EE' },
  devNote: { fontFamily: fonts.sansLight, fontSize: 11.5, textAlign: 'center', marginTop: 10, lineHeight: 16, paddingHorizontal: 20 },
  backBtnWrap: { position: 'absolute', left: space.xl, zIndex: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  successWrap: { flex: 1, paddingHorizontal: space.xl, alignItems: 'center', justifyContent: 'center' },
  homeBtn: { marginTop: 14, height: 52, paddingHorizontal: 26, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
});
