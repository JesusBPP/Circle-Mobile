import { apiClient } from '../../api/apiClient';

export const agendaService = {
  obtenerCitas: async (id_negocio: number) => {
    try {
      const response = await apiClient.get(`/agenda/negocios/${id_negocio}/citas`);
      return response.data;
    } catch (error: any) {
      throw new Error("Error al cargar las citas del servidor.");
    }
  },
  
  crearCita: async (id_negocio: number, citaData: any) => {
    try {
      const response = await apiClient.post(`/agenda/negocios/${id_negocio}/citas`, citaData);
      return response.data;
    } catch (error: any) {
      // 🌟 Atrapamos el error de EMPALME que envía el Backend
      const msg = error.response?.data?.detail || "Error al crear la actividad.";
      throw new Error(msg);
    }
  },

  obtenerCitaPorId: async (id_cita: number) => {
    try {
      const response = await apiClient.get(`/agenda/citas/${id_cita}`);
      return response.data;
    } catch (error: any) {
      throw new Error("Error al cargar los detalles.");
    }
  },

  actualizarCita: async (id_cita: number, datosActualizados: any) => {
    try {
      const response = await apiClient.put(`/agenda/citas/${id_cita}`, datosActualizados);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Error al actualizar la cita.";
      throw new Error(msg);
    }
  },

  // 🌟 NUEVO: Obtenemos el catálogo de servicios
  obtenerServiciosNegocio: async (id_negocio: number) => {
    try {
      const response = await apiClient.get(`/agenda/negocios/${id_negocio}/servicios`);
      return response.data;
    } catch (error: any) {
      console.log("No se pudieron cargar los servicios", error);
      return [];
    }
  }
};