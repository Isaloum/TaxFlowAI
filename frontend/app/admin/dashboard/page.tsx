'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function api() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
}

interface ClientSummary {
  id: string; name: string; email: string; province: string;
  createdAt: string; latestYear: number | null; status: string;
  completenessScore: number; documentCount: number; submittedAt: string | null;
}

interface AccountantRow {
  id: string; email: string; firmName: string; phone: string;
  languagePref: string; createdAt: string; clientCount: number;
  clients: ClientSummary[];
}

interface Stats {
  totalAccountants: number; totalClients: number; totalDocuments: number;
  totalTaxYears: number; completedTaxYears: number; submittedTaxYears: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats]             = useState<Stats | null>(null);
  const [accountants, setAccountants] = useState<AccountantRow[]>([]);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState('');
  const [deleting, setDeleting]       = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api().get('/admin/stats'),
        api().get('/admin/accountants'),
      ]);
      setStats(sRes.data);
      setAccountants(aRes.data.accountants);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, firmName: string) => {
    if (!confirm(`Delete accountant "${firmName}" and ALL their clients? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api().delete(`/admin/accountants/${id}`);
      setAccountants(prev => prev.filter(a => a.id !== id));
      showToast(`✅ Deleted ${firmName}`);
    } catch {
      showToast('❌ Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const filtered = accountants.filter(a =>
    `${a.firmName} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-900/40 text-green-400',
    submitted:  'bg-blue-900/40 text-blue-400',
    in_review:  'bg-yellow-900/40 text-yellow-400',
    draft:      'bg-gray-800 text-gray-400',
    no_data:    'bg-gray-800 text-gray-500',
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm text-gray-500">Loading admin dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 border border-gray-700 shadow-xl rounded-xl px-4 py-3 text-sm text-white">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-white">TaxFlowAI</span>
            <span className="ml-2 text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full border border-red-800">ADMIN</span>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400 transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-1">All accountants and their clients across TaxFlowAI</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Accountants',       value: stats.totalAccountants,  color: 'text-red-400' },
              { label: 'Clients',           value: stats.totalClients,      color: 'text-blue-400' },
              { label: 'Documents',         value: stats.totalDocuments,    color: 'text-purple-400' },
              { label: 'Tax Years',         value: stats.totalTaxYears,     color: 'text-gray-200' },
              { label: 'Completed Returns', value: stats.completedTaxYears, color: 'text-green-400' },
              { label: 'Awaiting Review',   value: stats.submittedTaxYears, color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-4 px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by firm name or email…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-500 hover:text-gray-300 text-xs">Clear</button>}
        </div>

        {/* Accountant rows */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-12 text-center text-gray-500 text-sm">
              {search ? 'No match found.' : 'No accountants registered yet.'}
            </div>
          )}

          {filtered.map(acct => (
            <div key={acct.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {/* Accountant header row */}
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-red-900/40 text-red-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {acct.firmName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{acct.firmName}</p>
                    <p className="text-xs text-gray-400 truncate">{acct.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                      {acct.clientCount} client{acct.clientCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-600">
                      Joined {new Date(acct.createdAt).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {acct.clientCount > 0 && (
                    <button
                      onClick={() => setExpanded(expanded === acct.id ? null : acct.id)}
                      className="text-xs text-gray-400 hover:text-blue-400 transition px-3 py-1.5 rounded-lg border border-gray-700 hover:border-blue-800 flex items-center gap-1.5"
                    >
                      <svg className={`w-3.5 h-3.5 transition-transform ${expanded === acct.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {expanded === acct.id ? 'Hide' : 'View'} clients
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(acct.id, acct.firmName)}
                    disabled={deleting === acct.id}
                    className="text-xs text-gray-500 hover:text-red-400 transition px-3 py-1.5 rounded-lg border border-gray-700 hover:border-red-900 disabled:opacity-50"
                  >
                    {deleting === acct.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Expanded client list */}
              {expanded === acct.id && acct.clients.length > 0 && (
                <div className="border-t border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-800/50 border-b border-gray-800">
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Province</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Docs</th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {acct.clients.map(client => (
                          <tr key={client.id} className="hover:bg-gray-800/30 transition">
                            <td className="px-5 py-3">
                              <p className="font-medium text-gray-200">{client.name}</p>
                              <p className="text-xs text-gray-500">{client.email}</p>
                            </td>
                            <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{client.province || '—'}</td>
                            <td className="px-5 py-3 text-gray-400">{client.latestYear || '—'}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[client.status] || STATUS_COLORS['no_data']}`}>
                                {client.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-gray-400 hidden lg:table-cell">{client.documentCount}</td>
                            <td className="px-5 py-3 hidden xl:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-800 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${client.completenessScore >= 80 ? 'bg-green-500' : client.completenessScore >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                    style={{ width: `${client.completenessScore}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{client.completenessScore}%</span>
                              </div>
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
      </div>
    </div>
  );
}
