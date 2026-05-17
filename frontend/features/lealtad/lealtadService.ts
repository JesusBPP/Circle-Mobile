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

/**
 * SERVICIO CAPA DE RED: MÓDULO DE LEALTAD Y BENEFICIOS QR
 * Centraliza la comunicación HTTP de promociones con FastAPI de manera limpia y tipada.
 */
const lealtadService = {
  /**
   * Genera el token JWT firmado de corta duración para renderizar el QR del Consumidor
   * @param idOferta Identificador único de la oferta promocional o recompensa
   */
  generarTokenQR: async (idOferta: number): Promise<QRTokenData> => {
    try {
      const response = await apiClient.get<QRTokenData>(`/api/lealtad/ofertas/${idOferta}/generar-token-qr`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('No se pudo establecer conexión con el motor de lealtad.');
    }
  },

  /**
   * Envía el token QR escaneado por el establecimiento para validar y efectuar el cobro con descuento
   * @param tokenQr Cadena de texto JWT leída de la cámara
   * @param idTransaccion ID de la venta en curso en la sucursal
   */
  canjearQR: async (tokenQr: string, idTransaccion: number): Promise<CanjeResponseData> => {
    try {
      const response = await apiClient.post<CanjeResponseData>('/api/lealtad/ofertas/canjear-qr', {
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