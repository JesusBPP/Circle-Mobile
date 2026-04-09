import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

// 🌟 Importamos el nuevo componente FondoManager y los botones UI necesarios
import { FondoManager, TipoFondo } from '../ui/Fondo';
import { ButtonCleanUI } from '../ui/Button'; 
// Íconos para los nuevos botones
import { IconContrast, IconSandbox, IconLogout } from '../ui/Icons';

export default function VistaUnUI() {
  
  // 🌟 Estado local para controlar cuál fondo está activo
  // Arranca en 'default' (gris claro)
  const [backgroundType, setBackgroundType] = useState<TipoFondo>('default');

  // Funciones de navegación
  const handleLogout = () => router.replace('/(auth)/login');
  const handleGoToSandbox = () => router.push('/sandbox');

  // 🌟 Lógica para ciclar entre los 3 fondos (Default -> Dark -> Pattern -> Default...)
  const cycleBackground = () => {
    switch (backgroundType) {
      case 'default':
        setBackgroundType('dark');
        break;
      case 'dark':
        setBackgroundType('pattern');
        break;
      case 'pattern':
      default:
        setBackgroundType('default');
        break;
    }
  };

  // Obtenemos el texto para el botón basado en el fondo actual
  const getButtonText = () => {
    switch (backgroundType) {
      case 'dark': return 'Cambiar a Fondo Patrón';
      case 'pattern': return 'Cambiar a Fondo Default';
      default: return 'Cambiar a Fondo Oscuro';
    }
  };

  // Determinamos el color de los textos según el fondo
  const isDarkBackground = backgroundType === 'dark';
  const titleColor = isDarkBackground ? '#f8fafc' : '#1e293b';
  const subtitleColor = isDarkBackground ? '#94a3b8' : '#64748b';

  return (
    // 🌟 ENVOLVEMOS TODA LA PANTALLA CON EL FONDOMANAGER
    <FondoManager tipoFondo={backgroundType}>
      
      {/* Contenedor principal para centrar el contenido sobre el fondo */}
      <View style={styles.container}>
        
        {/* Encabezado */}
        <View style={styles.header}>
          {/* Inyectamos el color dinámicamente según el fondo */}
          <Text style={[styles.title, { color: titleColor }]}>Entorno UI</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>Lienzo de Ambientación Global</Text>
        </View>

        {/* 🌟 SECCIÓN CENTRAL (Limpia, sólo el botón de cambio de fondo) */}
        <View style={styles.componentShowcase}>
          
          <Text style={[styles.infoText, { color: subtitleColor, marginBottom: 15 }]}>
            En esta pantalla limpia, probaremos la ambientación global de la aplicación.
          </Text>

          {/* 🌟 USAMOS UN BOTÓN UI PARA CAMBIAR EL FONDO (Estilo CleanUI) */}
          <View style={styles.buttonsContainer_Internal}>
            <ButtonCleanUI 
              title={getButtonText()} 
              iconLeft={<IconContrast size={18} color="#fff"/>} 
              onPress={cycleBackground} // Activamos la lógica de ciclado
              // VERDE: Forest Green (De la paleta Circle)
              mainColor="rgb(34, 139, 34)" /* --forest-green */
            />
          </View>
        </View>

        {/* 🌟 CONTENEDOR DE NAVEGACIÓN (Reemplazada por botones UI) */}
        <View style={styles.buttonsContainer_Fixed}>
          {/* Botón para ir al Sandbox (Azul Sapphire) */}
          <ButtonCleanUI 
            title="Ir a Sandbox (Biblioteca UI)" 
            iconLeft={<IconSandbox size={18} color="#fff"/>} 
            onPress={handleGoToSandbox}
            // AZUL: Sapphire (De la paleta Circle)
            mainColor="rgb(15, 82, 186)" /* --sapphire */
          />

          {/* Botón para cerrar sesión (Slate Gray) */}
          <ButtonCleanUI 
            title="Cerrar Sesión" 
            iconLeft={<IconLogout size={18} color="#fff"/>} 
            onPress={handleLogout}
            // GRIS: Slate Gray (De la paleta Circle)
            mainColor="rgb(47, 79, 79)" /* --slate-gray */
          />
        </View>

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  // Contenedor interno que ocupará toda la pantalla pero tiene padding vertical
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingVertical: 50,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  componentShowcase: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonsContainer_Internal: {
    width: '100%',
    alignItems: 'center',
  },
  // Contenedor inferior de botones de navegación (Reemplazado por gap)
  buttonsContainer_Fixed: {
    width: '80%',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12, // Espacio uniforme entre los botones CleanUI
  }
});