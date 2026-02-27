'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api-client';

interface BillingStatus {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  clientCount: number;
  stripeSubscriptionId: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  trialing:  { label: 'Free Trial',    color: 'text-blue-400',   bg: 'bg-blue-900/30 border-blue-800' },
  active:    { label: 'Active',        color: 'text-green-400',  bg: 'bg-green-900/30 border-green-800' },
  past_due:  { label: 'Past Due',      color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800' },
  canceled:  { label: 'Canceled',      color: 'text-red-400',    bg: 'bg-red-900/30 border-red-800' },
  unpaid:    { label: 'Unpaid',        color: 'text-red-400',    bg: 'bg-red-900/30 border-red-800' },
  incomplete:{ label: 'Incomplete',    color: 'text-gray-400',   bg: 'bg-gray-800 border-gray-700' },
};

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function BillingContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [billing, setBilling]   = useState<BillingStatus | null>(null);
  const [loading, setLoading]   = useState(true);
  const [working, setWorking]   = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    const success  = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success  === 'true') showToast('🎉 Subscription activated! Welcome aboard.', true);
    if (canceled === 'true') showToast('Checkout was canceled. No charge was made.', false);
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get('/billing/status');
      setBilling(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setWorking(true);
    try {
      const res = await api.post('/billing/checkout');
      window.location.href = res.data.url;
    } catch {
      showToast('Failed to start checkout. Please try again.', false);
      setWorking(false);
    }
  };

  const handlePortal = async () => {
    setWorking(true);
    try {
      const res = await api.post('/billing/portal');
      window.location.href = res.data.url;
    } catch {
      showToast('Failed to open billing portal. Please try again.', false);
      setWorking(false);
    }
  };

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );

  const status = billing?.subscriptionStatus || 'trialing';
  const meta   = STATUS_LABELS[status] || STATUS_LABELS['incomplete'];
  const isSubscribed = status === 'active' || status === 'past_due';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 shadow-xl rounded-xl px-4 py-3 text-sm text-white border ${toast.ok ? 'bg-green-900/80 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back */}
        <button onClick={() => router.push('/accountant/dashboard')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Billing &amp; Subscription</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your TaxFlowAI subscription</p>
        </div>

        {/* Status card */}
        <div className={`rounded-2xl border p-6 mb-6 ${meta.bg}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <p className={`text-2xl font-bold ${meta.color}`}>{meta.label}</p>
            </div>
            <div className={`text-xs font-semibold px-3 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
              {status.toUpperCase()}
            </div>
          </div>

          {status === 'trialing' && billing?.trialEndsAt && (
            <p className="text-sm text-gray-300 mt-4">
              Your free trial ends on <span className="font-semibold text-white">{fmt(billing.trialEndsAt)}</span>.
              Subscribe before then to keep access.
            </p>
          )}
          {status === 'active' && billing?.currentPeriodEnd && (
            <p className="text-sm text-gray-300 mt-4">
              Next billing date: <span className="font-semibold text-white">{fmt(billing.currentPeriodEnd)}</span>
            </p>
          )}
          {status === 'past_due' && (
            <p className="text-sm text-yellow-300 mt-4">
              Your payment is past due. Update your payment method to avoid service interruption.
            </p>
          )}
          {(status === 'canceled' || status === 'unpaid') && (
            <p className="text-sm text-red-300 mt-4">
              Your subscription is inactive. Subscribe to add new clients.
            </p>
          )}
        </div>

        {/* Seats card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Active Seats</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{billing?.clientCount ?? 0}</span>
            <span className="text-gray-400 text-sm mb-1">client{billing?.clientCount !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Billed per active client. Seats auto-adjust when you add or remove clients.</p>
        </div>

        {/* Pricing card */}
        {!isSubscribed && (
          <div className="bg-gray-900 rounded-2xl border border-blue-900/50 p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white text-lg">Professional Plan</p>
                <p className="text-sm text-gray-400 mt-1">Everything you need to manage your clients</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-white">$9<span className="text-base font-normal text-gray-400">/client/mo</span></p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {[
                'Unlimited document uploads per client',
                'AI-powered completeness validation',
                'Email notifications & daily digest',
                'Client portal with secure access',
                'Priority support',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isSubscribed ? (
            <button
              onClick={handleCheckout}
              disabled={working}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {working ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
              {working ? 'Redirecting…' : 'Subscribe Now'}
            </button>
          ) : (
            <button
              onClick={handlePortal}
              disabled={working}
              className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl text-sm transition flex items-center justify-center gap-2 border border-gray-700"
            >
              {working ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {working ? 'Redirecting…' : 'Manage Subscription'}
            </button>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Payments are processed securely by Stripe. TaxFlowAI does not store card details.
        </p>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
