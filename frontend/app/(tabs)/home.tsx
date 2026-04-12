import React from 'react';
// Importamos nuestros dos dashboards creados
import HomeNegocio from '../../components/Home/homeNegocio';
import HomeAdmin from '../../components/Home/homeAdmin';

// Importamos Zustand para saber quién está logueado
import { useAuthStore } from '../../store/useAuthStore';

export default function Home() {
  
  // 🌟 Extraemos también el token
  const { userName, token } = useAuthStore();
  
  // 🛡️ ESCUDO DE SEGURIDAD: 
  // Si no hay token (ej. durante el cierre de sesión), no renderizamos nada.
  // Esto evita que intente cargar HomeNegocio por accidente y cause el Error 422.
  if (!token) {
    return null; 
  }

  // Si el nombre del usuario contiene la palabra "Admin", asumimos que es el administrador
  const isAdmin = userName.toLowerCase().includes('admin');

  // 🌟 PATRÓN SWITCH (El Hub de Rutas)
  if (isAdmin) {
    return <HomeAdmin />;
  }

  // Si no es admin, por defecto le mostramos el panel de dueño de negocio
  return <HomeNegocio />;
}