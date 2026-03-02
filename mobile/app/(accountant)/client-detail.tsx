import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';

type Document = {
  id: string;
  docType: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
};

type TaxYear = {
  id: string;
  year: number;
  status: string;
  documents: Document[];
};

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [years, setYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ docId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/accountant/clients/${id}/tax-years`);
      setYears(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (docId: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/accountant/documents/${docId}/review`, { status: 'approved' });
      load();
    } catch {
      Alert.alert('Error', 'Could not approve.');
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return Alert.alert('Enter a reason.');
    setActionLoading(true);
    try {
      await api.patch(`/accountant/documents/${rejectModal!.docId}/review`, {
        status: 'rejected', rejectionReason: rejectReason.trim(),
      });
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch {
      Alert.alert('Error', 'Could not reject.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.title}>Client Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1E40AF" size="large" />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          {years.map((ty) => (
            <View key={ty.id} style={s.yearCard}>
              <Text style={s.yearTitle}>{ty.year} — <Text style={s.yearStatus}>{ty.status}</Text></Text>
              {ty.documents.map((doc) => (
                <View key={doc.id} style={s.docCard}>
                  <View style={s.docTop}>
                    <Text style={s.docType}>{doc.docType}</Text>
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
                         doc.reviewStatus === 'rejected' ? '✗ Rejected' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  {doc.reviewStatus === 'rejected' && doc.rejectionReason && (
                    <Text style={s.reason}>↳ {doc.rejectionReason}</Text>
                  )}
                  {doc.reviewStatus === 'pending' && (
                    <View style={s.actions}>
                      <TouchableOpacity style={s.approveBtn} onPress={() => approve(doc.id)}>
                        <Text style={s.approveTxt}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.rejectBtn} onPress={() => setRejectModal({ docId: doc.id })}>
                        <Text style={s.rejectTxt}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Reject Modal */}
      <Modal visible={!!rejectModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Rejection Reason</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. Wrong year / document"
              multiline
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <TouchableOpacity style={s.rejectBtn2} onPress={reject} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#DC2626" /> : <Text style={s.rejectTxt2}>Confirm Reject</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => { setRejectModal(null); setRejectReason(''); }}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 16, gap: 16 },
  yearCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  yearTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  yearStatus: { fontWeight: '500', color: '#1E40AF' },
  docCard: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginTop: 8 },
  docTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docType: { fontSize: 14, fontWeight: '500', color: '#374151', flex: 1 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pillGreen: { backgroundColor: '#DCFCE7' },
  pillRed: { backgroundColor: '#FEE2E2' },
  pillGray: { backgroundColor: '#F3F4F6' },
  pillText: { fontSize: 11, fontWeight: '600' },
  reason: { fontSize: 11, color: '#DC2626', marginTop: 4, paddingLeft: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { flex: 1, backgroundColor: '#DCFCE7', borderRadius: 8, padding: 8, alignItems: 'center' },
  approveTxt: { color: '#16A34A', fontWeight: '600', fontSize: 13 },
  rejectBtn: { flex: 1, backgroundColor: '#FEE2E2', borderRadius: 8, padding: 8, alignItems: 'center' },
  rejectTxt: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  rejectBtn2: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8 },
  rejectTxt2: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelTxt: { color: '#6B7280', fontSize: 14 },
});
