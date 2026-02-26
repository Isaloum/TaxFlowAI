'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';
import { useT } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';

export default function ProfileClient() {
  const params = useParams();
  const router = useRouter();
  const { t } = useT();
  const year = parseInt(params.year as string);

  const [profile, setProfile] = useState({
    // ── Income Sources ─────────────────────────────────────
    has_employment_income:       false,
    has_self_employment:         false,
    has_investment_income:       false,
    has_rental_income:           false,
    has_retirement_income:       false,
    has_ei_rqap:                 false,
    has_social_assistance:       false,
    has_gig_income:              false,
    has_securities_transactions: false,
    // ── Savings & Plans ────────────────────────────────────
    has_rrsp_contributions:      false,
    has_fhsa:                    false,
    // ── Deductions & Credits ───────────────────────────────
    has_childcare_expenses:      false,
    has_tuition:                 false,
    has_student_loans:           false,
    has_medical_expenses:        false,
    has_donations:               false,
    claims_home_office:          false,
    has_moving_expenses:         false,
    has_disability:              false,
    // ── Living Situation ───────────────────────────────────
    is_tenant:                   false,
    // ── Business / Vehicle ─────────────────────────────────
    has_vehicle_for_business:    false,
    // ── Family ────────────────────────────────────────────
    is_married:                  false,
    has_dependents:              false,
    num_children:                0,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadProfile = async () => {
    try {
      const res = await APIClient.getCompleteness(year);
      if (res.data.taxYear?.profile) {
        setProfile(prev => ({ ...prev, ...res.data.taxYear.profile }));
      }
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: string, value: any) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await APIClient.updateProfile(year, profile);
      router.push(`/client/tax-year/${year}`);
    } catch (error: any) {
      setSaveError(error.response?.data?.error || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t('profile.title')} - {year}</h1>
          </div>
          <LanguageToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-6">{t('profile.subtitle')}</p>

          {/* ── Income Sources ────────────────────────────────────── */}
          <fieldset className="border rounded-lg p-4 mb-4">
            <legend className="font-semibold text-lg px-2">{t('profile.section.income')}</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_employment_income} onChange={e => handleChange('has_employment_income', e.target.checked)} />
                <span>Employment income (T4 / RL-1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_self_employment} onChange={e => handleChange('has_self_employment', e.target.checked)} />
                <span>Self-employment / freelance income</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_gig_income} onChange={e => handleChange('has_gig_income', e.target.checked)} />
                <span>Gig economy income (Uber, DoorDash, Airbnb, etc.)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_investment_income} onChange={e => handleChange('has_investment_income', e.target.checked)} />
                <span>Investment income — dividends / interest (T5 / T3)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_securities_transactions} onChange={e => handleChange('has_securities_transactions', e.target.checked)} />
                <span>Sold stocks, crypto, or mutual funds (T5008)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_rental_income} onChange={e => handleChange('has_rental_income', e.target.checked)} />
                <span>Rental income</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_retirement_income} onChange={e => handleChange('has_retirement_income', e.target.checked)} />
                <span>Pension / retirement income (OAS, QPP/CPP, RRIF, RRSP withdrawal)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_ei_rqap} onChange={e => handleChange('has_ei_rqap', e.target.checked)} />
                <span>Employment Insurance (EI) or RQAP / QPIP benefits (T4E / RL-6)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_social_assistance} onChange={e => handleChange('has_social_assistance', e.target.checked)} />
                <span>Social assistance, workers compensation, or CNESST (T5007 / RL-5)</span>
              </label>
            </div>
          </fieldset>

          {/* ── Savings & Plans ───────────────────────────────────── */}
          <fieldset className="border rounded-lg p-4 mb-4">
            <legend className="font-semibold text-lg px-2">{t('profile.section.savings')}</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_rrsp_contributions} onChange={e => handleChange('has_rrsp_contributions', e.target.checked)} />
                <span>RRSP contributions (includes RL-10 from FTQ / CSN)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_fhsa} onChange={e => handleChange('has_fhsa', e.target.checked)} />
                <span>First Home Savings Account (FHSA / T4FHSA / RL-32)</span>
              </label>
            </div>
          </fieldset>

          {/* ── Deductions & Credits ──────────────────────────────── */}
          <fieldset className="border rounded-lg p-4 mb-4">
            <legend className="font-semibold text-lg px-2">{t('profile.section.deductions')}</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_childcare_expenses} onChange={e => handleChange('has_childcare_expenses', e.target.checked)} />
                <span>Childcare expenses (daycare, babysitter receipts)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_tuition} onChange={e => handleChange('has_tuition', e.target.checked)} />
                <span>Post-secondary tuition (T2202 / RL-8)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_student_loans} onChange={e => handleChange('has_student_loans', e.target.checked)} />
                <span>Student loan interest paid in {new Date().getFullYear() - 1}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_medical_expenses} onChange={e => handleChange('has_medical_expenses', e.target.checked)} />
                <span>Medical / dental / vision expenses</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_donations} onChange={e => handleChange('has_donations', e.target.checked)} />
                <span>Charitable donations</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.claims_home_office} onChange={e => handleChange('claims_home_office', e.target.checked)} />
                <span>Home office expenses — employer requires work from home (T2200 / TP-64.3)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_moving_expenses} onChange={e => handleChange('has_moving_expenses', e.target.checked)} />
                <span>Moving expenses (relocated 40+ km for work or school)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_disability} onChange={e => handleChange('has_disability', e.target.checked)} />
                <span>Disability Tax Credit (DTC) — T2201 certificate</span>
              </label>
            </div>
          </fieldset>

          {/* ── Living Situation ──────────────────────────────────── */}
          <fieldset className="border rounded-lg p-4 mb-4">
            <legend className="font-semibold text-lg px-2">{t('profile.section.living')}</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.is_tenant} onChange={e => handleChange('is_tenant', e.target.checked)} />
                <span>Renting your home (required for QC Solidarity Credit — RL-31)</span>
              </label>
            </div>
          </fieldset>

          {/* ── Business / Vehicle ────────────────────────────────── */}
          {profile.has_self_employment && (
            <fieldset className="border rounded-lg p-4 mb-4">
              <legend className="font-semibold text-lg px-2">{t('profile.section.business')}</legend>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={profile.has_vehicle_for_business} onChange={e => handleChange('has_vehicle_for_business', e.target.checked)} />
                  <span>Use a vehicle for business (mileage / vehicle log required)</span>
                </label>
              </div>
            </fieldset>
          )}

          {/* ── Family ───────────────────────────────────────────── */}
          <fieldset className="border rounded-lg p-4 mb-6">
            <legend className="font-semibold text-lg px-2">{t('profile.section.family')}</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.is_married} onChange={e => handleChange('is_married', e.target.checked)} />
                <span>Married or common-law</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_dependents} onChange={e => handleChange('has_dependents', e.target.checked)} />
                <span>Have dependent children</span>
              </label>
              {profile.has_dependents && (
                <div className="ml-6">
                  <label className="block text-sm mb-1">Number of children:</label>
                  <input type="number" min="0" value={profile.num_children}
                    onChange={e => handleChange('num_children', parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded" />
                </div>
              )}
            </div>
          </fieldset>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-2">
              {saveError}
            </div>
          )}
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
