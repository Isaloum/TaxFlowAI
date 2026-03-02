import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pendingDocs: number;
};

export default function ClientsScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/accountant/clients');
      setClients(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Clients</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={s.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={s.search}
        placeholder="Search clients..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1E40AF" size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push({ pathname: '/(accountant)/client-detail', params: { id: c.id } })}
            >
              <View style={s.avatar}>
                <Text style={s.initials}>{c.firstName[0]}{c.lastName[0]}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.name}>{c.firstName} {c.lastName}</Text>
                <Text style={s.email}>{c.email}</Text>
              </View>
              {c.pendingDocs > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{c.pendingDocs}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No clients found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  logout: { fontSize: 13, color: '#1E40AF' },
  search: { marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fff' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  initials: { color: '#1E40AF', fontWeight: '700', fontSize: 15 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  email: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge: { backgroundColor: '#DC2626', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 14 },
});
