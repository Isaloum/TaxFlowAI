import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.logo}>TaxFlow<Text style={s.logoBlue}>AI</Text></Text>
        <Text style={s.subtitle}>Sign in to your account</Text>

        <TextInput
          style={s.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={s.link}>
            <Text style={s.linkText}>Forgot password?</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  logo: { fontSize: 32, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 4 },
  logoBlue: { color: '#1E40AF' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 14, backgroundColor: '#F9FAFB' },
  btn: { backgroundColor: '#1E40AF', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#1E40AF', fontSize: 14 },
});
