'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Document {
  id: string;
  docType: string;
  docSubtype?: string;
  originalFilename?: string;
  fileUrl: string;
  uploadedAt: string;
  reviewStatus: string;
  extractionStatus: string;
  extractedData: any;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  province: string;
}

interface TaxYear {
  id: string;
  year: number;
  status: string;
  completenessScore: number;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  client: Client;
  documents: Document[];
  validations: any[];
}

export default function TaxYearReviewPage() {
  const router = useRouter();
  const params = useParams();
  const taxYearId = params.taxYearId as string;
  
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (taxYearId) {
      fetchTaxYearData();
    }
  }, [taxYearId]);

  const fetchTaxYearData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/accountant/tax-years/${taxYearId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tax year data');
      }

      const data = await response.json();
      setTaxYear(data.taxYear);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax year data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/accountant/documents/${documentId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to approve document');
      }

      await fetchTaxYearData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve document');
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/accountant/documents/${documentId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject document');
      }

      setRejectReason('');
      setSelectedDocument(null);
      await fetchTaxYearData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject document');
    }
  };

  const handleDownloadPackage = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `http://localhost:3001/api/accountant/tax-years/${taxYearId}/download-package`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download package');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_package_${taxYear?.client.lastName}_${taxYear?.year}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download package');
    } finally {
      setDownloading(false);
    }
  };

  const getReviewStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading tax year data...</div>
        </div>
      </div>
    );
  }

  if (error || !taxYear) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Tax year not found'}
        </div>
      </div>
    );
  }

  const pendingCount = taxYear.documents.filter(d => d.reviewStatus === 'pending').length;
  const approvedCount = taxYear.documents.filter(d => d.reviewStatus === 'approved').length;
  const rejectedCount = taxYear.documents.filter(d => d.reviewStatus === 'rejected').length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <button
        onClick={() => router.push(`/accountant/client/${taxYear.client.id}`)}
        className="mb-4 text-blue-600 hover:text-blue-900"
      >
        ← Back to Client
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              {taxYear.client.firstName} {taxYear.client.lastName} - {taxYear.year}
            </h1>
            <p className="text-gray-600">{taxYear.client.email}</p>
          </div>
          <button
            onClick={handleDownloadPackage}
            disabled={downloading || taxYear.documents.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {downloading ? 'Downloading...' : 'Download ZIP Package'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Completeness</div>
            <div className="font-medium text-lg">{taxYear.completenessScore}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Documents</div>
            <div className="font-medium text-lg">{taxYear.documents.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Pending Review</div>
            <div className="font-medium text-lg text-yellow-600">{pendingCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Approved</div>
            <div className="font-medium text-lg text-green-600">{approvedCount}</div>
          </div>
        </div>
      </div>

      {/* Documents Review */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Document Review</h2>
        
        {taxYear.documents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {taxYear.documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{doc.docType}</h3>
                      {getReviewStatusBadge(doc.reviewStatus)}
                    </div>
                    
                    {doc.docSubtype && (
                      <p className="text-sm text-gray-600 mb-1">Subtype: {doc.docSubtype}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-1">
                      Filename: {doc.originalFilename || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                    </p>

                    {doc.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                        </p>
                      </div>
                    )}

                    {doc.reviewedAt && (
                      <p className="text-xs text-gray-500">
                        Reviewed: {new Date(doc.reviewedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 text-center"
                    >
                      View Document
                    </a>
                    
                    {doc.reviewStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveDocument(doc.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Extracted Data Preview */}
                {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                  <div className="mt-3 bg-gray-50 rounded p-3">
                    <p className="text-sm font-semibold mb-2">Extracted Data:</p>
                    <pre className="text-xs overflow-auto max-h-40">
                      {JSON.stringify(doc.extractedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Reject Document</h3>
            <p className="mb-4 text-gray-700">
              Please provide a reason for rejecting <strong>{selectedDocument.docType}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded p-2 mb-4 h-32 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSelectedDocument(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectDocument(selectedDocument.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validations */}
      {taxYear.validations && taxYear.validations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Validation Results</h2>
          <div className="space-y-2">
            {taxYear.validations.map((validation) => (
              <div
                key={validation.id}
                className={`border-l-4 p-3 ${
                  validation.status === 'pass'
                    ? 'border-green-500 bg-green-50'
                    : validation.status === 'warning'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{validation.ruleCode}</p>
                    {validation.message && (
                      <p className="text-sm text-gray-700">{validation.message}</p>
                    )}
                    {validation.missingDocType && (
                      <p className="text-sm text-gray-600">
                        Missing: {validation.missingDocType}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold uppercase">{validation.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
