import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/theme';
import { storage } from '../src/api';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const start = async () => {
      const token = await storage.getToken();
      const onboarded = await storage.getOnboarded();
      setTimeout(() => {
        if (token) router.replace('/(tabs)');
        else if (onboarded) router.replace('/auth/login');
        else router.replace('/onboarding');
      }, 700);
    };
    start();
  }, []);

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="wallet" size={46} color={colors.secondary} />
      </View>
      <Text style={styles.title}>قاصتي</Text>
      <Text style={styles.subtitle}>ادخار لمستقبل أطفالك</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 28 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(245,158,11,0.45)',
  },
  title: { color: '#fff', fontSize: 38, fontWeight: '800', marginTop: 18 },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 6 },
});
