'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
                T
              </div>
              <span className="text-xl font-bold text-gray-900">TaxFlowAI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {user?.email}
              </div>
              <button
                onClick={logout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.firmName || 'User'}!
            </h1>
            <p className="mt-2 text-gray-600">
              This is your TaxFlowAI dashboard. More features coming soon!
            </p>
          </div>

          {/* User Info Card */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="font-medium text-gray-900">{user?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Firm Name:</dt>
                  <dd className="font-medium text-gray-900">{user?.firmName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Phone:</dt>
                  <dd className="font-medium text-gray-900">{user?.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Language:</dt>
                  <dd className="font-medium text-gray-900">
                    {user?.languagePref === 'fr' ? 'Français' : 'English'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Role:</dt>
                  <dd className="font-medium text-gray-900 capitalize">{user?.role}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Active Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Completed Returns</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Account created</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Add your first client</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">○</span>
                  <span>Complete a tax return</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
