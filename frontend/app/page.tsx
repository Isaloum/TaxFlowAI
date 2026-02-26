'use client';

import { useT } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';

export default function LandingPage() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TaxFlowAI</h1>
          <div className="space-x-4 flex items-center">
            <a href="/login" className="text-gray-700 hover:text-indigo-600">{t('common.login')}</a>
            <a href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              {t('common.getStarted')}
            </a>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('home.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          <a href="/login" className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700">
            {t('common.startTrial')}
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">{t('home.feature1.title')}</h3>
            <p className="text-gray-600">{t('home.feature1.desc')}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">{t('home.feature2.title')}</h3>
            <p className="text-gray-600">{t('home.feature2.desc')}</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">{t('home.feature3.title')}</h3>
            <p className="text-gray-600">{t('home.feature3.desc')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
