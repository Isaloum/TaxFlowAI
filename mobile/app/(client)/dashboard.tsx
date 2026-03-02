import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';

type Document = {
  id: string;
  docType: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
};

type TaxYear = {
  id: string;
  year: number;
  status: string;
  completeness: number;
  documents: Document[];
};

const STATUS_COLOR: Record<string, string> = {
  completed: '#16A34A',
  submitted: '#1E40AF',
  'in-progress': '#D97706',
  pending: '#6B7280',
};

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [years, setYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/client/tax-years');
      setYears(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.greeting}>Hi, {user?.firstName} 👋</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={s.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1E40AF" size="large" />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          {years.map((ty) => (
            <View key={ty.id} style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.year}>{ty.year}</Text>
                <Text style={[s.badge, { color: STATUS_COLOR[ty.status] ?? '#6B7280' }]}>
                  {ty.status}
                </Text>
              </View>

              {/* Progress bar */}
              <View style={s.barBg}>
                <View style={[s.barFill, { width: `${ty.completeness}%` as any }]} />
              </View>
              <Text style={s.pct}>{ty.completeness}% complete</Text>

              {/* Documents */}
              {ty.documents.map((doc) => (
                <View key={doc.id} style={s.docRow}>
                  <View style={s.docMain}>
                    <Text style={s.docType} numberOfLines={1}>{doc.docType}</Text>
                    <View style={[s.pill,
                      doc.reviewStatus === 'approved' ? s.pillGreen :
                      doc.reviewStatus === 'rejected' ? s.pillRed : s.pillGray
                    ]}>
                      <Text style={[s.pillText,
                        doc.reviewStatus === 'approved' ? { color: '#16A34A' } :
                        doc.reviewStatus === 'rejected' ? { color: '#DC2626' } :
                        { color: '#6B7280' }
                      ]}>
                        {doc.reviewStatus === 'approved' ? '✓ Approved' :
                         doc.reviewStatus === 'rejected' ? '✗ Fix needed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  {doc.reviewStatus === 'rejected' && doc.rejectionReason && (
                    <Text style={s.reason}>↳ {doc.rejectionReason}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#111827' },
  logout: { fontSize: 13, color: '#1E40AF' },
  scroll: { padding: 16, gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  year: { fontSize: 22, fontWeight: '800', color: '#111827' },
  badge: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  barBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 4 },
  barFill: { height: 6, backgroundColor: '#1E40AF', borderRadius: 3 },
  pct: { fontSize: 11, color: '#6B7280', marginBottom: 12 },
  docRow: { marginBottom: 8 },
  docMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docType: { fontSize: 13, color: '#374151', flex: 1, marginRight: 8 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pillGreen: { backgroundColor: '#DCFCE7' },
  pillRed: { backgroundColor: '#FEE2E2' },
  pillGray: { backgroundColor: '#F3F4F6' },
  pillText: { fontSize: 11, fontWeight: '600' },
  reason: { fontSize: 11, color: '#DC2626', marginTop: 2, paddingLeft: 8 },
});
