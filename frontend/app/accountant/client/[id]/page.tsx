'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

export default function AccountantClientDetail() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await APIClient.getClientTaxYears(clientId);
        setClient(res.data.client);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load client');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!client) return <div className="p-6">Client not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/accountant/dashboard')}
              className="text-blue-600 hover:text-blue-700">
              ← Back
            </button>
            <h1 className="text-xl font-bold">
              {client.firstName} {client.lastName}
            </h1>
          </div>
          <button onClick={() => {
            localStorage.removeItem('auth_token');
            router.push('/login');
          }} className="text-red-600">Logout</button>
        </div>
      </nav>

      <div className="container mx-auto px-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Client Info</h2>
          <p className="text-gray-600">{client.email}</p>
          <p className="text-gray-600">{client.phone} &middot; {client.province}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Tax Years</h2>

        {client.taxYears.length === 0 ? (
          <p className="text-gray-500">No tax years on file.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {client.taxYears.map((ty: any) => {
              const pendingDocs = ty.documents.filter(
                (d: any) => d.reviewStatus === 'pending'
              ).length;
              return (
                <div key={ty.id}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push(`/accountant/tax-year/${ty.id}`)}>
                  <h3 className="text-xl font-bold mb-1">Tax Year {ty.year}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-sm mb-3 ${
                    ty.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    ty.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ty.status || 'draft'}
                  </span>
                  <p className="text-gray-600 text-sm">
                    Completeness: {ty.completenessScore ?? 0}%
                  </p>
                  <p className="text-gray-600 text-sm">
                    Documents: {ty.documents.length}
                  </p>
                  {pendingDocs > 0 && (
                    <span className="mt-2 inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {pendingDocs} pending review
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
