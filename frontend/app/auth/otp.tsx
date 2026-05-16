import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../src/theme';
import { api, storage } from '../../src/api';

export default function Otp() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (text: string, idx: number) => {
    const v = text.replace(/[^0-9]/g, '').slice(-1);
    const arr = [...code];
    arr[idx] = v;
    setCode(arr);
    if (v && idx < 5) inputs.current[idx + 1]?.focus();
    if (!v && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const submit = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال الرمز كاملاً');
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone as string, otp);
      await storage.setToken(res.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (timer > 0) return;
    try {
      await api.sendOtp(phone as string);
      setTimer(60);
      Alert.alert('تم', 'تم إعادة إرسال الرمز');
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} testID="otp-back">
            <Ionicons name="arrow-forward" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>تحقق من رقمك</Text>
          <Text style={styles.subtitle}>
            أدخل الرمز المكون من 6 أرقام المرسل إلى
          </Text>
          <Text style={styles.phone}>{phone}</Text>

          <View style={styles.otpRow}>
            {code.map((v, i) => (
              <TextInput
                key={i}
                ref={r => { inputs.current[i] = r; }}
                value={v}
                onChangeText={t => handleChange(t, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.otpBox, v && styles.otpBoxFilled]}
                testID={`otp-digit-${i}`}
              />
            ))}
          </View>

          <View style={styles.hintBox}>
            <Ionicons name="bulb" size={16} color={colors.secondary} />
            <Text style={styles.hintText}>للتجربة: استخدم الرمز <Text style={styles.hintCode}>123456</Text></Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={submit}
            disabled={loading}
            testID="otp-verify-btn"
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{loading ? 'جاري التحقق...' : 'تحقق'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resend} disabled={timer > 0} style={styles.resend} testID="otp-resend">
            <Text style={[styles.resendText, timer === 0 && { color: colors.primary }]}>
              {timer > 0 ? `إعادة إرسال الرمز بعد ${timer}ث` : 'إعادة إرسال الرمز'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: 'flex-end' },
  content: { flex: 1, paddingHorizontal: spacing.xl, alignItems: 'center', paddingTop: spacing.lg },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  phone: { fontSize: 17, fontWeight: '700', color: colors.primary, marginTop: 4 },
  otpRow: { flexDirection: 'row-reverse', gap: 10, marginTop: spacing.xxl },
  otpBox: {
    width: 48, height: 56, borderRadius: radius.lg, backgroundColor: colors.surfaceVariant,
    borderWidth: 2, borderColor: 'transparent', textAlign: 'center', fontSize: 22, fontWeight: '700',
    color: colors.textPrimary,
  },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: '#fff', ...shadows.sm },
  hintBox: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: spacing.lg,
    backgroundColor: colors.secondaryLight, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.full,
  },
  hintText: { color: colors.secondaryDark, fontSize: 13 },
  hintCode: { fontWeight: '800', color: colors.secondaryDark },
  button: {
    width: '100%', backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 18,
    alignItems: 'center', marginTop: spacing.xl, ...shadows.primary,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resend: { marginTop: spacing.lg },
  resendText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
