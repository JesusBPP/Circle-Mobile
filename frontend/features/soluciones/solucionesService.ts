import { apiClient } from '../../api/apiClient';

export const solucionesService = {
  
  instalarSolucion: async (id_negocio: number, id_solucion: number) => {
    try {
      const response = await apiClient.post('/negocios/soluciones/instalar', {
        id_negocio: id_negocio,
        id_solucion: id_solucion
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail || "Error al instalar la solución.");
      }
      throw new Error("Error de conexión con el servidor.");
    }
  },

  obtenerSoluciones: async (id_negocio: number) => {
    try {
      const response = await apiClient.get(`/negocios/${id_negocio}/soluciones`);
      return response.data;
    } catch (error: any) {
      throw new Error("Error al cargar las soluciones instaladas desde el servidor.");
    }
  },

  // 🌟 NUEVA FUNCIÓN: Petición HTTP DELETE
  desinstalarSolucion: async (id_negocio: number, id_solucion: number) => {
    try {
      const response = await apiClient.delete(`/negocios/${id_negocio}/soluciones/${id_solucion}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail || "Error al desinstalar la solución.");
      }
      throw new Error("Error de conexión con el servidor.");
    }
  }

};