'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firmName: '',
    phone: '',
    languagePref: 'en' as 'en' | 'fr',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Create Account',
      subtitle: 'Join TaxFlowAI as an accountant',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firmName: 'Firm Name',
      phone: 'Phone Number',
      languagePref: 'Preferred Language',
      english: 'English',
      french: 'French',
      register: 'Register',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in here',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordMin: 'Password must be at least 8 characters',
      passwordMatch: 'Passwords must match',
      firmNameRequired: 'Firm name is required',
      phoneRequired: 'Phone number is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid Canadian phone number',
      passwordStrength: 'Password Strength:',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
    },
    fr: {
      title: 'Créer un Compte',
      subtitle: 'Rejoignez TaxFlowAI en tant que comptable',
      email: 'Adresse Email',
      password: 'Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      firmName: 'Nom du Cabinet',
      phone: 'Numéro de Téléphone',
      languagePref: 'Langue Préférée',
      english: 'Anglais',
      french: 'Français',
      register: "S'inscrire",
      haveAccount: 'Vous avez déjà un compte?',
      signIn: 'Connectez-vous ici',
      emailRequired: "L'email est requis",
      passwordRequired: 'Le mot de passe est requis',
      passwordMin: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordMatch: 'Les mots de passe doivent correspondre',
      firmNameRequired: 'Le nom du cabinet est requis',
      phoneRequired: 'Le numéro de téléphone est requis',
      invalidEmail: 'Veuillez entrer une adresse email valide',
      invalidPhone: 'Veuillez entrer un numéro de téléphone canadien valide',
      passwordStrength: 'Force du Mot de Passe:',
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
    },
  };

  const t = translations[language];

  // Password strength checker
  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 8) return { strength: t.weak, color: 'text-red-600' };
    
    let score = 0;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    if (score < 2) return { strength: t.weak, color: 'text-red-600' };
    if (score < 3) return { strength: t.medium, color: 'text-yellow-600' };
    return { strength: t.strong, color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 8) {
      newErrors.password = t.passwordMin;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordMatch;
    }

    if (!formData.firmName) {
      newErrors.firmName = t.firmNameRequired;
    }

    if (!formData.phone) {
      newErrors.phone = t.phoneRequired;
    } else if (!/^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = t.invalidPhone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firmName: formData.firmName,
        phone: formData.phone,
        languagePref: formData.languagePref,
      });
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
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

      <div className="flex w-full items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-blue-600">TaxFlowAI</h1>
            <p className="mt-2 text-gray-600">{t.subtitle}</p>
          </div>

          {/* Register Form */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">{t.title}</h2>

            {errors.general && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                {errors.general}
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
                  className={`w-full rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Firm Name */}
              <div>
                <label htmlFor="firmName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.firmName}
                </label>
                <input
                  id="firmName"
                  type="text"
                  value={formData.firmName}
                  onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                  className={`w-full rounded-lg border ${
                    errors.firmName ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  placeholder="Your Firm Name"
                />
                {errors.firmName && <p className="mt-1 text-sm text-red-600">{errors.firmName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phone}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  placeholder="(514) 555-1234"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
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
                    className={`w-full rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
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
                {formData.password && (
                  <p className={`mt-1 text-sm ${passwordStrength.color}`}>
                    {t.passwordStrength} {passwordStrength.strength}
                  </p>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Language Preference */}
              <div>
                <label htmlFor="languagePref" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.languagePref}
                </label>
                <select
                  id="languagePref"
                  value={formData.languagePref}
                  onChange={(e) => setFormData({ ...formData, languagePref: e.target.value as 'en' | 'fr' })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="en">{t.english}</option>
                  <option value="fr">{t.french}</option>
                </select>
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
                    {t.register}...
                  </span>
                ) : (
                  t.register
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {t.haveAccount}{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                {t.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
