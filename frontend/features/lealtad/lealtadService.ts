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

interface ServicioDisponible {
  id: number;
  nombre: string;
  costo: number;
  tipo_producto: string;
}

interface ComentarioData {
  id: number;
  id_publicacion: number | null;
  id_oferta: number | null;
  id_usuario_consumidor: number;
  texto_comentario: string;
  fecha_comentario: string;
  esta_oculto: boolean;
}

const lealtadService = {
  
  /** Obtiene el dashboard completo del negocio: métricas, ofertas con reglas y publicaciones. */
  obtenerDashboard: async (idNegocio: number) => {
    try {
      const response = await apiClient.get(`/lealtad/negocios/${idNegocio}/dashboard`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al cargar el Motor de Lealtad.');
    }
  },

  /** Crea una oferta con sus reglas NxN (requisitos + recompensas) y whitelist opcional. */
  crearOferta: async (idNegocio: number, payload: any) => {
    try {
      const response = await apiClient.post(`/lealtad/negocios/${idNegocio}/ofertas`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al guardar la oferta comercial.');
    }
  },

  /** Publica un anuncio en el feed del negocio, opcionalmente vinculado a una oferta. */
  crearPublicacion: async (idNegocio: number, payload: any) => {
    try {
      const response = await apiClient.post(`/lealtad/negocios/${idNegocio}/publicaciones`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al lanzar la publicación al feed.');
    }
  },

  /** Actualiza textos o estado (activa/pausada/finalizada) de una oferta existente. */
  actualizarOferta: async (idOferta: number, payload: { titulo?: string; descripcion?: string; estado?: string }) => {
    try {
      const response = await apiClient.put(`/lealtad/ofertas/${idOferta}`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al actualizar la oferta.');
    }
  },

  /** Actualiza textos o permisos de comentarios de una publicación existente. */
  actualizarPublicacion: async (idPublicacion: number, payload: { titulo?: string; descripcion?: string; habilitar_comentarios?: boolean }) => {
    try {
      const response = await apiClient.put(`/lealtad/publicaciones/${idPublicacion}`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al actualizar la publicación.');
    }
  },

  /** Elimina permanentemente una oferta (solo si no tiene canjes registrados). */
  eliminarOferta: async (idOferta: number) => {
    try {
      const response = await apiClient.delete(`/lealtad/ofertas/${idOferta}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al eliminar la oferta.');
    }
  },

  /** Elimina permanentemente una publicación del feed. */
  eliminarPublicacion: async (idPublicacion: number) => {
    try {
      const response = await apiClient.delete(`/lealtad/publicaciones/${idPublicacion}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al eliminar la publicación.');
    }
  },

  /** Lista todos los comentarios visibles de una publicación, ordenados por fecha DESC. */
  obtenerComentariosPublicacion: async (idPublicacion: number): Promise<ComentarioData[]> => {
    try {
      const response = await apiClient.get<ComentarioData[]>(`/lealtad/publicaciones/${idPublicacion}/comentarios`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al cargar los comentarios de la publicación.');
    }
  },

  /** Lista todos los comentarios visibles de una oferta, ordenados por fecha DESC. */
  obtenerComentariosOferta: async (idOferta: number): Promise<ComentarioData[]> => {
    try {
      const response = await apiClient.get<ComentarioData[]>(`/lealtad/ofertas/${idOferta}/comentarios`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al cargar los comentarios de la oferta.');
    }
  },

  /** Crea un comentario en una publicación o en una oferta (arco exclusivo). */
  crearComentario: async (payload: { id_publicacion?: number; id_oferta?: number; texto_comentario: string }): Promise<ComentarioData> => {
    try {
      const response = await apiClient.post<ComentarioData>('/lealtad/comentarios', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al crear el comentario.');
    }
  },

  /** Oculta un comentario del feed (soft delete) sin borrarlo de la BD. */
  ocultarComentario: async (idComentario: number) => {
    try {
      const response = await apiClient.delete(`/lealtad/comentarios/${idComentario}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al ocultar el comentario.');
    }
  },

  /** Obtiene las reglas del programa de lealtad del negocio (puntos por peso, visitas, etc). */
  obtenerConfiguracionLealtad: async (idNegocio: number) => {
    try {
      const response = await apiClient.get(`/lealtad/negocios/${idNegocio}/configuracion-lealtad`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al cargar la configuración de lealtad.');
    }
  },

  /** Obtiene la lista de productos y servicios disponibles del negocio para el selector de reglas NxN. */
  obtenerServiciosDisponibles: async (idNegocio: number): Promise<ServicioDisponible[]> => {
    try {
      const response = await apiClient.get<ServicioDisponible[]>(`/lealtad/negocios/${idNegocio}/catalogo-disponible`);
      return response.data;
    } catch (error: any) {
      console.error('Error al cargar catálogo disponible:', error);
      return [];
    }
  },

  /** Obtiene todos los consumidores afiliados al negocio (con cartera de lealtad), ordenados alfabéticamente. */
  obtenerConsumidoresAfiliados: async (idNegocio: number): Promise<Array<{id: number, nombre: string, correo: string}>> => {
    try {
      const response = await apiClient.get(`/lealtad/negocios/${idNegocio}/consumidores-afiliados`);
      return response.data;
    } catch (error: any) {
      console.error('Error al cargar consumidores afiliados:', error);
      return [];
    }
  },

  /** Obtiene todas las sucursales del negocio para el selector de ofertas. */
  obtenerSucursales: async (idNegocio: number): Promise<Array<{id: number, nombre: string, ciudad: string, estado: string}>> => {
    try {
      const response = await apiClient.get(`/lealtad/negocios/${idNegocio}/sucursales`);
      return response.data;
    } catch (error: any) {
      console.error('Error al cargar sucursales:', error);
      return [];
    }
  },

  /** Actualiza las reglas del programa de lealtad del negocio. */
  actualizarConfiguracionLealtad: async (idNegocio: number, payload: any) => {
    try {
      const response = await apiClient.put(`/lealtad/negocios/${idNegocio}/configuracion-lealtad`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al actualizar la configuración de lealtad.');
    }
  },

  /** Genera un token JWT de corta duración para renderizar un código QR de canje. */
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

  /** Desencripta el QR, audita los límites y efectúa la redención en el POS. */
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
