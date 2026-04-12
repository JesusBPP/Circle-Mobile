import { apiClient } from '../../api/apiClient';

// Esta función recibirá el correo y contraseña desde el botón de login.tsx
export const loginUser = async (correo: string, contrasena: string) => {
  try {
    // Hace una petición POST a http://tu-ip:8000/api/auth/login
    const response = await apiClient.post('/auth/login', {
      correo: correo,
      contrasena: contrasena,
    });
    
    // 🌟 Si la API responde con éxito, devolvemos los datos.
    // Esto incluye: access_token, id_usuario, nombre y es_admin
    return response.data;

  } catch (error: any) {
    // Si la API falla (ej. contraseña incorrecta), atrapamos el error
    console.error("Error en authService:", error.response?.data || error.message);
    
    // Lanzamos el error hacia arriba para que login.tsx pueda mostrar una alerta
    throw new Error(error.response?.data?.detail || "Error de conexión con el servidor");
  }
};