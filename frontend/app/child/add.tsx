import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../src/theme';
import { api } from '../../src/api';

const AVATAR_COLORS = ['#047857', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#F97316'];

export default function AddChild() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !dob.trim()) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      const child = await api.createChild({ name: name.trim(), dob, gender, avatar_color: avatarColor });
      Alert.alert('تم', `تم إضافة ${child.name} بنجاح`, [
        { text: 'إضافة هدف ادخار', onPress: () => router.replace({ pathname: '/subscription/new', params: { childId: child.id } }) },
        { text: 'لاحقاً', onPress: () => router.back(), style: 'cancel' },
      ]);
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} testID="addchild-close">
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إضافة طفل</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <View style={[styles.previewAvatar, { backgroundColor: avatarColor }]}>
            <Ionicons name={gender === 'girl' ? 'female' : 'male'} size={48} color="#fff" />
          </View>
          <Text style={styles.previewName}>{name || 'اسم الطفل'}</Text>

          <Text style={styles.label}>اسم الطفل</Text>
          <TextInput style={styles.input} placeholder="مثال: أحمد" placeholderTextColor={colors.textTertiary} value={name} onChangeText={setName} testID="addchild-name-input" />

          <Text style={styles.label}>تاريخ الميلاد</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD مثال: 2018-05-12" placeholderTextColor={colors.textTertiary} value={dob} onChangeText={setDob} testID="addchild-dob-input" />

          <Text style={styles.label}>الجنس</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity style={[styles.genderBtn, gender === 'girl' && styles.genderActive]} onPress={() => setGender('girl')} testID="gender-girl">
              <Ionicons name="female" size={22} color={gender === 'girl' ? '#fff' : colors.textSecondary} />
              <Text style={[styles.genderText, gender === 'girl' && { color: '#fff' }]}>بنت</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderBtn, gender === 'boy' && styles.genderActive]} onPress={() => setGender('boy')} testID="gender-boy">
              <Ionicons name="male" size={22} color={gender === 'boy' ? '#fff' : colors.textSecondary} />
              <Text style={[styles.genderText, gender === 'boy' && { color: '#fff' }]}>ولد</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>اختر لون الصورة الرمزية</Text>
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, avatarColor === c && styles.colorDotActive]}
                onPress={() => setAvatarColor(c)}
                testID={`color-${c}`}
              >
                {avatarColor === c && <Ionicons name="checkmark" size={18} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.submit, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading} testID="addchild-submit">
            <Text style={styles.submitText}>{loading ? 'جاري الحفظ...' : 'إضافة الطفل'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  previewAvatar: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  previewName: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: 'right' },
  input: { backgroundColor: '#fff', borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, textAlign: 'right', borderWidth: 1, borderColor: colors.border },
  genderRow: { flexDirection: 'row-reverse', gap: 12 },
  genderBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  genderActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { fontWeight: '700', color: colors.textSecondary },
  colorRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  colorDotActive: { borderWidth: 3, borderColor: '#fff', ...shadows.sm },
  submit: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: spacing.xxl, ...shadows.primary },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
