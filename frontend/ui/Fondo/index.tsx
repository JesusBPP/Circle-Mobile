import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

/**
 * 📄 DESCRIPCIÓN DEL ARCHIVO: ui/Fondo/index.tsx
 * ----------------------------------------------------------------------------------
 * Componente Manager para controlar el fondo global de una pantalla.
 * Permite cambiar entre: Default (Luz), Oscuro (Obsidian) y Patrón (Círculos).
 * ----------------------------------------------------------------------------------
 */

export type TipoFondo = 'default' | 'dark' | 'pattern';

interface FondoManagerProps {
  tipoFondo: TipoFondo;
  children: React.ReactNode; // El contenido de la pantalla
}

export const FondoManager = ({ tipoFondo, children }: FondoManagerProps) => {

  const getBackgroundStyle = () => {
    switch (tipoFondo) {
      case 'dark': return styles.background_Dark;
      case 'pattern': return styles.background_Pattern;
      case 'default':
      default: return styles.background_Default;
    }
  };

  return (
    <View style={[styles.wrapper, getBackgroundStyle()]}>
      
      {/* RENDERIZADO CONDICIONAL DEL PATRÓN (Estilo 3) */}
      {tipoFondo === 'pattern' && (
        <>
          {/* Luces sutiles difuminadas en las esquinas */}
          <View style={[styles.cornerLight, styles.cornerLight_TopLeft]} />
          <View style={[styles.cornerLight, styles.cornerLight_BottomRight]} />
          {/* Luz central extra sutil para dar amplitud */}
          <View style={styles.centerLight} />
        </>
      )}

      {/* RENDERIZADO DEL CONTENIDO DE LA PANTALLA */}
      {children}
    </View>
  );
};