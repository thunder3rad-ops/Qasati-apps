import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../src/theme';
import { api } from '../../src/api';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }
    setLoading(true);
    try {
      await api.sendOtp('+964' + phone.replace(/^0+/, ''));
      router.push({ pathname: '/auth/otp', params: { phone: '+964' + phone.replace(/^0+/, '') } });
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="wallet" size={36} color={colors.secondary} />
          </View>
          <Text style={styles.brand}>قاصتي</Text>
          <Text style={styles.tagline}>ادخار لمستقبل أطفالك</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.title}>مرحباً بك</Text>
          <Text style={styles.subtitle}>أدخل رقم هاتفك لإرسال رمز التحقق</Text>

          <View style={styles.phoneRow}>
            <TextInput
              style={styles.phoneInput}
              placeholder="07XX XXX XXXX"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
              testID="login-phone-input"
            />
            <View style={styles.flagBox}>
              <Text style={styles.flagText}>+964</Text>
              <Text style={styles.flagEmoji}>🇮🇶</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={submit}
            disabled={loading}
            testID="login-send-otp-btn"
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.info}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={styles.infoText}>سيتم إرسال رمز تحقق مكون من 6 أرقام إلى رقم هاتفك</Text>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              بالمتابعة فإنك توافق على <Text style={styles.termsLink}>الشروط والأحكام</Text> و
              <Text style={styles.termsLink}> سياسة الخصوصية</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: { alignItems: 'center', paddingVertical: spacing.xxl, paddingBottom: 50 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)',
  },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: spacing.md },
  tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  card: {
    flex: 1, backgroundColor: colors.background, marginTop: -28,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xxl,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 8, textAlign: 'right' },
  phoneRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: spacing.xl },
  flagBox: {
    backgroundColor: colors.surfaceVariant, borderRadius: radius.lg,
    paddingHorizontal: 14, paddingVertical: 16,
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
  },
  flagText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  flagEmoji: { fontSize: 18 },
  phoneInput: {
    flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 16, fontSize: 17, color: colors.textPrimary,
    textAlign: 'right', fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 18,
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: spacing.xl, ...shadows.primary,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  info: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg,
  },
  infoText: { flex: 1, color: colors.primaryDark, fontSize: 13, textAlign: 'right' },
  terms: { marginTop: 'auto', paddingBottom: spacing.lg },
  termsText: { textAlign: 'center', color: colors.textSecondary, fontSize: 12, lineHeight: 20 },
  termsLink: { color: colors.primary, fontWeight: '700' },
});
