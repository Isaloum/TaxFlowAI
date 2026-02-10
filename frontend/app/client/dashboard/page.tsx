'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';

export default function ClientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await APIClient.getProfile();
      setProfile(res.data);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">TaxFlowAI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {profile?.firstName}</span>
            <button onClick={() => {
              localStorage.removeItem('auth_token');
              router.push('/login');
            }} className="text-red-600 hover:text-red-700">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">My Tax Years</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[currentYear, currentYear - 1, currentYear - 2].map(year => (
            <div key={year} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                 onClick={() => router.push(`/client/tax-year/${year}`)}>
              <h3 className="text-xl font-bold mb-2">Tax Year {year}</h3>
              <p className="text-gray-600 mb-4">Click to upload documents</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Open {year}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
