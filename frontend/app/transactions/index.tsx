import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD } from '../../src/theme';
import { api } from '../../src/api';

export default function Transactions() {
  const router = useRouter();
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => { (async () => { try { setTxns(await api.transactions()); } catch {} })(); }, []);

  const methodLabel = (m: string) => ({ zaincash: 'زين كاش', qicard: 'كي كارد', visa: 'Visa', mastercard: 'Mastercard' } as any)[m] || m;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="txns-back">
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجل المعاملات</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={txns}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt" size={56} color={colors.textTertiary} />
            <Text style={styles.emptyText}>لا توجد معاملات بعد</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.txn}>
            <View style={styles.txnLeft}>
              <Text style={styles.amount}>+{formatIQD(item.amount)}</Text>
              <Text style={styles.ref}>{item.reference}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.title}>{item.goal_name}</Text>
              <Text style={styles.meta}>{item.child_name} • {methodLabel(item.payment_method)}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString('ar-IQ')}</Text>
            </View>
            <View style={styles.iconBox}>
              <Ionicons name="arrow-up" size={20} color={colors.success} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  empty: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, marginTop: spacing.xxxl },
  emptyText: { color: colors.textSecondary, marginTop: spacing.md, fontSize: 15 },
  txn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, marginBottom: 10, ...shadows.sm },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  txnLeft: { alignItems: 'flex-start' },
  amount: { color: colors.success, fontWeight: '800', fontSize: 14 },
  ref: { color: colors.textTertiary, fontSize: 10, marginTop: 2 },
});
