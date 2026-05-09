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

  obtenerServiciosNegocio: async (id_negocio: number) => {
    try {
      const response = await apiClient.get(`/agenda/negocios/${id_negocio}/servicios`);
      return response.data;
    } catch (error: any) {
      console.log("No se pudieron cargar los servicios", error);
      return [];
    }
  },

  // 🌟 NUEVOS SERVICIOS PARA CRM
  buscarConsumidores: async (id_negocio: number, query: string) => {
    try {
      const response = await apiClient.get(`/agenda/negocios/${id_negocio}/consumidores/buscar?q=${query}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  vincularConsumidor: async (id_cita: number, id_usuario_consumidor: number) => {
    try {
      const response = await apiClient.post(`/agenda/citas/${id_cita}/consumidores`, { id_usuario_consumidor });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Error al vincular el cliente.";
      throw new Error(msg);
    }
  },

  obtenerHistorialConsumidor: async (id_negocio: number, id_consumidor: number) => {
    try {
      const response = await apiClient.get(`/agenda/negocios/${id_negocio}/consumidores/${id_consumidor}/historial`);
      return response.data;
    } catch (error: any) {
      throw new Error("Error al cargar el historial del cliente.");
    }
  }
};