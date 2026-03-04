import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../lib/api';

export default function YearDetail() {
  const { yearId, year } = useLocalSearchParams<{ yearId: string; year: string }>();
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    api.get('/users/client/profile').then(({ data }) => {
      const taxYears = data.client?.taxYears ?? data.taxYears ?? [];
      const ty = taxYears.find((t: any) => t.id === yearId);
      setDocs(ty?.documents ?? []);
    }).finally(() => setLoading(false));
  }, [yearId]);

  const statusColor = (s: string) =>
    s === 'approved' ? '#16A34A' : s === 'rejected' ? '#DC2626' : '#6B7280';
  const statusBg = (s: string) =>
    s === 'approved' ? '#DCFCE7' : s === 'rejected' ? '#FEE2E2' : '#F3F4F6';
  const statusLabel = (s: string) =>
    s === 'approved' ? '✓ Approved' : s === 'rejected' ? '✗ Fix needed' : '⏳ Pending review';

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>{year} Documents</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#1E40AF" size="large" />
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          {docs.length === 0 ? (
            <Text style={s.empty}>No documents found for this year.</Text>
          ) : (
            docs.map((doc) => (
              <TouchableOpacity key={doc.id} style={s.card} onPress={() => setSelected(doc)} activeOpacity={0.75}>
                <View style={s.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docType}>{doc.docType}{doc.docSubtype ? ` – ${doc.docSubtype}` : ''}</Text>
                    {doc.originalFilename && <Text style={s.filename}>{doc.originalFilename}</Text>}
                  </View>
                  <Text style={s.arrow}>›</Text>
                </View>
                <View style={[s.pill, { backgroundColor: statusBg(doc.reviewStatus) }]}>
                  <Text style={[s.pillText, { color: statusColor(doc.reviewStatus) }]}>
                    {statusLabel(doc.reviewStatus)}
                  </Text>
                </View>
                {doc.reviewStatus === 'rejected' && doc.rejectionReason && (
                  <Text style={s.reason}>↳ {doc.rejectionReason}</Text>
                )}
                {doc.uploadedAt && (
                  <Text style={s.date}>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Document Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{selected?.docType}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={s.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {selected?.docSubtype ? <Text style={s.field}><Text style={s.label}>Type: </Text>{selected.docSubtype}</Text> : null}
            {selected?.originalFilename ? <Text style={s.field}><Text style={s.label}>File: </Text>{selected.originalFilename}</Text> : null}
            {selected?.fileSizeBytes ? <Text style={s.field}><Text style={s.label}>Size: </Text>{(selected.fileSizeBytes / 1024).toFixed(1)} KB</Text> : null}
            {selected?.mimeType ? <Text style={s.field}><Text style={s.label}>Format: </Text>{selected.mimeType}</Text> : null}
            {selected?.uploadedAt ? <Text style={s.field}><Text style={s.label}>Uploaded: </Text>{new Date(selected.uploadedAt).toLocaleString()}</Text> : null}

            <View style={[s.pill, { backgroundColor: statusBg(selected?.reviewStatus), marginTop: 12 }]}>
              <Text style={[s.pillText, { color: statusColor(selected?.reviewStatus) }]}>
                {statusLabel(selected?.reviewStatus ?? '')}
              </Text>
            </View>

            {selected?.reviewStatus === 'rejected' && selected?.rejectionReason && (
              <View style={s.reasonBox}>
                <Text style={s.reasonTitle}>Reason for rejection:</Text>
                <Text style={s.reasonText}>{selected.rejectionReason}</Text>
              </View>
            )}

            {selected?.fileUrl && (
              <TouchableOpacity style={s.viewBtn} onPress={() => Linking.openURL(selected.fileUrl)}>
                <Text style={s.viewBtnText}>📄 View Document</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  back: { fontSize: 15, color: '#1E40AF', width: 60 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  arrow: { fontSize: 22, color: '#9CA3AF', marginLeft: 8 },
  docType: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  filename: { fontSize: 12, color: '#6B7280' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 4 },
  pillText: { fontSize: 12, fontWeight: '600' },
  reason: { fontSize: 12, color: '#DC2626', marginTop: 4 },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#111827', flex: 1 },
  close: { fontSize: 20, color: '#6B7280', paddingLeft: 12 },
  field: { fontSize: 14, color: '#374151', marginBottom: 6 },
  label: { fontWeight: '600', color: '#111827' },
  reasonBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 8 },
  reasonTitle: { fontSize: 13, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#7F1D1D' },
  viewBtn: { marginTop: 20, backgroundColor: '#1E40AF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  viewBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
