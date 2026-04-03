import axios from 'axios';

// ⚠️ IMPORTANTE PARA EL EMULADOR DE ANDROID STUDIO: 
// 10.0.2.2 es la IP especial que usa el emulador de Android para acceder al 'localhost' de tu computadora física.
// Si en el futuro vuelves a probar con tu teléfono físico y Expo Go, tendrás que volver a cambiar esto por tu IP del WiFi (ej. 192.168.1.146).

const IP_COMPUTADORA = '10.0.2.2'; // <-- IP mágica para el emulador de Android
const BACKEND_URL = `http://${IP_COMPUTADORA}:8000/api`;

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Más adelante, aquí agregaremos un "interceptor" que inyectará automáticamente
// tu token de seguridad (JWT) en cada petición.