import { create } from 'zustand';

// 🌟 Definimos la estructura de una herramienta instalada
export interface Herramienta {
  id: number; // 🌟 AÑADIDO: Vital para poder decirle al backend cuál borrar
  nombre: string;
  ruta: string;
  icono: string; 
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userName: string;
  negocioName: string;
  sucursalName: string;
  negocioId: number | null; 
  herramientasActivas: Herramienta[];
  
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setDashboardData: (user: string, negocio: string, sucursal: string, negocioId: number) => void;
  setHerramientas: (herramientas: Herramienta[]) => void;
  addHerramienta: (herramienta: Herramienta) => void;
  
  // 🌟 NUEVA ACCIÓN: Elimina una herramienta de la RAM al instante
  removeHerramienta: (id_solucion: number) => void;
  
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  userName: 'Cargando...',
  negocioName: 'Cargando...',
  sucursalName: '...',
  negocioId: null, 
  herramientasActivas: [], 

  setToken: (token) => set({ token }),
  
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  
  setDashboardData: (userName, negocioName, sucursalName, negocioId) => set({ 
    userName, negocioName, sucursalName, negocioId 
  }),

  setHerramientas: (herramientas) => set({ herramientasActivas: herramientas }),

  addHerramienta: (herramienta) => set((state) => {
    const yaExiste = state.herramientasActivas.some(h => h.id === herramienta.id);
    if (yaExiste) return state; 
    return { herramientasActivas: [...state.herramientasActivas, herramienta] };
  }),

  // 🌟 FILTRAMOS EL ARREGLO PARA SACAR LA HERRAMIENTA BORRADA
  removeHerramienta: (id_solucion) => set((state) => ({
    herramientasActivas: state.herramientasActivas.filter(h => h.id !== id_solucion)
  })),
  
  logout: () => set({ 
    token: null, 
    refreshToken: null,
    userName: '', 
    negocioName: '', 
    sucursalName: '', 
    negocioId: null, 
    herramientasActivas: [] 
  }),
}));