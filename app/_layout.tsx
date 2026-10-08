import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { seedInitialDataIfNeeded } from '../database/seed';
import { ensureMonthExists } from '../services/month-service';
import { isPinLockEnabled, isOnboardingCompleted } from '../services/settings-service';
import { PinScreen } from '../components/PinScreen';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    async function initApp() {
      try {
        await seedInitialDataIfNeeded();
        await ensureMonthExists();

        const locked = await isPinLockEnabled();
        setIsLocked(locked);

        const onboardingDone = await isOnboardingCompleted();
        if (!onboardingDone && !locked) {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('App init error:', error);
      } finally {
        setIsReady(true);
      }
    }

    initApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D6847" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (isLocked) {
    return <PinScreen onUnlocked={() => setIsLocked(false)} />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="expense/add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="income/add" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="income/allocate" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="envelope/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="envelope/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="envelope/transfer" options={{ presentation: 'modal' }} />
        <Stack.Screen name="insights/index" options={{ headerShown: false }} />
        <Stack.Screen name="modal/quick-actions" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D6847',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
