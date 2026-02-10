'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Document {
  id: string;
  docType: string;
  docSubtype?: string;
  originalFilename?: string;
  uploadedAt: string;
  reviewStatus: string;
  extractionStatus: string;
}

interface TaxYear {
  id: string;
  year: number;
  status: string;
  completenessScore: number;
  submittedAt?: string;
  reviewedAt?: string;
  documents: Document[];
  validations: any[];
}

interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  province: string;
  phone: string;
  taxYears: TaxYear[];
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/accountant/clients/${clientId}/years`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client data');
      }

      const data = await response.json();
      setClient(data.client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-200 text-gray-800',
      submitted: 'bg-yellow-200 text-yellow-800',
      in_review: 'bg-blue-200 text-blue-800',
      completed: 'bg-green-200 text-green-800',
      archived: 'bg-gray-300 text-gray-600'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.draft}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
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
          <div className="text-lg">Loading client data...</div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Client not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <button
        onClick={() => router.push('/accountant/dashboard')}
        className="mb-4 text-blue-600 hover:text-blue-900"
      >
        ← Back to Dashboard
      </button>

      {/* Client Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{`${client.firstName} ${client.lastName}`}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-medium">{client.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Province</div>
            <div className="font-medium">{client.province}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Phone</div>
            <div className="font-medium">{client.phone}</div>
          </div>
        </div>
      </div>

      {/* Tax Years */}
      <h2 className="text-2xl font-bold mb-4">Tax Years</h2>
      {client.taxYears.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          No tax years found for this client.
        </div>
      ) : (
        <div className="space-y-4">
          {client.taxYears.map((taxYear) => (
            <div key={taxYear.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold">{taxYear.year}</h3>
                  {getStatusBadge(taxYear.status)}
                </div>
                <button
                  onClick={() => router.push(`/accountant/review/${taxYear.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Review Tax Year
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Completeness</div>
                  <div className="font-medium">{taxYear.completenessScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Documents</div>
                  <div className="font-medium">{taxYear.documents.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Submitted</div>
                  <div className="font-medium">
                    {taxYear.submittedAt 
                      ? new Date(taxYear.submittedAt).toLocaleDateString() 
                      : 'Not submitted'}
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              {taxYear.documents.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-2">Documents</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Filename
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Uploaded
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Review Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {taxYear.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-4 py-2 text-sm">
                              {doc.docType}
                              {doc.docSubtype && (
                                <div className="text-xs text-gray-500">{doc.docSubtype}</div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm">{doc.originalFilename || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {getReviewStatusBadge(doc.reviewStatus)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
