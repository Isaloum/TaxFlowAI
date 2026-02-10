'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';
import CompletenessCard from '@/components/client/CompletenessCard';
import ValidationResults from '@/components/client/ValidationResults';
import DocumentUploader from '@/components/client/DocumentUploader';
import DocumentList from '@/components/client/DocumentList';

export default function TaxYearPage() {
  const params = useParams();
  const router = useRouter();
  const year = parseInt(params.year as string);

  const [documents, setDocuments] = useState([]);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    try {
      const [docsRes, compRes] = await Promise.all([
        APIClient.getDocuments(year),
        APIClient.getCompleteness(year)
      ]);
      setDocuments(docsRes.documents || []);
      setCompleteness(compRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/client/dashboard')}
          className="text-blue-600 hover:text-blue-800 mb-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Tax Year {year}</h1>
      </div>

      {/* Profile prompt */}
      {!completeness?.taxYear?.profile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ Complete your profile first</p>
          <button onClick={() => router.push(`/client/tax-year/${year}/profile`)} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
            Complete Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentUploader year={year} onUploadComplete={loadData} />
          <DocumentList documents={documents} onDelete={loadData} />
        </div>

        {/* Right Column: Completeness & Validation */}
        <div className="space-y-6">
          <CompletenessCard year={year} />
          {completeness?.validations && (
            <ValidationResults validations={completeness.validations} />
          )}

          {/* Submit Button */}
          {completeness?.completenessScore === 100 && (
            <button className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Submit to Accountant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
