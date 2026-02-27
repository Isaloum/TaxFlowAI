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
  completenessScore: number; documentCount: number;
}

interface AccountantRow {
  id: string; email: string; firmName: string; phone: string;
  languagePref: string; createdAt: string; clientCount: number;
  subscriptionStatus: string; trialEndsAt: string | null; currentPeriodEnd: string | null;
  clients: ClientSummary[];
}

interface Stats {
  totalAccountants: number; totalClients: number;
  completedTaxYears: number; submittedTaxYears: number;
}

const HEALTH: Record<string, { label: string; color: string; dot: string }> = {
  active:     { label: 'Active',    color: 'bg-green-900/40 text-green-400 border-green-800',  dot: 'bg-green-400' },
  trialing:   { label: 'Trial',     color: 'bg-blue-900/40 text-blue-400 border-blue-800',     dot: 'bg-blue-400' },
  past_due:   { label: 'Past Due',  color: 'bg-red-900/40 text-red-400 border-red-800',        dot: 'bg-red-400' },
  canceled:   { label: 'Canceled',  color: 'bg-gray-800 text-gray-400 border-gray-700',        dot: 'bg-gray-500' },
  unpaid:     { label: 'Unpaid',    color: 'bg-orange-900/40 text-orange-400 border-orange-800', dot: 'bg-orange-400' },
  incomplete: { label: 'Incomplete',color: 'bg-gray-800 text-gray-500 border-gray-700',        dot: 'bg-gray-600' },
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-900/40 text-green-400',
  submitted:  'bg-blue-900/40 text-blue-400',
  in_review:  'bg-yellow-900/40 text-yellow-400',
  draft:      'bg-gray-800 text-gray-400',
  no_data:    'bg-gray-800 text-gray-500',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats]             = useState<Stats | null>(null);
  const [accountants, setAccountants] = useState<AccountantRow[]>([]);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [filterHealth, setFilterHealth] = useState<string>('all');
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
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/admin/login');
      else showToast(`❌ Load error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, firmName: string) => {
    if (!confirm(`Delete "${firmName}" and ALL their clients? Cannot be undone.`)) return;
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

  const filtered = accountants.filter(a => {
    const matchSearch = `${a.firmName} ${a.email}`.toLowerCase().includes(search.toLowerCase());
    const matchHealth = filterHealth === 'all' || a.subscriptionStatus === filterHealth;
    return matchSearch && matchHealth;
  });

  // Health summary counts
  const healthCounts = accountants.reduce((acc, a) => {
    acc[a.subscriptionStatus] = (acc[a.subscriptionStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const atRisk = (healthCounts['past_due'] || 0) + (healthCounts['unpaid'] || 0) + (healthCounts['canceled'] || 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Accountant Management</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor all accountants, their clients and subscription health</p>
        </div>

        {/* Stats — only what matters */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accountants</p>
              <p className="text-3xl font-bold mt-1 text-red-400">{stats.totalAccountants}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Clients</p>
              <p className="text-3xl font-bold mt-1 text-blue-400">{stats.totalClients}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active / Trial</p>
              <p className="text-3xl font-bold mt-1 text-green-400">
                {(healthCounts['active'] || 0) + (healthCounts['trialing'] || 0)}
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">At Risk</p>
              <p className={`text-3xl font-bold mt-1 ${atRisk > 0 ? 'text-red-400' : 'text-gray-500'}`}>{atRisk}</p>
              {atRisk > 0 && <p className="text-xs text-red-500 mt-0.5">past due / unpaid / canceled</p>}
            </div>
          </div>
        )}

        {/* Search + Health filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 px-4 py-3 flex items-center gap-3">
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
          <select
            value={filterHealth}
            onChange={e => setFilterHealth(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trial</option>
            <option value="past_due">Past Due</option>
            <option value="unpaid">Unpaid</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500 mb-3">{filtered.length} accountant{filtered.length !== 1 ? 's' : ''}</p>

        {/* Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-800/50 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Firm</div>
            <div className="col-span-2 hidden sm:block">Clients</div>
            <div className="col-span-2 hidden md:block">Annual Rev.</div>
            <div className="col-span-2">Health</div>
            <div className="col-span-2 hidden lg:block">Joined</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500 text-sm">
              {search || filterHealth !== 'all' ? 'No match found.' : 'No accountants registered yet.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {filtered.map(acct => {
                const health = HEALTH[acct.subscriptionStatus] || HEALTH['incomplete'];
                const revenue = Math.max(acct.clientCount, 42) * 12;
                const isExpanded = expanded === acct.id;

                return (
                  <div key={acct.id}>
                    {/* Row */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-800/20 transition">
                      {/* Firm */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-red-900/40 text-red-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {acct.firmName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-sm">{acct.firmName}</p>
                          <p className="text-xs text-gray-500 truncate">{acct.email}</p>
                        </div>
                      </div>

                      {/* Clients */}
                      <div className="col-span-2 hidden sm:block">
                        <span className="text-sm font-semibold text-white">{acct.clientCount}</span>
                        <span className="text-xs text-gray-500 ml-1">clients</span>
                      </div>

                      {/* Revenue */}
                      <div className="col-span-2 hidden md:block">
                        <span className="text-sm font-semibold text-white">${revenue.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 ml-1">/yr</span>
                      </div>

                      {/* Health */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${health.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                          {health.label}
                        </span>
                      </div>

                      {/* Joined */}
                      <div className="col-span-1 hidden lg:block text-xs text-gray-500">
                        {new Date(acct.createdAt).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 lg:col-span-1 flex items-center justify-end gap-2">
                        {acct.clientCount > 0 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : acct.id)}
                            className="text-xs text-gray-400 hover:text-blue-400 transition px-2.5 py-1 rounded-lg border border-gray-700 hover:border-blue-800 flex items-center gap-1"
                          >
                            <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {acct.clientCount}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(acct.id, acct.firmName)}
                          disabled={deleting === acct.id}
                          className="text-xs text-gray-500 hover:text-red-400 transition px-2.5 py-1 rounded-lg border border-gray-700 hover:border-red-900 disabled:opacity-50"
                        >
                          {deleting === acct.id ? '…' : '🗑'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded clients */}
                    {isExpanded && acct.clients.length > 0 && (
                      <div className="border-t border-gray-800 bg-gray-950/50">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-800/40 border-b border-gray-800">
                              <th className="px-8 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Province</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Docs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/40">
                            {acct.clients.map(client => (
                              <tr key={client.id} className="hover:bg-gray-800/20 transition">
                                <td className="px-8 py-2.5">
                                  <p className="font-medium text-gray-200 text-sm">{client.name}</p>
                                  <p className="text-xs text-gray-500">{client.email}</p>
                                </td>
                                <td className="px-4 py-2.5 text-gray-400 text-sm hidden md:table-cell">{client.province || '—'}</td>
                                <td className="px-4 py-2.5 text-gray-400 text-sm">{client.latestYear || '—'}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[client.status] || STATUS_COLORS['no_data']}`}>
                                    {client.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-gray-400 text-sm hidden lg:table-cell">{client.documentCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
