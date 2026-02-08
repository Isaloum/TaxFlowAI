// User and Authentication Types

export interface User {
  id: string;
  email: string;
  firmName: string;
  phone: string;
  languagePref: 'en' | 'fr';
  role: 'accountant';
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string; // Only used in form, not sent to API
  firmName: string;
  phone: string;
  languagePref: 'en' | 'fr';
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
