import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return Alert.alert('Error', 'Enter your email address.');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.title}>Reset Password</Text>

        {sent ? (
          <>
            <Text style={s.success}>✓ Check your email for a reset link.</Text>
            <TouchableOpacity style={s.btn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={s.btnText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.subtitle}>We'll send a reset link to your email.</Text>
            <TextInput
              style={s.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Reset Link</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.back} onPress={() => router.back()}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 14, backgroundColor: '#F9FAFB' },
  btn: { backgroundColor: '#1E40AF', borderRadius: 10, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  back: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#6B7280', fontSize: 14 },
  success: { fontSize: 15, color: '#16A34A', marginBottom: 24, textAlign: 'center' },
});
