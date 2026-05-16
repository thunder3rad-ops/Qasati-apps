import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'qasati_token';
export const ONBOARDED_KEY = 'qasati_onboarded';

export const api = {
  sendOtp: async (phone: string) => {
    return { success: true, mock_otp: '123456' };
  },

  verifyOtp: async (phone: string, otp: string) => {
    if (otp !== '123456') {
      throw new Error('رمز التحقق غير صحيح');
    }

    return {
      token: 'demo-token',
      user: {
        id: '1',
        phone,
        name: 'ولي الأمر',
        kyc_status: 'pending',
      },
      is_new: true,
    };
  },

  me: async () => ({
    id: '1',
    name: 'ولي الأمر',
    phone: '',
    kyc_status: 'pending',
  }),

  updateProfile: async (data: any) => data,
  verifyKyc: async () => ({ success: true, kyc_status: 'verified' }),

  packages: async () => [
    { id: 'basic', name: 'خطة دراسة جامعية', monthly_amount: 50000 },
    { id: 'premium', name: 'خطة زواج', monthly_amount: 100000 },
    { id: 'gold', name: 'خطة مشروع', monthly_amount: 150000 },
  ],

  goals: async () => [
    { id: 'university', name: 'دراسة جامعية' },
    { id: 'marriage', name: 'زواج' },
    { id: 'business', name: 'مشروع' },
  ],

  listChildren: async () => [],
  createChild: async (data: any) => ({ id: Date.now().toString(), ...data }),
  deleteChild: async () => ({ success: true }),

  listSubscriptions: async () => [],
  createSubscription: async (data: any) => ({ id: Date.now().toString(), ...data }),

  pay: async () => ({ success: true }),
  transactions: async () => [],
  notifications: async () => [],
  markAllRead: async () => ({ success: true }),

  dashboard: async () => ({
    total_saved: 0,
    total_target: 0,
    monthly_commitment: 0,
    children_count: 0,
    active_subscriptions: 0,
    children: [],
    subscriptions: [],
    recent_transactions: [],
    unread_notifications: 0,
  }),
};

export const storage = {
  setToken: (t: string) => AsyncStorage.setItem(TOKEN_KEY, t),
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  clear: () => AsyncStorage.removeItem(TOKEN_KEY),
  setOnboarded: () => AsyncStorage.setItem(ONBOARDED_KEY, '1'),
  getOnboarded: () => AsyncStorage.getItem(ONBOARDED_KEY),
};
