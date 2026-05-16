import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, formatIQD } from '../../src/theme';
import { api } from '../../src/api';

export default function NewSubscription() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goals, setGoals] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [target, setTarget] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, p] = await Promise.all([api.goals(), api.packages()]);
        setGoals(g); setPackages(p);
      } catch {}
    })();
  }, []);

  const onSelectGoal = (g: any) => {
    setSelectedGoal(g);
    setTarget(String(g.default_target));
    setStep(2);
  };

  const onConfirmTarget = () => {
    const v = parseFloat(target);
    if (!v || v < 500000) {
      Alert.alert('خطأ', 'يرجى إدخال هدف لا يقل عن 500,000 د.ع');
      return;
    }
    setStep(3);
  };

  const onSelectPackage = (pkg: any) => setSelectedPkg(pkg);

  const submit = async () => {
    if (!selectedGoal || !selectedPkg) return;
    setLoading(true);
    try {
      const sub = await api.createSubscription({
        child_id: childId,
        goal_id: selectedGoal.id,
        goal_target: parseFloat(target),
        goal_name: selectedGoal.name,
        package_id: selectedPkg.id,
      });
      router.replace({ pathname: '/payment/checkout', params: { subId: sub.id } });
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    } finally {
      setLoading(false);
    }
  };

  const monthsToReach = selectedPkg ? Math.ceil(parseFloat(target || '0') / selectedPkg.monthly_amount) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep((step - 1) as any)} testID="sub-back">
            <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إنشاء خطة ادخار</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.steps}>
          {[1, 2, 3].map(s => (
            <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]}>
              {step > s ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={[styles.stepNum, step >= s && { color: '#fff' }]}>{s}</Text>}
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <>
              <Text style={styles.title}>اختر هدف الادخار</Text>
              <Text style={styles.subtitle}>ما هو الهدف الذي تريد الادخار من أجله؟</Text>
              <View style={styles.grid}>
                {goals.map(g => (
                  <TouchableOpacity key={g.id} style={styles.goalCard} onPress={() => onSelectGoal(g)} testID={`goal-${g.id}`}>
                    <View style={[styles.goalIcon, { backgroundColor: g.color + '20' }]}>
                      <Ionicons name={g.icon} size={28} color={g.color} />
                    </View>
                    <Text style={styles.goalName}>{g.name}</Text>
                    <Text style={styles.goalDefault}>{formatIQD(g.default_target)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 2 && selectedGoal && (
            <>
              <Text style={styles.title}>حدد المبلغ المستهدف</Text>
              <Text style={styles.subtitle}>كم تريد أن تجمع لهدف {selectedGoal.name}؟</Text>
              <View style={[styles.selectedGoalCard, { borderColor: selectedGoal.color }]}>
                <View style={[styles.goalIcon, { backgroundColor: selectedGoal.color + '20' }]}>
                  <Ionicons name={selectedGoal.icon} size={28} color={selectedGoal.color} />
                </View>
                <Text style={styles.goalName}>{selectedGoal.name}</Text>
              </View>
              <Text style={styles.label}>المبلغ المستهدف (د.ع)</Text>
              <TextInput
                style={styles.targetInput}
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                placeholder="10,000,000"
                placeholderTextColor={colors.textTertiary}
                testID="target-input"
              />
              <Text style={styles.helperText}>الحد الأدنى: 500,000 د.ع</Text>
              <TouchableOpacity style={styles.submit} onPress={onConfirmTarget} testID="target-confirm">
                <Text style={styles.submitText}>التالي</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>اختر الباقة الشهرية</Text>
              <Text style={styles.subtitle}>اختر مبلغ الاستقطاع الشهري المناسب لك</Text>
              {packages.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.packageCard, selectedPkg?.id === p.id && { borderColor: p.color, borderWidth: 2 }]}
                  onPress={() => onSelectPackage(p)}
                  testID={`package-${p.id}`}
                >
                  <View style={styles.packageHeader}>
                    {selectedPkg?.id === p.id && (
                      <View style={[styles.checkBox, { backgroundColor: p.color }]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.packageName}>{p.name}</Text>
                      <Text style={[styles.packagePrice, { color: p.color }]}>{formatIQD(p.monthly_amount)} / شهرياً</Text>
                    </View>
                    <View style={[styles.packageIcon, { backgroundColor: p.color + '20' }]}>
                      <Ionicons name={p.id === 'gold' ? 'star' : p.id === 'premium' ? 'diamond' : 'leaf'} size={22} color={p.color} />
                    </View>
                  </View>
                  <View style={styles.featuresList}>
                    {p.features.map((f: string, i: number) => (
                      <View key={i} style={styles.featureRow}>
                        <Text style={styles.featureText}>{f}</Text>
                        <Ionicons name="checkmark-circle" size={16} color={p.color} />
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
              {selectedPkg && (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>ملخص خطتك</Text>
                  <View style={styles.summaryRow}><Text style={styles.summaryValue}>{formatIQD(parseFloat(target))}</Text><Text style={styles.summaryLabel}>الهدف</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.summaryValue}>{formatIQD(selectedPkg.monthly_amount)}</Text><Text style={styles.summaryLabel}>المبلغ الشهري</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.summaryValue}>{monthsToReach} شهر ({(monthsToReach / 12).toFixed(1)} سنة)</Text><Text style={styles.summaryLabel}>المدة المتوقعة</Text></View>
                </View>
              )}
              <TouchableOpacity style={[styles.submit, (!selectedPkg || loading) && { opacity: 0.5 }]} onPress={submit} disabled={!selectedPkg || loading} testID="sub-confirm">
                <Text style={styles.submitText}>{loading ? 'جاري الإنشاء...' : 'متابعة الدفع'}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  steps: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 12, paddingVertical: spacing.md, backgroundColor: '#fff' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.primary },
  stepNum: { fontWeight: '800', color: colors.textSecondary, fontSize: 13 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'right', marginBottom: spacing.lg },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  goalCard: { width: '48%', backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', ...shadows.sm },
  goalIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  goalName: { marginTop: spacing.sm, fontWeight: '800', color: colors.textPrimary, fontSize: 14, textAlign: 'center' },
  goalDefault: { marginTop: 4, color: colors.textSecondary, fontSize: 11 },
  selectedGoalCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', borderWidth: 2 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: 'right' },
  targetInput: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.lg, fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'right', borderWidth: 1, borderColor: colors.border },
  helperText: { color: colors.textTertiary, fontSize: 12, marginTop: 6, textAlign: 'right' },
  submit: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center', marginTop: spacing.xxl, ...shadows.primary },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  packageCard: { backgroundColor: '#fff', borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  packageHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  packageIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  packageName: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  packagePrice: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  checkBox: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  featuresList: { marginTop: spacing.md, gap: 6 },
  featureRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  featureText: { flex: 1, color: colors.textSecondary, fontSize: 13, textAlign: 'right' },
  summaryBox: { backgroundColor: colors.primaryLight, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.md },
  summaryTitle: { fontWeight: '800', color: colors.primaryDark, fontSize: 15, marginBottom: spacing.md, textAlign: 'right' },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: colors.textSecondary, fontSize: 13 },
  summaryValue: { color: colors.textPrimary, fontWeight: '800', fontSize: 14 },
});
