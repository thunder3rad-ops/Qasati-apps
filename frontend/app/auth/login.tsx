import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const login = () => {
    router.push({
      pathname: '/auth/otp',
      params: { phone: phone || '07700000000' },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>قاصتي</Text>
      <Text style={styles.title}>تسجيل الدخول</Text>

      <TextInput
        style={styles.input}
        placeholder="اكتب رقم الهاتف"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>دخول</Text>
      </TouchableOpacity>

      <Text style={styles.note}>رمز التحقق التجريبي: 123456</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#047857',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#047857',
    padding: 17,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
