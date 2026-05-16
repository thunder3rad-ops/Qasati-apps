import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../src/theme';
import { storage } from '../src/api';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'people' as const,
    title: 'ادخر لأطفالك',
    subtitle: 'أنشئ حساب ادخار لكل طفل من أطفالك واختر هدفه المستقبلي',
    image: 'https://static.prod-images.emergentagent.com/jobs/7019639a-d0fc-4ced-84c4-214e5ef897d8/images/47df4944a22a3e706038d9d9e159e23eeb26bdfd6b62ff63b562cbe2960cf60e.png',
  },
  {
    icon: 'wallet' as const,
    title: 'باقات شهرية مرنة',
    subtitle: 'اختر الباقة الشهرية التي تناسب دخلك واستمتع بالاستقطاع التلقائي',
    image: 'https://static.prod-images.emergentagent.com/jobs/7019639a-d0fc-4ced-84c4-214e5ef897d8/images/957b88fe492eab37899eb47376c3efd0dda288ce59fc608735b6f6c320095056.png',
  },
  {
    icon: 'trending-up' as const,
    title: 'تتبع النمو',
    subtitle: 'راقب نمو ادخار أطفالك بتقارير واضحة وسهلة شهرياً وسنوياً',
    image: 'https://static.prod-images.emergentagent.com/jobs/7019639a-d0fc-4ced-84c4-214e5ef897d8/images/08f51f76290f5e367c82976c02bb6d8b5ba353d69d6d46e5ded9513d5c971dff.png',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = async () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      await storage.setOnboarded();
      router.replace('/auth/login');
    }
  };

  const skip = async () => {
    await storage.setOnboarded();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={skip} testID="onboarding-skip">
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
        <View style={styles.brand}>
          <Ionicons name="wallet" size={20} color={colors.secondary} />
          <Text style={styles.brandText}>قاصتي</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.05)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.iconBadge}>
                <Ionicons name={item.icon} size={28} color="#fff" />
              </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={next} testID="onboarding-next" activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {index === SLIDES.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </Text>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  brand: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  brandText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  skipText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  slide: { paddingHorizontal: spacing.xl, alignItems: 'center', paddingTop: spacing.lg },
  imageWrap: {
    width: '100%', aspectRatio: 1.05, borderRadius: radius.xxl, overflow: 'hidden',
    backgroundColor: colors.primaryLight, position: 'relative', ...shadows.lg,
  },
  image: { width: '100%', height: '100%' },
  iconBadge: {
    position: 'absolute', top: 20, right: 20,
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.primary,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl },
  subtitle: {
    fontSize: 16, color: colors.textSecondary, textAlign: 'center',
    marginTop: spacing.md, lineHeight: 26, paddingHorizontal: spacing.md,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 28, backgroundColor: colors.primary },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 18,
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...shadows.primary,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
