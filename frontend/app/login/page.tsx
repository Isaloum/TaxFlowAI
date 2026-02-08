'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Sign In',
      subtitle: 'Access your TaxFlowAI account',
      email: 'Email Address',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register here',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      invalidEmail: 'Please enter a valid email address',
    },
    fr: {
      title: 'Se Connecter',
      subtitle: 'Accédez à votre compte TaxFlowAI',
      email: 'Adresse Email',
      password: 'Mot de Passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié?',
      signIn: 'Se Connecter',
      noAccount: "Vous n'avez pas de compte?",
      register: 'Inscrivez-vous ici',
      emailRequired: "L'email est requis",
      passwordRequired: 'Le mot de passe est requis',
      invalidEmail: 'Veuillez entrer une adresse email valide',
    },
  };

  const t = translations[language];

  const validateForm = () => {
    if (!formData.email) {
      setError(t.emailRequired);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t.invalidEmail);
      return false;
    }
    if (!formData.password) {
      setError(t.passwordRequired);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          {language === 'en' ? '🇫🇷 Français' : '🇬🇧 English'}
        </button>
      </div>

      <div className="flex w-full items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-blue-600">TaxFlowAI</h1>
            <p className="mt-2 text-gray-600">{t.subtitle}</p>
          </div>

          {/* Login Form */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">{t.title}</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{t.rememberMe}</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  {t.forgotPassword}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {t.signIn}...
                  </span>
                ) : (
                  t.signIn
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {t.noAccount}{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
                {t.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
