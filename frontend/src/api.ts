import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export const TOKEN_KEY = 'qasati_token';
export const ONBOARDED_KEY = 'qasati_onboarded';

async function request(path: string, opts: { method?: string; body?: any; auth?: boolean } = {}) {
  const { method = 'GET', body, auth = true } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && data.detail) || 'حدث خطأ';
    throw new Error(msg);
  }
  return data;
}

export const api = {
  sendOtp: (phone: string) => request('/auth/send-otp', { method: 'POST', body: { phone }, auth: false }),
  verifyOtp: (phone: string, otp: string, name?: string) =>
    request('/auth/verify-otp', { method: 'POST', body: { phone, otp, name }, auth: false }),
  me: () => request('/auth/me'),
  updateProfile: (data: any) => request('/auth/profile', { method: 'PUT', body: data }),
  verifyKyc: () => request('/auth/verify-kyc', { method: 'POST' }),

  packages: () => request('/packages', { auth: false }),
  goals: () => request('/goals', { auth: false }),

  listChildren: () => request('/children'),
  createChild: (data: any) => request('/children', { method: 'POST', body: data }),
  deleteChild: (id: string) => request(`/children/${id}`, { method: 'DELETE' }),

  listSubscriptions: () => request('/subscriptions'),
  createSubscription: (data: any) => request('/subscriptions', { method: 'POST', body: data }),

  pay: (subscription_id: string, payment_method: string) =>
    request('/payments/pay', { method: 'POST', body: { subscription_id, payment_method } }),

  transactions: () => request('/transactions'),
  notifications: () => request('/notifications'),
  markAllRead: () => request('/notifications/mark-read', { method: 'POST' }),

  dashboard: () => request('/dashboard'),
};

export const storage = {
  setToken: (t: string) => AsyncStorage.setItem(TOKEN_KEY, t),
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  clear: () => AsyncStorage.removeItem(TOKEN_KEY),
  setOnboarded: () => AsyncStorage.setItem(ONBOARDED_KEY, '1'),
  getOnboarded: () => AsyncStorage.getItem(ONBOARDED_KEY),
};
