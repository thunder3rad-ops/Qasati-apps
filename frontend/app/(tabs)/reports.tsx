import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD, formatShortIQD } from '../../src/theme';
import { api } from '../../src/api';

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, t] = await Promise.all([api.dashboard(), api.transactions()]);
      setData(d); setTxns(t);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // group by month (last 6 months)
  const monthly = (() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = 0;
    }
    txns.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (map[key] !== undefined) map[key] += t.amount;
    });
    return Object.entries(map).map(([k, v]) => ({ month: k, amount: v }));
  })();

  const maxAmount = Math.max(...monthly.map(m => m.amount), 1);
  const arMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>التقارير والإحصائيات</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}>
        <View style={styles.statsRow}>
          <StatCard icon="wallet" color={colors.primary} label="إجمالي المدخرات" value={data ? formatShortIQD(data.total_saved) : '0'} />
          <StatCard icon="flag" color={colors.secondary} label="إجمالي الأهداف" value={data ? formatShortIQD(data.total_target) : '0'} />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="calendar" color={colors.info} label="التزام شهري" value={data ? formatShortIQD(data.monthly_commitment) : '0'} />
          <StatCard icon="receipt" color="#8B5CF6" label="عدد المعاملات" value={String(txns.length)} />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>الادخار الشهري (آخر 6 أشهر)</Text>
          <View style={styles.barsRow}>
            {monthly.map((m, i) => {
              const h = (m.amount / maxAmount) * 140;
              const [_, mm] = m.month.split('-');
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barAmount}>{m.amount > 0 ? formatShortIQD(m.amount).replace(' د.ع', '') : ''}</Text>
                  <View style={[styles.bar, { height: Math.max(h, 4), backgroundColor: m.amount > 0 ? colors.primary : colors.border }]} />
                  <Text style={styles.barLabel}>{arMonths[parseInt(mm) - 1].slice(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {data?.subscriptions?.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>تقدم الأهداف</Text>
            {data.subscriptions.map((s: any) => {
              const pct = s.goal_target > 0 ? Math.min(1, s.current_amount / s.goal_target) : 0;
              return (
                <View key={s.id} style={styles.goalRow}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalPercent}>{Math.round(pct * 100)}%</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.goalName}>{s.goal_name} - {s.child_name}</Text>
                      <Text style={styles.goalAmounts}>{formatIQD(s.current_amount)} / {formatIQD(s.goal_target)}</Text>
                    </View>
                    <View style={[styles.goalIconBox, { backgroundColor: s.goal_color + '20' }]}>
                      <Ionicons name={s.goal_icon} size={20} color={s.goal_color} />
                    </View>
                  </View>
                  <View style={styles.goalTrack}>
                    <View style={[styles.goalFill, { width: `${pct * 100}%`, backgroundColor: s.goal_color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, color, label, value }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  statsRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, ...shadows.sm },
  statIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginTop: 10, textAlign: 'right' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textAlign: 'right' },
  chartCard: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.lg, marginTop: spacing.md, ...shadows.sm },
  chartTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'right', marginBottom: spacing.lg },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 200, paddingHorizontal: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  bar: { width: 24, borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  barAmount: { fontSize: 9, color: colors.primary, fontWeight: '700' },
  goalsSection: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'right' },
  goalRow: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, marginBottom: 10, ...shadows.sm },
  goalHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  goalIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  goalAmounts: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  goalPercent: { fontSize: 16, fontWeight: '800', color: colors.primary },
  goalTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  goalFill: { height: '100%' },
});
