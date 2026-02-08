// API Client for TaxFlowAI Backend

import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();
  
  if (!response.ok) {
    const error = (data as any)?.message || data || 'An error occurred';
    throw new Error(error);
  }
  
  return data as T;
}

// Register new accountant
export async function registerAccountant(
  data: Omit<RegisterData, 'confirmPassword'>
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register-accountant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return handleResponse<AuthResponse>(response);
}

// Login existing user
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });
  
  return handleResponse<AuthResponse>(response);
}

// Get current user profile
export async function getProfile(): Promise<User> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return handleResponse<User>(response);
}

// Update user profile
export async function updateProfile(data: Partial<User>): Promise<User> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  return handleResponse<User>(response);
}
