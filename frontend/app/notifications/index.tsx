import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../src/theme';
import { api } from '../../src/api';

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.notifications();
        setItems(list);
        await api.markAllRead();
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="notif-back">
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off" size={56} color={colors.textTertiary} />
            <Text style={styles.emptyText}>لا توجد إشعارات</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, !item.read && styles.unread]}>
            <View style={[styles.iconBox, { backgroundColor: (item.color || colors.primary) + '20' }]}>
              <Ionicons name={item.icon || 'notifications'} size={22} color={item.color || colors.primary} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString('ar-IQ')}</Text>
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
  row: { flexDirection: 'row-reverse', gap: 12, backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.md, marginBottom: 10, ...shadows.sm },
  unread: { borderRightWidth: 3, borderRightColor: colors.primary },
  iconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  date: { fontSize: 11, color: colors.textTertiary, marginTop: 4 },
});
