import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD } from '../../src/theme';

export default function Success() {
  const router = useRouter();
  const { reference, amount, child, goal } = useLocalSearchParams<{ reference: string; amount: string; child: string; goal: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={64} color={colors.primary} />
        </View>
        <Text style={styles.successTitle}>تمت العملية بنجاح</Text>
        <Text style={styles.successSub}>تم إيداع المبلغ في حساب الادخار</Text>
        <Text style={styles.amount}>{formatIQD(parseFloat(amount || '0'))}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.receipt}>
          <Text style={styles.receiptTitle}>تفاصيل العملية</Text>
          <Row label="الطفل" value={child as string} />
          <Row label="الهدف" value={goal as string} />
          <Row label="رقم العملية" value={reference as string} />
          <Row label="التاريخ" value={new Date().toLocaleDateString('ar-IQ')} />
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.statusText}>ناجحة</Text>
            </View>
            <Text style={styles.summaryRowLabel}>الحالة</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(tabs)')} testID="success-home">
          <Text style={styles.primaryBtnText}>العودة للرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/transactions')} testID="success-txns">
          <Text style={styles.secondaryBtnText}>عرض المعاملات</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  top: { alignItems: 'center', paddingTop: 40, paddingBottom: 80, paddingHorizontal: spacing.xl, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  iconWrap: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadows.lg },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: spacing.lg },
  successSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  amount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: spacing.md },
  body: { flex: 1, paddingHorizontal: spacing.xl, marginTop: -50 },
  receipt: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.xl, ...shadows.sm },
  receiptTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { color: colors.textSecondary, fontSize: 13 },
  value: { color: colors.textPrimary, fontWeight: '700', fontSize: 13, maxWidth: '60%' },
  statusRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md },
  summaryRowLabel: { color: colors.textSecondary, fontSize: 13 },
  statusPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  statusText: { color: colors.success, fontWeight: '700', fontSize: 12 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl, ...shadows.primary },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', marginTop: spacing.md },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
