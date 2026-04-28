import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const IP_COMPUTADORA = '10.0.2.2'; 
// 🌟 REGLA DE ORO: La URL Base siempre debe terminar en diagonal
const BACKEND_URL = `http://${IP_COMPUTADORA}:8000/api/`;

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});