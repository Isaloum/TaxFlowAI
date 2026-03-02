import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://api.isaloumapps.com/api';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
