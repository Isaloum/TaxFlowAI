import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.avatar}>
          <Text style={s.initials}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </View>
        <Text style={s.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <Text style={s.role}>Client</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  container: { flex: 1, alignItems: 'center', paddingTop: 60, padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1E40AF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  initials: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  role: { fontSize: 12, color: '#1E40AF', fontWeight: '600', marginTop: 8, backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  logoutBtn: { marginTop: 48, borderWidth: 1, borderColor: '#DC2626', borderRadius: 10, paddingHorizontal: 32, paddingVertical: 12 },
  logoutText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
});
