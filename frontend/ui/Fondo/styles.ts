import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Envoltorio principal que ocupará toda la pantalla
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // ==============================
  // ESTILO 1: DEFAULT (Gris Claro)
  // ==============================
  background_Default: {
    backgroundColor: '#f1f5f9', // Gris claro (Usado en el anterior vistaUnUI)
  },

  // ==============================
  // ESTILO 2: OSCURO (Obsidian)
  // ==============================
  background_Dark: {
    backgroundColor: 'rgb(11, 11, 11)', // --obsidian (De la paleta Circle)
  },

  // ==============================
  // ESTILO 3: PATRÓN DE CÍRCULOS (Luz difuminada)
  // Concepto de: Blanco, líneas en esquinas, menos en centro.
  // ==============================
  background_Pattern: {
    backgroundColor: '#FFFFFF', // Fondo blanco puro
    overflow: 'hidden',
  },
  // Elementos difuminados en las esquinas para simular el patrón
  cornerLight: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(0, 71, 171, 0.15)', // Cobalt Blue muy sutil
    shadowColor: 'rgb(0, 71, 171)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 20,
  },
  cornerLight_TopLeft: {
    top: -width * 0.1,
    left: -width * 0.1,
  },
  cornerLight_BottomRight: {
    bottom: -width * 0.1,
    right: -width * 0.1,
  },
  // Elemento central más difuminado (menos "líneas")
  centerLight: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(135, 206, 235, 0.08)', // Sky Blue extra sutil
    shadowColor: 'rgb(135, 206, 235)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 80,
    elevation: 10,
    zIndex: -1, // Por debajo de los demás
  }
});