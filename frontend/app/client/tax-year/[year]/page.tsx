'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

export default function TaxYearPage() {
  const params = useParams();
  const router = useRouter();
  const year = parseInt(params.year as string);
  
  const [completeness, setCompleteness] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('T4');

  const loadCompleteness = async () => {
    try {
      const res = await APIClient.getCompleteness(year);
      setCompleteness(res.data);
    } catch (error: any) {
      console.error('Load error:', error);
    }
  };

  useEffect(() => {
    loadCompleteness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('docType', docType);

    try {
      await APIClient.uploadDocument(year, formData);
      setSelectedFile(null);
      alert(`${docType} document uploaded successfully!`);
      loadCompleteness();
    } catch (error: any) {
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Check if profile is actually filled out (at least one field is true)
  const hasProfile = completeness?.taxYear?.profile && (
    completeness.taxYear.profile.has_employment_income ||
    completeness.taxYear.profile.has_self_employment ||
    completeness.taxYear.profile.has_investment_income ||
    completeness.taxYear.profile.has_rental_income ||
    completeness.taxYear.profile.has_rrsp_contributions ||
    completeness.taxYear.profile.has_childcare_expenses ||
    completeness.taxYear.profile.has_tuition ||
    completeness.taxYear.profile.has_medical_expenses ||
    completeness.taxYear.profile.has_donations ||
    completeness.taxYear.profile.claims_home_office ||
    completeness.taxYear.profile.has_moving_expenses ||
    completeness.taxYear.profile.is_married ||
    completeness.taxYear.profile.has_dependents
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Tax Year {year}</h1>
          <button onClick={() => router.push('/client/dashboard')} className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 max-w-4xl">
        {!hasProfile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">Please complete your tax profile first</p>
            <button 
              onClick={() => router.push(`/client/tax-year/${year}/profile`)}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Complete Profile
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select 
                value={docType} 
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="T4">T4 - Employment Income</option>
                <option value="T5">T5 - Investment Income</option>
                <option value="T2202">T2202 - Tuition</option>
                <option value="RRSP">RRSP Contribution Receipt</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <button 
              type="submit" 
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {completeness && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Tax Return Status</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Completeness</span>
                <span className="text-blue-600 font-bold">{completeness.completenessScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${completeness.completenessScore}%` }}
                ></div>
              </div>
            </div>
            
            {completeness.documents && completeness.documents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Uploaded Documents ({completeness.documents.length})</h3>
                <ul className="space-y-2">
                  {completeness.documents.map((doc: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-sm">{doc.docType} - {doc.filename}</span>
                      <span className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
