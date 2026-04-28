import { apiClient } from '../../api/apiClient';

export const loginUser = async (correo: string, contrasena: string) => {
  try {
    // 🌟 REGLA DE ORO: Las rutas relativas NO empiezan con diagonal
    const response = await apiClient.post('auth/login', {
      correo: correo,
      contrasena: contrasena,
    });
    
    return response.data;

  } catch (error: any) {
    console.error("Error en authService:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Error de conexión con el servidor");
  }
};