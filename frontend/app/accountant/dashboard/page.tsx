'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

export default function AccountantDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await APIClient.getAccountantClients();
      setClients(res.data.clients || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-xl font-bold">Accountant Dashboard</h1>
          <button onClick={() => {
            localStorage.removeItem('auth_token');
            router.push('/login');
          }} className="text-red-600">Logout</button>
        </div>
      </nav>

      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">My Clients ({clients.length})</h2>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Latest Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Completeness</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Pending Review</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/accountant/client/${client.id}`)}>
                  <td className="px-6 py-4">{client.name}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email}</td>
                  <td className="px-6 py-4">{client.latestYear || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      client.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      client.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{client.completenessScore}%</td>
                  <td className="px-6 py-4">
                    {client.pendingReview > 0 && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        {client.pendingReview} docs
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
