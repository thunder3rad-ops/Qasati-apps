import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD } from '../../src/theme';
import { api } from '../../src/api';

const METHODS = [
  { id: 'zaincash', name: 'زين كاش', icon: 'phone-portrait', color: '#7C3AED' },
  { id: 'qicard', name: 'كي كارد (Qi)', icon: 'card', color: '#1F2937' },
  { id: 'visa', name: 'Visa', icon: 'card', color: '#1A56DB' },
  { id: 'mastercard', name: 'Mastercard', icon: 'card', color: '#EF4444' },
];

export default function Checkout() {
  const router = useRouter();
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const [sub, setSub] = useState<any>(null);
  const [method, setMethod] = useState('zaincash');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listSubscriptions();
        const s = list.find((x: any) => x.id === subId);
        setSub(s);
      } catch {}
    })();
  }, [subId]);

  const pay = async () => {
    setPaying(true);
    try {
      const txn = await api.pay(subId as string, method);
      router.replace({ pathname: '/payment/success', params: { reference: txn.reference, amount: String(txn.amount), child: txn.child_name, goal: txn.goal_name } });
    } catch (e: any) {
      Alert.alert('فشل الدفع', e.message);
    } finally {
      setPaying(false);
    }
  };

  if (!sub) {
    return <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator color={colors.primary} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="checkout-back">
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الدفع</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>المبلغ المستحق</Text>
          <Text style={styles.amount}>{formatIQD(sub.monthly_amount)}</Text>
          <View style={styles.divider} />
          <SummaryRow label="الطفل" value={sub.child_name} />
          <SummaryRow label="الهدف" value={sub.goal_name} />
          <SummaryRow label="الباقة" value={sub.package_name} />
          <SummaryRow label="نوع الدفع" value="دفعة شهرية" />
        </View>

        <Text style={styles.sectionTitle}>اختر طريقة الدفع</Text>
        <View style={styles.methods}>
          {METHODS.map(m => (
            <TouchableOpacity key={m.id} style={[styles.methodCard, method === m.id && { borderColor: colors.primary, borderWidth: 2 }]} onPress={() => setMethod(m.id)} testID={`method-${m.id}`}>
              <View style={styles.methodLeft}>
                {method === m.id ? <Ionicons name="radio-button-on" size={22} color={colors.primary} /> : <Ionicons name="radio-button-off" size={22} color={colors.textTertiary} />}
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.methodName}>{m.name}</Text>
              </View>
              <View style={[styles.methodIcon, { backgroundColor: m.color + '20' }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.secureNote}>
          <Ionicons name="lock-closed" size={16} color={colors.success} />
          <Text style={styles.secureText}>دفع آمن ومشفر بأعلى معايير الأمان</Text>
        </View>

        <TouchableOpacity style={[styles.payBtn, paying && { opacity: 0.6 }]} onPress={pay} disabled={paying} testID="checkout-pay-btn">
          {paying ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.payBtnText}>ادفع {formatIQD(sub.monthly_amount)}</Text>
              <Ionicons name="lock-closed" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: any) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryRowLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  summary: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.xl, ...shadows.sm },
  summaryLabel: { color: colors.textSecondary, fontSize: 13, textAlign: 'right' },
  amount: { fontSize: 32, fontWeight: '800', color: colors.primary, textAlign: 'right', marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  summaryRowLabel: { color: colors.textSecondary, fontSize: 13 },
  summaryValue: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md, textAlign: 'right' },
  methods: { gap: 10 },
  methodCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  methodLeft: {},
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  methodName: { fontWeight: '700', color: colors.textPrimary, fontSize: 15 },
  secureNote: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.lg },
  secureText: { color: colors.success, fontSize: 12, fontWeight: '600' },
  payBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 18, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: spacing.lg, ...shadows.primary },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
