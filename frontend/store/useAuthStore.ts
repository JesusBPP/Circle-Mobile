import { create } from 'zustand';

// 1. Definimos qué datos va a guardar nuestro estado global
interface AuthState {
  token: string | null;
  userName: string;
  negocioName: string;
  sucursalName: string;
  
  // Acciones para modificar el estado
  setToken: (token: string) => void;
  setDashboardData: (user: string, negocio: string, sucursal: string) => void;
  logout: () => void;
}

// 2. Creamos la "caja fuerte" (store)
export const useAuthStore = create<AuthState>((set) => ({
  // Valores iniciales
  token: null,
  userName: 'Cargando...',
  negocioName: 'Cargando...',
  sucursalName: '...',

  // Funciones para actualizar los valores
  setToken: (token) => set({ token }),
  
  setDashboardData: (userName, negocioName, sucursalName) => set({ 
    userName, 
    negocioName, 
    sucursalName 
  }),
  
  logout: () => set({ 
    token: null, 
    userName: '', 
    negocioName: '', 
    sucursalName: '' 
  }),
}));