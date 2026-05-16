import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD, formatShortIQD } from '../../src/theme';
import { api } from '../../src/api';

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, d] = await Promise.all([api.me(), api.dashboard()]);
      setUser(u);
      setData(d);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const progress = data && data.total_target > 0 ? Math.min(1, data.total_saved / data.total_target) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.push('/notifications')} testID="home-notifications-btn" style={styles.iconBtn}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {data?.unread_notifications > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{data.unread_notifications}</Text></View>
              )}
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.greeting}>أهلاً بك</Text>
              <Text style={styles.userName}>{user?.name || 'ولي الأمر'}</Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>إجمالي المدخرات</Text>
            <Text style={styles.balanceValue} testID="home-total-saved">
              {data ? formatIQD(data.total_saved) : '0 د.ع'}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.progressMetaText}>
                الهدف: {data ? formatShortIQD(data.total_target || 0) : '0'}
              </Text>
              <Text style={styles.progressMetaText}>{Math.round(progress * 100)}%</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="people" size={18} color={colors.secondary} />
                <Text style={styles.statValue}>{data?.children_count || 0}</Text>
                <Text style={styles.statLabel}>أطفال</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="trending-up" size={18} color={colors.secondary} />
                <Text style={styles.statValue}>{data?.active_subscriptions || 0}</Text>
                <Text style={styles.statLabel}>اشتراك نشط</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="calendar" size={18} color={colors.secondary} />
                <Text style={styles.statValue}>{data ? formatShortIQD(data.monthly_commitment) : '0'}</Text>
                <Text style={styles.statLabel}>التزام شهري</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.actionsGrid}>
            <ActionCard icon="person-add" label="إضافة طفل" color={colors.primary} onPress={() => router.push('/child/add')} testID="action-add-child" />
            <ActionCard icon="card" label="دفع شهري" color={colors.secondary} onPress={() => router.push('/(tabs)/children')} testID="action-pay" />
            <ActionCard icon="receipt" label="المعاملات" color={colors.info} onPress={() => router.push('/transactions')} testID="action-transactions" />
            <ActionCard icon="shield-checkmark" label="التحقق KYC" color="#8B5CF6" onPress={() => router.push('/kyc')} testID="action-kyc" />
          </View>

          {user?.kyc_status !== 'verified' && (
            <TouchableOpacity style={styles.kycAlert} onPress={() => router.push('/kyc')} testID="kyc-banner">
              <View style={styles.kycIcon}>
                <Ionicons name="alert-circle" size={22} color={colors.secondaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.kycTitle}>أكمل التحقق من هويتك</Text>
                <Text style={styles.kycSub}>للوصول الكامل لجميع ميزات قاصتي</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={colors.secondaryDark} />
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/children')}>
              <Text style={styles.sectionLink}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>أطفالي</Text>
          </View>

          {data?.children?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12, flexDirection: 'row-reverse' }}>
              {data.children.map((c: any) => {
                const subs = data.subscriptions.filter((s: any) => s.child_id === c.id);
                const total = subs.reduce((a: number, b: any) => a + (b.current_amount || 0), 0);
                return (
                  <TouchableOpacity key={c.id} style={styles.childCard} onPress={() => router.push('/(tabs)/children')} testID={`child-card-${c.id}`}>
                    <View style={[styles.childAvatar, { backgroundColor: c.avatar_color }]}>
                      <Ionicons name={c.gender === 'girl' ? 'female' : 'male'} size={28} color="#fff" />
                    </View>
                    <Text style={styles.childName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.childAmount}>{formatShortIQD(total)}</Text>
                    <Text style={styles.childSub}>{subs.length} اشتراك</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.addChildCard} onPress={() => router.push('/child/add')} testID="home-add-child-card">
                <Ionicons name="add" size={32} color={colors.primary} />
                <Text style={styles.addChildText}>إضافة طفل</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <TouchableOpacity style={styles.emptyCard} onPress={() => router.push('/child/add')} testID="home-empty-add-child">
              <Ionicons name="people" size={40} color={colors.primary} />
              <Text style={styles.emptyTitle}>ابدأ رحلة الادخار</Text>
              <Text style={styles.emptySub}>أضف طفلك الأول لتبدأ ادخار مستقبله</Text>
              <View style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>إضافة طفل</Text>
              </View>
            </TouchableOpacity>
          )}

          {data?.recent_transactions?.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={() => router.push('/transactions')}>
                  <Text style={styles.sectionLink}>عرض الكل</Text>
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>أحدث المعاملات</Text>
              </View>
              <View style={styles.txnList}>
                {data.recent_transactions.slice(0, 4).map((t: any) => (
                  <View key={t.id} style={styles.txnRow}>
                    <View style={styles.txnIcon}>
                      <Ionicons name="arrow-up" size={18} color={colors.success} />
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.txnTitle}>{t.goal_name} - {t.child_name}</Text>
                      <Text style={styles.txnDate}>{new Date(t.date).toLocaleDateString('ar-IQ')}</Text>
                    </View>
                    <Text style={styles.txnAmount}>+{formatShortIQD(t.amount)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ icon, label, color, onPress, testID }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} testID={testID} activeOpacity={0.85}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 80, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  userName: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  balanceCard: { marginTop: spacing.lg },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textAlign: 'right' },
  balanceValue: { color: '#fff', fontSize: 34, fontWeight: '800', textAlign: 'right', marginTop: 4 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: 4 },
  progressMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 8 },
  progressMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row-reverse', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.xl, padding: 14, marginTop: spacing.lg, alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  body: { paddingHorizontal: spacing.xl, marginTop: -60 },
  actionsGrid: { flexDirection: 'row-reverse', gap: 10, marginBottom: spacing.lg },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.xl, padding: 14, alignItems: 'center', gap: 8, ...shadows.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  kycAlert: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
    backgroundColor: colors.secondaryLight, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg,
    borderRightWidth: 4, borderRightColor: colors.secondary,
  },
  kycIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  kycTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  kycSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textAlign: 'right' },
  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  sectionLink: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  childCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: 14, width: 130, alignItems: 'center', ...shadows.sm },
  childAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  childName: { marginTop: 8, fontWeight: '800', color: colors.textPrimary, fontSize: 14 },
  childAmount: { marginTop: 4, color: colors.primary, fontWeight: '800', fontSize: 13 },
  childSub: { color: colors.textTertiary, fontSize: 11, marginTop: 2 },
  addChildCard: { width: 130, borderRadius: radius.xl, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  addChildText: { color: colors.primary, fontWeight: '700', marginTop: 6, fontSize: 13 },
  emptyCard: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center', ...shadows.sm },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md },
  emptySub: { color: colors.textSecondary, marginTop: 6, textAlign: 'center', fontSize: 14 },
  emptyBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: radius.full },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  txnList: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.sm, ...shadows.sm },
  txnRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: spacing.md },
  txnIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  txnDate: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  txnAmount: { color: colors.success, fontWeight: '800', fontSize: 14 },
});
