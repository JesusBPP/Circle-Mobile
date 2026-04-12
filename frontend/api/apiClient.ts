import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// ⚠️ IMPORTANTE PARA EL EMULADOR DE ANDROID STUDIO: 
const IP_COMPUTADORA = '10.0.2.2'; // <-- IP mágica para el emulador de Android
const BACKEND_URL = `http://${IP_COMPUTADORA}:8000/api`;

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🌟 INTERCEPTOR DE PETICIONES
// Antes de que la petición salga hacia el backend, ejecuta esto:
apiClient.interceptors.request.use((config) => {
  // Leemos el token actual desde nuestro store global
  const token = useAuthStore.getState().token;
  
  // Si hay token, lo adjuntamos como "Bearer Token"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});