import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

// Importamos los componentes reales desde su carpeta correcta
import ConfigNegocio from '../../components/Config/configNegocio';
import ConfigAdmin from '../../components/Config/configAdmin';

export default function ConfigTab() {
  
  // 🌟 Extraemos también el token
  const { userName, token } = useAuthStore();
  
  // 🛡️ ESCUDO DE SEGURIDAD:
  // Si la sesión se está cerrando, detenemos el renderizado.
  if (!token) {
    return null;
  }

  // Verificamos si es administrador
  const isAdmin = userName.toLowerCase().includes('admin');

  // Patrón Switch: Renderiza el componente según el rol
  if (isAdmin) {
    return <ConfigAdmin />;
  }

  return <ConfigNegocio />;
}