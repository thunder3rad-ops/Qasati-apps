import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD } from '../../src/theme';
import { api } from '../../src/api';

export default function Children() {
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([api.listChildren(), api.listSubscriptions()]);
      setChildren(c); setSubs(s);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const removeChild = (id: string) => {
    Alert.alert('حذف', 'هل أنت متأكد من حذف هذا الطفل؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => { await api.deleteChild(id); load(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/child/add')} testID="children-add-btn">
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>أطفالي</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {children.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>لا يوجد أطفال بعد</Text>
            <Text style={styles.emptySub}>أضف طفلك الأول لتبدأ رحلة الادخار</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/child/add')} testID="children-empty-add">
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>إضافة طفل</Text>
            </TouchableOpacity>
          </View>
        ) : (
          children.map(child => {
            const childSubs = subs.filter(s => s.child_id === child.id);
            return (
              <View key={child.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <TouchableOpacity onPress={() => removeChild(child.id)} testID={`delete-child-${child.id}`}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childMeta}>{child.gender === 'girl' ? 'بنت' : 'ولد'} • {child.dob}</Text>
                  </View>
                  <View style={[styles.avatar, { backgroundColor: child.avatar_color }]}>
                    <Ionicons name={child.gender === 'girl' ? 'female' : 'male'} size={26} color="#fff" />
                  </View>
                </View>

                {childSubs.length === 0 ? (
                  <TouchableOpacity style={styles.addGoal} onPress={() => router.push({ pathname: '/subscription/new', params: { childId: child.id } })} testID={`add-goal-${child.id}`}>
                    <Ionicons name="add-circle" size={22} color={colors.primary} />
                    <Text style={styles.addGoalText}>إضافة هدف ادخار</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {childSubs.map(sub => {
                      const pct = sub.goal_target > 0 ? Math.min(1, sub.current_amount / sub.goal_target) : 0;
                      return (
                        <View key={sub.id} style={styles.subCard}>
                          <View style={styles.subHeader}>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                              <Text style={styles.subTitle}>{sub.goal_name}</Text>
                              <Text style={styles.subPackage}>{sub.package_name}</Text>
                            </View>
                            <View style={[styles.goalIcon, { backgroundColor: sub.goal_color + '20' }]}>
                              <Ionicons name={sub.goal_icon} size={22} color={sub.goal_color} />
                            </View>
                          </View>
                          <View style={styles.subProgressTrack}>
                            <View style={[styles.subProgressFill, { width: `${pct * 100}%`, backgroundColor: sub.goal_color }]} />
                          </View>
                          <View style={styles.subMeta}>
                            <Text style={styles.subAmount}>{formatIQD(sub.current_amount)}</Text>
                            <Text style={styles.subTarget}>من {formatIQD(sub.goal_target)}</Text>
                          </View>
                          <View style={styles.subFooter}>
                            <View style={styles.statusBadge}>
                              <View style={[styles.statusDot, { backgroundColor: sub.status === 'active' ? colors.success : colors.warning }]} />
                              <Text style={styles.statusText}>{sub.status === 'active' ? 'نشط' : 'بانتظار الدفع الأول'}</Text>
                            </View>
                            <TouchableOpacity style={styles.payBtn} onPress={() => router.push({ pathname: '/payment/checkout', params: { subId: sub.id } })} testID={`pay-btn-${sub.id}`}>
                              <Ionicons name="card" size={16} color="#fff" />
                              <Text style={styles.payBtnText}>{sub.status === 'active' ? 'ادفع الشهر' : 'الدفع الأول'}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                    <TouchableOpacity style={styles.addAnotherGoal} onPress={() => router.push({ pathname: '/subscription/new', params: { childId: child.id } })} testID={`add-another-goal-${child.id}`}>
                      <Ionicons name="add" size={18} color={colors.primary} />
                      <Text style={styles.addGoalText}>إضافة هدف آخر</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.primary },
  empty: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.xxl, alignItems: 'center', ...shadows.sm, marginTop: spacing.xl },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.lg },
  emptySub: { color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  emptyBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: radius.full, marginTop: spacing.xl, ...shadows.primary },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  childInfo: { flex: 1, alignItems: 'flex-end' },
  childName: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  childMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  addGoal: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, padding: spacing.md, backgroundColor: colors.primaryLight, borderRadius: radius.lg },
  addGoalText: { color: colors.primary, fontWeight: '700' },
  subCard: { backgroundColor: colors.surfaceVariant, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10 },
  subHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  goalIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  subTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  subPackage: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  subProgressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: 4, overflow: 'hidden' },
  subProgressFill: { height: '100%', borderRadius: 3 },
  subMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 6 },
  subAmount: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  subTarget: { fontSize: 12, color: colors.textSecondary },
  subFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  statusBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  payBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  addAnotherGoal: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, marginTop: 4 },
});
