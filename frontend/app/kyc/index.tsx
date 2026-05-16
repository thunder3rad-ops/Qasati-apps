import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../src/theme';
import { api } from '../../src/api';

export default function Kyc() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { (async () => { try { setUser(await api.me()); } catch {} })(); }, []);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.verifyKyc();
      Alert.alert('تم التحقق', 'تم توثيق هويتك بنجاح', [{ text: 'حسناً', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.kyc_status === 'verified') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} testID="kyc-back">
            <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>التحقق من الهوية</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.verifiedBox}>
          <View style={styles.verifiedIcon}><Ionicons name="checkmark" size={56} color="#fff" /></View>
          <Text style={styles.verifiedTitle}>تم توثيق هويتك بنجاح</Text>
          <Text style={styles.verifiedSub}>يمكنك الآن استخدام جميع ميزات قاصتي</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="kyc-back">
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التحقق من الهوية (KYC)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}>
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          <Text style={styles.bannerTitle}>التحقق من الهوية</Text>
          <Text style={styles.bannerSub}>للوصول الكامل لميزات قاصتي، يجب توثيق هويتك الشخصية</Text>
        </View>

        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={[styles.docIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="card" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.docTitle}>البطاقة الوطنية</Text>
              <Text style={styles.docSub}>صورة واضحة للبطاقة الوطنية</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.uploadBtn} testID="upload-id">
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.uploadText}>التقاط صورة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={[styles.docIcon, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="home" size={24} color={colors.secondary} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.docTitle}>إثبات السكن</Text>
              <Text style={styles.docSub}>بطاقة السكن أو فاتورة كهرباء</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.uploadBtn} testID="upload-address">
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.uploadText}>التقاط صورة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={[styles.docIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="happy" size={24} color={colors.error} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.docTitle}>صورة شخصية (سيلفي)</Text>
              <Text style={styles.docSub}>للتحقق من المطابقة</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.uploadBtn} testID="upload-selfie">
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.uploadText}>التقاط صورة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.noteText}>بياناتك محمية ومشفرة ولن يتم مشاركتها مع أي طرف ثالث</Text>
        </View>

        <TouchableOpacity style={[styles.submit, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting} testID="kyc-submit">
          <Text style={styles.submitText}>{submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  banner: { backgroundColor: colors.primaryLight, borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center' },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginTop: spacing.sm },
  bannerSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
  docCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.md, ...shadows.sm },
  docHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  docIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontWeight: '800', color: colors.textPrimary, fontSize: 15 },
  docSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  uploadBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primaryLight },
  uploadText: { color: colors.primary, fontWeight: '700' },
  note: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8, marginTop: spacing.lg, padding: spacing.md, backgroundColor: '#EFF6FF', borderRadius: radius.lg },
  noteText: { flex: 1, color: colors.info, fontSize: 12, textAlign: 'right', lineHeight: 18 },
  submit: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl, ...shadows.primary },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  verifiedBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  verifiedIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
  verifiedTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.lg },
  verifiedSub: { color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
