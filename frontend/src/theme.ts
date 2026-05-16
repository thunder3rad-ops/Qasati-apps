export const colors = {
  primary: '#047857',
  primaryDark: '#065F46',
  primaryHover: '#059669',
  primaryLight: '#D1FAE5',
  primarySoft: '#ECFDF5',
  secondary: '#F59E0B',
  secondaryDark: '#D97706',
  secondaryLight: '#FEF3C7',
  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#A8A29E',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  border: '#E7E5E4',
  borderLight: '#F5F5F4',
  overlay: 'rgba(0,0,0,0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const font = {
  // We use system fonts but heavy weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const formatIQD = (n: number): string => {
  const v = Math.round(n || 0);
  return v.toLocaleString('en-US') + ' د.ع';
};

export const formatShortIQD = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + ' مليون د.ع';
  if (n >= 1000) return (n / 1000).toFixed(0) + ' ألف د.ع';
  return n.toString() + ' د.ع';
};
