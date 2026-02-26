import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Role-specific keys prevent token collision when both tabs are open
function getTokenForUrl(url?: string): string | null {
  if (typeof window === 'undefined') return null;
  const apiPath = url || '';
  const pagePath = window.location.pathname;

  // Accountant API endpoints — always use accountant token
  if (apiPath.includes('/accountant/') || apiPath.includes('/users/accountant/')) {
    return localStorage.getItem('auth_token_accountant')
      || localStorage.getItem('auth_token');
  }
  // Client API endpoints — always use client token
  if (apiPath.includes('/client/') || apiPath.includes('/users/client/')) {
    return localStorage.getItem('auth_token_client')
      || localStorage.getItem('auth_token');
  }

  // Shared endpoints (/documents/, /auth/, etc.)
  // Use the PAGE URL to decide which role is making the call
  if (pagePath.includes('/accountant/')) {
    return localStorage.getItem('auth_token_accountant')
      || localStorage.getItem('auth_token');
  }
  if (pagePath.includes('/client/')) {
    return localStorage.getItem('auth_token_client')
      || localStorage.getItem('auth_token');
  }

  // Final fallback (login page, etc.)
  return localStorage.getItem('auth_token_accountant')
    || localStorage.getItem('auth_token_client')
    || localStorage.getItem('auth_token');
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getTokenForUrl(config.url);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class APIClient {
  static async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const role: string = res.data.user?.role ?? 'client';
    // Store under role-specific key so accountant + client tabs don't collide
    localStorage.setItem(`auth_token_${role}`, res.data.token);
    localStorage.setItem(`auth_user_${role}`, JSON.stringify(res.data.user));
    // Keep legacy key for any code that still reads it (will be cleaned up below)
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    return res.data;
  }

  static async register(data: any) {
    return api.post('/auth/register', data);
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  }

  static async getProfile() {
    return api.get('/users/client/profile');
  }

  static async getCompleteness(year: number) {
    return api.get(`/users/client/tax-years/${year}/completeness`);
  }

  // Step 1: get signed URL from Lambda (JSON only — no binary through API Gateway)
  static async presignUpload(year: number, meta: {
    docType: string; filename: string; mimeType: string; fileSize: number; docSubtype?: string; ownerName?: string;
  }) {
    return api.post(`/documents/tax-years/${year}/presign`, meta);
  }

  // Step 2: upload file directly to Supabase (bypasses API Gateway entirely)
  static async uploadToSignedUrl(signedUrl: string, file: File) {
    return fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  }

  // Step 3: tell Lambda the upload is done — triggers processing
  static async confirmUpload(documentId: string) {
    return api.post(`/documents/documents/${documentId}/confirm`);
  }

  static async updateProfile(year: number, profile: any) {
    return api.put(`/users/client/tax-years/${year}/profile`, { profile });
  }

  static async createClient(data: {
    email: string;
    firstName: string;
    lastName: string;
    province: string;
    phone?: string;
    languagePref: 'en' | 'fr';
  }) {
    return api.post('/users/accountant/clients', data);
  }

  static async getAccountantClients() {
    return api.get('/users/accountant/clients-with-tax-years');
  }

  static async getClientById(clientId: string) {
    return api.get(`/users/accountant/clients/${clientId}`);
  }

  static async getClientTaxYears(clientId: string) {
    return api.get(`/users/accountant/clients/${clientId}/years`);
  }

  static async getTaxYearDetails(taxYearId: string) {
    return api.get(`/users/accountant/tax-years/${taxYearId}`);
  }

  static async approveDocument(docId: string) {
    return api.post(`/users/accountant/documents/${docId}/approve`);
  }

  static async rejectDocument(docId: string, reason: string) {
    return api.post(`/users/accountant/documents/${docId}/reject`, { reason });
  }

  static async getDocumentDownload(docId: string) {
    return api.get(`/users/accountant/documents/${docId}/download`);
  }

  static async resetDocument(docId: string) {
    return api.post(`/users/accountant/documents/${docId}/reset`);
  }

  static async rescanDocument(docId: string) {
    return api.post(`/users/accountant/documents/${docId}/rescan`);
  }

  static async submitForReview(year: number) {
    return api.post(`/users/client/tax-years/${year}/submit`);
  }

  static async markAsComplete(taxYearId: string) {
    return api.post(`/users/accountant/tax-years/${taxYearId}/complete`);
  }

  static async reopenTaxYear(taxYearId: string) {
    return api.post(`/users/accountant/tax-years/${taxYearId}/reopen`);
  }

  static async deleteDocument(documentId: string) {
    return api.delete(`/documents/${documentId}`);
  }

  static async updateTaxYearNotes(taxYearId: string, notes: string) {
    return api.patch(`/users/accountant/tax-years/${taxYearId}/notes`, { notes });
  }
}

export default api;
