import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class APIClient {
  static async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
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
    docType: string; filename: string; mimeType: string; fileSize: number; docSubtype?: string;
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

  static async submitForReview(year: number) {
    return api.post(`/users/client/tax-years/${year}/submit`);
  }
}

export default api;
