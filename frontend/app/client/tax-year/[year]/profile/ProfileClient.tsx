'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

export default function ProfileClient() {
  const params = useParams();
  const router = useRouter();
  const year = parseInt(params.year as string);

  const [profile, setProfile] = useState({
    has_employment_income: false,
    has_self_employment: false,
    has_investment_income: false,
    has_rental_income: false,
    has_rrsp_contributions: false,
    has_childcare_expenses: false,
    has_tuition: false,
    has_medical_expenses: false,
    has_donations: false,
    claims_home_office: false,
    has_moving_expenses: false,
    is_married: false,
    has_dependents: false,
    num_children: 0
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
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">Tax Profile - {year}</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-6">Help us determine what documents you need to upload.</p>

          <fieldset className="border rounded-lg p-4 mb-4">
            <legend className="font-semibold text-lg px-2">Income Sources</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_employment_income} onChange={(e) => handleChange('has_employment_income', e.target.checked)} />
                <span>Employment income (T4/RL-1)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_self_employment} onChange={(e) => handleChange('has_self_employment', e.target.checked)} />
                <span>Self-employment (T2125)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_investment_income} onChange={(e) => handleChange('has_investment_income', e.target.checked)} />
                <span>Investment income (T5/T3)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_rental_income} onChange={(e) => handleChange('has_rental_income', e.target.checked)} />
                <span>Rental income</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4 mb-4">
            <legend className="font-semibold text-lg px-2">Deductions &amp; Credits</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_rrsp_contributions} onChange={(e) => handleChange('has_rrsp_contributions', e.target.checked)} />
                <span>RRSP contributions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_childcare_expenses} onChange={(e) => handleChange('has_childcare_expenses', e.target.checked)} />
                <span>Childcare expenses</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_tuition} onChange={(e) => handleChange('has_tuition', e.target.checked)} />
                <span>Tuition (T2202/RL-8)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_medical_expenses} onChange={(e) => handleChange('has_medical_expenses', e.target.checked)} />
                <span>Medical expenses</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_donations} onChange={(e) => handleChange('has_donations', e.target.checked)} />
                <span>Charitable donations</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.claims_home_office} onChange={(e) => handleChange('claims_home_office', e.target.checked)} />
                <span>Home office (T2200)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_moving_expenses} onChange={(e) => handleChange('has_moving_expenses', e.target.checked)} />
                <span>Moving expenses</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4 mb-6">
            <legend className="font-semibold text-lg px-2">Family</legend>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.is_married} onChange={(e) => handleChange('is_married', e.target.checked)} />
                <span>Married/Common-law</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={profile.has_dependents} onChange={(e) => handleChange('has_dependents', e.target.checked)} />
                <span>Have dependents</span>
              </label>
              {profile.has_dependents && (
                <div className="ml-6">
                  <label className="block text-sm mb-1">Number of children:</label>
                  <input type="number" min="0" value={profile.num_children} onChange={(e) => handleChange('num_children', parseInt(e.target.value) || 0)}
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
            {saving ? 'Saving...' : 'Save & Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}
