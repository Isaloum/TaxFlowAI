import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../lib/api';

export default function UploadScreen() {
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');

  const DOC_TYPES = ['T4', 'T5', 'T3', 'RRSP', 'RL1', 'RL5', 'T4A', 'Other'];

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length) setFile(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!docType) return Alert.alert('Missing', 'Select a document type first.');
    if (!file) return Alert.alert('Missing', 'Pick a file first.');
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const mimeType = file.mimeType || 'application/pdf';

      // Step 1: Get presigned URL
      setStep('Preparing upload...');
      const { data: presignData } = await api.post(
        `/documents/tax-years/${year}/presign`,
        {
          docType,
          filename: file.name,
          mimeType,
          fileSize: file.size ?? null,
        }
      );
      const { signedUrl, documentId } = presignData;

      // Step 2: Upload file directly to Supabase storage
      setStep('Uploading file...');
      const fileContent = await fetch(file.uri);
      const blob = await fileContent.blob();
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error(`Storage upload failed: ${uploadRes.status}`);

      // Step 3: Confirm upload
      setStep('Confirming...');
      await api.post(`/documents/${documentId}/confirm`);

      Alert.alert('Success! 🎉', `${docType} uploaded successfully.`);
      setFile(null);
      setDocType('');
    } catch (e: any) {
      console.error('Upload error:', e?.message || e);
      Alert.alert('Error', `Upload failed: ${e?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Upload Document</Text>

        <Text style={s.label}>Document Type</Text>
        <View style={s.types}>
          {DOC_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.type, docType === t && s.typeSelected]}
              onPress={() => setDocType(t)}
            >
              <Text style={[s.typeText, docType === t && s.typeTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>File</Text>
        <TouchableOpacity style={s.pickBtn} onPress={pickFile}>
          <Text style={s.pickText}>{file ? `📎 ${file.name}` : '+ Pick PDF or Image'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.uploadBtn} onPress={handleUpload} disabled={loading}>
          {loading
            ? <View style={{ alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                {!!step && <Text style={s.stepText}>{step}</Text>}
              </View>
            : <Text style={s.uploadText}>Upload</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F7FF' },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  type: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  typeSelected: { backgroundColor: '#1E40AF', borderColor: '#1E40AF' },
  typeText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  typeTextSelected: { color: '#fff' },
  pickBtn: { borderWidth: 2, borderColor: '#1E40AF', borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24 },
  pickText: { color: '#1E40AF', fontSize: 14, fontWeight: '600' },
  uploadBtn: { backgroundColor: '#1E40AF', borderRadius: 12, padding: 16, alignItems: 'center' },
  uploadText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  stepText: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.85 },
});
