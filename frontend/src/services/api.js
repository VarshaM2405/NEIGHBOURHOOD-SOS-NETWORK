import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  timeout: 60000,
});

// Interceptor to always append the latest Firebase ID token
api.interceptors.request.use(async (config) => {
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (api.defaults.headers.common['Authorization']) {
      config.headers.Authorization = api.defaults.headers.common['Authorization'];
    }
  } catch (error) {
    console.warn("Failed to attach auth token", error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
