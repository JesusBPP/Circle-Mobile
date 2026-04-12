import { apiClient } from '../../api/apiClient';

export const homeService = {
  
  // Función para obtener la data del usuario dueño
  getDashboardInfo: async () => {
    try {
      // 🚀 Hacemos la petición GET al backend (la ruta la crearemos luego en FastAPI)
      const response = await apiClient.get('/usuarios/me/dashboard');
      return response.data;
    } catch (error) {
      console.error("Error obteniendo datos del dashboard:", error);
      throw error; // Lanza el error para que el componente lo maneje
    }
  }

};