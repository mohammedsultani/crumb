import {
  Petrona_300Light,
  Petrona_400Regular,
  Petrona_400Regular_Italic,
  Petrona_500Medium,
} from '@expo-google-fonts/petrona';
import {
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
  useFonts,
} from '@expo-google-fonts/jost';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDb } from '../src/db/database';
import { seedIfEmpty } from '../src/db/seed';
import { ThemeProvider, lightTheme } from '../src/theme/crumb';

// Landing directly on a nested route (a fresh load or deep link straight to
// e.g. /library/[id]) otherwise gives that screen a single-entry history with
// nothing to go back to — expo-router dispatches an unhandled GO_BACK the
// moment anything tries to pop it. Declaring the true root here makes
// expo-router synthesize the full stack underneath on deep-link instead.
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Petrona_300Light,
    Petrona_400Regular,
    Petrona_500Medium,
    Petrona_400Regular_Italic,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
  });

  useEffect(() => {
    (async () => {
      try {
        await getDb();
        await seedIfEmpty();
      } finally {
        setDbReady(true);
      }
    })();
  }, []);

  if (!dbReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: lightTheme.bg }}>
        <ActivityIndicator size="large" color={lightTheme.acc} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: lightTheme.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="recipe/edit" options={{ presentation: 'modal' }} />
            <Stack.Screen name="recipe/cook/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="library/index" />
            <Stack.Screen name="library/collection/[cuisine]" />
            <Stack.Screen name="library/[id]" />
            <Stack.Screen name="library/cook/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="meal-plan" />
            <Stack.Screen name="subscribe" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
