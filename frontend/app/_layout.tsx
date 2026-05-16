import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager } from 'react-native';
import { useEffect } from 'react';

// Force RTL for Arabic
if (!I18nManager.isRTL) {
  try { I18nManager.allowRTL(true); I18nManager.forceRTL(true); } catch {}
}

export default function RootLayout() {
  useEffect(() => {
    try { I18nManager.allowRTL(true); I18nManager.forceRTL(true); } catch {}
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="child/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="subscription/new" />
        <Stack.Screen name="payment/checkout" />
        <Stack.Screen name="payment/success" />
        <Stack.Screen name="transactions/index" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="kyc/index" />
      </Stack>
    </SafeAreaProvider>
  );
}
