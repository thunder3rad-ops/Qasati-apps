import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../src/theme';
import { api, storage } from '../../src/api';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const load = useCallback(async () => {
    try { setUser(await api.me()); } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const logout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: async () => { await storage.clear(); router.replace('/auth/login'); } },
    ]);
  };

  const kycStatusInfo = {
    pending: { label: 'بانتظار التحقق', color: colors.warning, icon: 'time' },
    verified: { label: 'موثق', color: colors.success, icon: 'checkmark-circle' },
    rejected: { label: 'مرفوض', color: colors.error, icon: 'close-circle' },
  }[user?.kyc_status || 'pending'] || { label: 'بانتظار', color: colors.warning, icon: 'time' };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.title}>حسابي</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <Text style={styles.profileName}>{user?.name || 'ولي الأمر'}</Text>
          <Text style={styles.profilePhone}>{user?.phone}</Text>
          <View style={[styles.kycBadge, { backgroundColor: kycStatusInfo.color + '20' }]}>
            <Ionicons name={kycStatusInfo.icon as any} size={14} color={kycStatusInfo.color} />
            <Text style={[styles.kycText, { color: kycStatusInfo.color }]}>{kycStatusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <MenuItem icon="shield-checkmark" color="#8B5CF6" label="التحقق من الهوية (KYC)" onPress={() => router.push('/kyc')} testID="menu-kyc" />
          <MenuItem icon="receipt" color={colors.info} label="سجل المعاملات" onPress={() => router.push('/transactions')} testID="menu-txns" />
          <MenuItem icon="notifications" color={colors.secondary} label="الإشعارات" onPress={() => router.push('/notifications')} testID="menu-notifications" />
          <MenuItem icon="people" color={colors.primary} label="إدارة الأطفال" onPress={() => router.push('/(tabs)/children')} testID="menu-children" />
        </View>

        <View style={styles.menu}>
          <MenuItem icon="help-circle" color={colors.info} label="المساعدة والدعم" onPress={() => Alert.alert('الدعم', 'تواصل معنا: support@qasati.iq')} testID="menu-support" />
          <MenuItem icon="document-text" color={colors.textSecondary} label="الشروط والأحكام" onPress={() => {}} testID="menu-terms" />
          <MenuItem icon="lock-closed" color={colors.textSecondary} label="سياسة الخصوصية" onPress={() => {}} testID="menu-privacy" />
          <MenuItem icon="information-circle" color={colors.textSecondary} label="عن التطبيق" onPress={() => Alert.alert('قاصتي v1.0', 'تطبيق ادخار عائلي للأطفال')} testID="menu-about" />
        </View>

        <TouchableOpacity style={styles.logout} onPress={logout} testID="logout-btn">
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <Text style={styles.version}>قاصتي • الإصدار 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, color, label, onPress, testID }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} testID={testID} activeOpacity={0.7}>
      <Ionicons name="chevron-back" size={18} color={colors.textTertiary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  profileCard: { backgroundColor: '#fff', marginHorizontal: spacing.xl, borderRadius: radius.xxl, padding: spacing.xl, alignItems: 'center', ...shadows.sm },
  profileAvatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.primary },
  profileName: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md },
  profilePhone: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  kycBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, marginTop: spacing.md },
  kycText: { fontSize: 12, fontWeight: '700' },
  menu: { backgroundColor: '#fff', marginHorizontal: spacing.xl, marginTop: spacing.lg, borderRadius: radius.xl, ...shadows.sm, overflow: 'hidden' },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '600', textAlign: 'right' },
  logout: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: spacing.xl, marginTop: spacing.xl, paddingVertical: spacing.lg, backgroundColor: '#FEE2E2', borderRadius: radius.xl },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: colors.textTertiary, fontSize: 12, marginTop: spacing.lg },
});
