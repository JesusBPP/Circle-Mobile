import { apiClient } from '../../api/apiClient';
import { useAuthStore } from '../../store/useAuthStore';

export const loginUser = async (correo: string, contrasena: string) => {
  try {
    const response = await apiClient.post('auth/login', {
      correo: correo,
      contrasena: contrasena,
    });
    
    const { access_token, refresh_token } = response.data;
    
    useAuthStore.getState().setToken(access_token);
    useAuthStore.getState().setRefreshToken(refresh_token);
    
    return response.data;

  } catch (error: any) {
    console.error("Error en authService:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Error de conexión con el servidor");
  }
};
