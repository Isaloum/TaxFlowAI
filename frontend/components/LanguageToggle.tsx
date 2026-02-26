'use client';
import { useT } from '@/lib/i18n';

export default function LanguageToggle() {
  const { lang, setLang } = useT();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
      title={lang === 'en' ? 'Switch to French' : 'Passer en anglais'}
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-600 hover:text-blue-600 select-none"
    >
      {lang === 'en' ? 'FR' : 'EN'}
    </button>
  );
}
