'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

// ─── Dev Progress Tracker ──────────────────────────────────────────────────────
const DONE = [
  'Client & accountant authentication (JWT)',
  'Client profile questionnaire (income sources)',
  'Document upload + S3 storage',
  'AI document classification (GPT-4o)',
  'OCR extraction + field parsing',
  'Quebec rules engine (T4/RL-1 pairing, T2125…)',
  'Accountant dashboard — client list + completeness',
  'Accountant client page — approve / reject / reset / rescan',
  'Silent polling — zero page flash on actions',
  'SQS async processing queue + Dead-Letter Queue',
  'Forgot password / reset password flow',
  'Completeness score — live recalculation on every view',
  'Completed years locked at 100% (no re-validation)',
  'Token isolation — accountant + client tabs work simultaneously',
  'Rejection reason visible to client on re-upload page',
  'Year numbers in completion & rejection banners',
  'Validation checks — correct field names & pass/fail values',
  'Dashboard: meaningful pending column text',
  'Delete document 404 fix',
  'Login 500 fix (Prisma explicit select everywhere)',
];

const NEXT = [
  { label: 'Mobile responsive layout', priority: '🔴 High' },
  { label: 'French (FR) language support', priority: '🔴 High' },
  { label: 'End-to-end testing of all flows', priority: '🔴 High' },
  { label: 'Re-upload flow UX — client replaces rejected doc easily', priority: '🟡 Medium' },
  { label: 'Email notifications — rejection & completion emails', priority: '🟡 Medium' },
  { label: 'Accountant can invite clients by email', priority: '🟡 Medium' },
  { label: 'Admin super-dashboard (all firms)', priority: '🟢 Later' },
  { label: 'RDS Proxy for 500+ concurrent users', priority: '🟢 Later' },
  { label: 'Stripe billing per accountant firm', priority: '🟢 Later' },
];

function DevProgress() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'done' | 'next'>('next');
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-gray-700 transition flex items-center gap-2"
      >
        🚀 Dev Progress
        <span className="bg-green-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{DONE.length} done</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">TaxFlowAI — Dev Progress</p>
              <p className="text-xs text-gray-400 mt-0.5">{DONE.length} done · {NEXT.length} remaining</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
          </div>

          {/* Progress bar */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Overall progress</span>
              <span>{Math.round(DONE.length / (DONE.length + NEXT.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round(DONE.length / (DONE.length + NEXT.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-4 mt-2">
            <button onClick={() => setTab('next')} className={`text-xs font-semibold pb-2 mr-4 border-b-2 transition ${tab === 'next' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
              ⏳ Up next ({NEXT.length})
            </button>
            <button onClick={() => setTab('done')} className={`text-xs font-semibold pb-2 border-b-2 transition ${tab === 'done' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'}`}>
              ✅ Done ({DONE.length})
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-72 px-4 py-2 space-y-1">
            {tab === 'done' && DONE.map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <p className="text-xs text-gray-600">{item}</p>
              </div>
            ))}
            {tab === 'next' && NEXT.map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[10px] flex-shrink-0 mt-0.5">{item.priority.split(' ')[0]}</span>
                <div>
                  <p className="text-xs text-gray-700 font-medium">{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.priority.split(' ').slice(1).join(' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AccountantDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    province: 'QC', phone: '', languagePref: 'fr' as 'en' | 'fr',
  });

  useEffect(() => {
    loadClients();
    const timeout = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(timeout);
  }, []);

  const loadClients = async () => {
    try {
      const res = await APIClient.getAccountantClients();
      setClients(res.data.clients || []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await APIClient.createClient(form);
      showToast(`✅ Invitation sent to ${form.email}`);
      setShowAddClient(false);
      setForm({ firstName: '', lastName: '', email: '', province: 'QC', phone: '', languagePref: 'fr' });
      await loadClients();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token_accountant');
    localStorage.removeItem('auth_user_accountant');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  // Stats
  const total     = clients.length;
  const pending   = clients.filter(c => (c.pendingReview ?? 0) > 0).length;
  const completed = clients.filter(c => c.status === 'completed').length;
  const urgent    = clients.filter(c => (c.pendingReview ?? 0) >= 3).length;

  const STATUS_ORDER: Record<string, number> = { submitted: 0, in_review: 1, draft: 2, completed: 3 };
  const filtered = clients
    .filter(c => `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">TaxFlowAI</span>
          <span className="text-xs text-gray-400 ml-2 hidden sm:inline">Accountant Portal</span>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and review your clients&apos; tax documents</p>
          </div>
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Clients"     value={total}     color="text-gray-900" sub="all time" />
          <StatCard label="Pending Review"    value={pending}   color="text-yellow-600" sub="need your attention" />
          <StatCard label="Completed"         value={completed} color="text-green-600"  sub="tax years closed" />
          <StatCard label="Urgent"            value={urgent}    color="text-red-600"    sub="3+ docs waiting" />
        </div>

        {/* Search + Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs">Clear</button>
            )}
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Province</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Latest Year</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Completeness</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Submitted</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {search ? 'No clients match your search.' : 'No clients yet — click "Add Client" to get started.'}
                  </td>
                </tr>
              )}
              {filtered.map((client) => {
                const score = client.status === 'completed' ? 100 : (client.completenessScore ?? 0);
                const scoreColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400';
                return (
                  <tr
                    key={client.id}
                    className="hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => router.push(`/accountant/client?id=${client.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {client.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">{client.province || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">{client.latestYear || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${scoreColor}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{score}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      {client.submittedAt ? (
                        <span className="text-xs text-gray-600">
                          {new Date(client.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'completed' ? 'bg-green-100 text-green-700' :
                        client.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {client.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {(client.pendingReview ?? 0) > 0 ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          client.pendingReview >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {client.pendingReview} doc{client.pendingReview > 1 ? 's' : ''}
                        </span>
                      ) : client.status === 'completed' ? (
                        <span className="text-xs text-green-600">✓ All reviewed</span>
                      ) : client.documentsCount === 0 ? (
                        <span className="text-xs text-gray-400">No uploads yet</span>
                      ) : (
                        <span className="text-xs text-gray-500">All reviewed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Invite New Client</h3>
                <p className="text-xs text-gray-400 mt-0.5">Client will receive login credentials by email</p>
              </div>
              <button onClick={() => { setShowAddClient(false); setFormError(''); }}
                className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddClient} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Marie" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tremblay" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="marie@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Province *</label>
                  <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Language *</label>
                  <select value={form.languagePref} onChange={e => setForm({ ...form, languagePref: e.target.value as 'en' | 'fr' })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="514-555-0123" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddClient(false); setFormError(''); }}
                  className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                  {submitting ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg> Sending…</>
                  ) : '📧 Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DevProgress />
    </div>
  );
}
