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

  static async getProfile() {
    return api.get('/users/client/profile');
  }

  static async getCompleteness(year: number) {
    return api.get(`/users/client/tax-years/${year}/completeness`);
  }

  static async uploadDocument(year: number, formData: FormData) {
    return api.post(`/users/client/tax-years/${year}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    return api.get('/users/accountant/clients');
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
}

export default api;
