'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
];

export default function AccountantDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    province: 'QC',
    phone: '',
    languagePref: 'fr' as 'en' | 'fr',
  });

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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await APIClient.createClient(form);
      setSuccess(`Invitation sent to ${form.email}!`);
      setShowAddClient(false);
      setForm({ firstName: '', lastName: '', email: '', province: 'QC', phone: '', languagePref: 'fr' });
      await loadClients();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create client.');
    } finally {
      setSubmitting(false);
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
            localStorage.removeItem('auth_user');
            router.push('/login');
          }} className="text-red-600">Logout</button>
        </div>
      </nav>

      <div className="container mx-auto px-6">

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            ✅ {success}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Clients ({clients.length})</h2>
          <button
            onClick={() => setShowAddClient(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Client
          </button>
        </div>

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
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No clients yet. Click &quot;+ Add Client&quot; to invite your first client.
                  </td>
                </tr>
              )}
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
                  <td className="px-6 py-4">{client.completenessScore ?? 0}%</td>
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

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Invite New Client</h3>
            <p className="text-sm text-gray-500 mb-4">
              The client will receive an email with their login credentials.
            </p>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleAddClient} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Marie"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Tremblay"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="marie@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <select
                  value={form.province}
                  onChange={e => setForm({ ...form, province: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {PROVINCES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="514-555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferred Language</label>
                <select
                  value={form.languagePref}
                  onChange={e => setForm({ ...form, languagePref: e.target.value as 'en' | 'fr' })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddClient(false); setError(''); }}
                  className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
