import { apiClient } from '../../api/apiClient';

interface QRTokenData {
  token_qr: string;
  expira_en_segundos: number;
}

interface CanjeResponseData {
  mensaje: string;
  id_uso: number;
  titulo_oferta: string;
  descuento_aplicado: string;
}

const lealtadService = {
  
  // 🌟 NUEVO: Obtener todo el contexto del Dashboard
  obtenerDashboard: async (idNegocio: number) => {
    try {
      const response = await apiClient.get(`/lealtad/negocios/${idNegocio}/dashboard`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al cargar el Motor de Lealtad.');
    }
  },

  // 🌟 NUEVO: Crear Oferta
  crearOferta: async (idNegocio: number, payload: any) => {
    try {
      const response = await apiClient.post(`/lealtad/negocios/${idNegocio}/ofertas`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al guardar la oferta comercial.');
    }
  },

  // 🌟 NUEVO: Crear Publicación
  crearPublicacion: async (idNegocio: number, payload: any) => {
    try {
      const response = await apiClient.post(`/lealtad/negocios/${idNegocio}/publicaciones`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al lanzar la publicación al feed.');
    }
  },

  generarTokenQR: async (idOferta: number): Promise<QRTokenData> => {
    try {
      const response = await apiClient.get<QRTokenData>(`/lealtad/ofertas/${idOferta}/generar-token-qr`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('No se pudo establecer conexión con el motor de lealtad.');
    }
  },

  canjearQR: async (tokenQr: string, idTransaccion: number): Promise<CanjeResponseData> => {
    try {
      const response = await apiClient.post<CanjeResponseData>('/lealtad/ofertas/canjear-qr', {
        token_qr: tokenQr,
        id_transaccion: idTransaccion
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Error al procesar el canje promocional en el punto de venta.');
    }
  }
};

export default lealtadService;