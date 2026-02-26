'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed',   color: 'text-green-700',  bg: 'bg-green-100'  },
  submitted: { label: 'Submitted',   color: 'text-blue-700',   bg: 'bg-blue-100'   },
  draft:     { label: 'In Progress', color: 'text-yellow-700', bg: 'bg-yellow-100' },
};

function YearCard({ year, ty, onClick, large = false }: { year: number; ty: any; onClick: () => void; large?: boolean }) {
  const score     = ty?.completenessScore ?? 0;
  const status    = ty?.status || 'draft';
  const cfg       = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const docsCount = ty?.documents?.length ?? 0;
  const scoreColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer group ${large ? 'p-6' : 'p-4'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`font-bold text-gray-900 ${large ? 'text-3xl' : 'text-xl'}`}>{year}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Completeness bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Completeness</span>
          <span className="font-semibold text-gray-700">{score}%</span>
        </div>
        <div className={`w-full bg-gray-100 rounded-full ${large ? 'h-2.5' : 'h-1.5'}`}>
          <div className={`rounded-full transition-all ${scoreColor} ${large ? 'h-2.5' : 'h-1.5'}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Doc list */}
      {docsCount === 0 ? (
        <p className="text-xs text-gray-400 italic">No documents uploaded yet</p>
      ) : (
        <ul className="space-y-1.5">
          {(ty.documents as any[]).slice(0, large ? 6 : 3).map((doc: any, i: number) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-700 truncate" title={doc.originalFilename ?? doc.docType}>
                {doc.docType}
              </span>
              {doc.reviewStatus === 'approved' && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full shrink-0">✓ Approved</span>}
              {doc.reviewStatus === 'rejected' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full shrink-0">✗ Fix needed</span>}
              {doc.reviewStatus === 'pending'  && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">Pending</span>}
            </li>
          ))}
          {docsCount > (large ? 6 : 3) && (
            <li className="text-[10px] text-blue-500 font-medium">+{docsCount - (large ? 6 : 3)} more</li>
          )}
        </ul>
      )}

      <div className={`flex items-center justify-between mt-4 pt-3 border-t border-gray-50 ${large ? '' : ''}`}>
        <span className="text-xs text-blue-600 font-medium group-hover:underline">
          {docsCount === 0 ? 'Start uploading →' : 'View & upload →'}
        </span>
        <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const router = useRouter();
  const [profile,  setProfile]  = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [showPrev, setShowPrev] = useState(false);

  useEffect(() => {
    APIClient.getProfile()
      .then(res => setProfile(res.data.client))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  const taxYearMap: Record<number, any> = {};
  (profile?.taxYears || []).forEach((ty: any) => {
    taxYearMap[ty.year] = {
      ...ty,
      documents: (ty.documents || []).map((d: any) => ({
        ...d,
        filename: d.originalFilename ?? d.filename,
      })),
    };
  });

  // Active year = current year; previous = everything else that has data
  const activeYear = currentYear;
  const previousYears = [currentYear - 1, currentYear - 2].filter(y => taxYearMap[y]);

  const logout = () => {
    localStorage.removeItem('auth_token_client');
    localStorage.removeItem('auth_user_client');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  // Alerts
  const rejectedDocs: { year: number; docType: string }[] = [];
  (profile?.taxYears || []).forEach((ty: any) => {
    if (ty.status === 'completed') return; // skip completed years from rejection banner
    (ty.documents || []).forEach((d: any) => {
      if (d.reviewStatus === 'rejected') rejectedDocs.push({ year: ty.year, docType: d.docType });
    });
  });
  const completedYears = (profile?.taxYears || [])
    .filter((ty: any) => ty.status === 'completed')
    .map((ty: any) => ty.year)
    .sort((a: number, b: number) => b - a);
  const isCompleted = completedYears.length > 0;

  // Years with rejected docs (for banner)
  const rejectedYears = [...new Set(rejectedDocs.map(d => d.year))].sort((a, b) => b - a);
  const rejectedYearsLabel = rejectedYears.length > 0
    ? `(${rejectedYears.join(' & ')})`
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">TaxFlowAI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Hello, <strong>{profile?.firstName}</strong>
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Taxes</h1>
          <p className="text-sm text-gray-500 mt-1">Upload your documents and track your return progress</p>
        </div>

        {/* Completion banner */}
        {isCompleted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">🎉 Your {completedYears.join(' & ')} tax return{completedYears.length > 1 ? 's are' : ' is'} complete!</p>
              <p className="text-xs text-green-600 mt-0.5">Your accountant has finished processing your file.</p>
            </div>
          </div>
        )}

        {/* Rejection alert */}
        {rejectedDocs.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Action required — {rejectedDocs.length} document{rejectedDocs.length > 1 ? 's need' : ' needs'} correction {rejectedYearsLabel}
              </p>
              <p className="text-xs text-red-600 mt-0.5">Click the year below to re-upload the correct document.</p>
            </div>
          </div>
        )}

        {/* Province badge */}
        {profile?.province && (
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            📍 {profile.province} — documents filtered for your province
          </div>
        )}

        {/* ── ACTIVE YEAR — big card ── */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Current</p>
          <YearCard
            year={activeYear}
            ty={taxYearMap[activeYear]}
            onClick={() => router.push(`/client/tax-year/${activeYear}`)}
            large
          />
        </div>

        {/* ── PREVIOUS YEARS — collapsible ── */}
        {previousYears.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowPrev(v => !v)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showPrev ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">Previous years ({previousYears.length})</span>
            </button>

            {showPrev && (
              <div className="grid gap-4 sm:grid-cols-2">
                {previousYears.map(year => (
                  <YearCard
                    key={year}
                    year={year}
                    ty={taxYearMap[year]}
                    onClick={() => router.push(`/client/tax-year/${year}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
