import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ==========================================
  // --- ESTILOS ESTÁNDAR (RadialMenu Flat) ---
  // ==========================================
  container: {
    alignItems: 'center', justifyContent: 'center', width: 160, height: 160, marginVertical: 10,
  },
  variantTitle: {
    position: 'absolute', top: -20, fontSize: 12, fontWeight: 'bold', color: '#64748b', zIndex: 20,
  },
  mainButton: {
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 5, zIndex: 10, 
  },
  mainButtonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  secondaryButton: {
    position: 'absolute', width: 45, height: 45, borderRadius: 22.5,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },

  // ==========================================
  // 🔄 ESTILOS: RadialMenuHome (Animación interactiva)
  // ==========================================
  rotatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    position: 'relative',
    zIndex: 10,
  },
  // 1. Círculo MÁS EXTERNO 
  circleOutermost: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4, 
    borderColor: 'rgb(15, 82, 186)', // Azul oscuro
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent', 
  },
  // 2. Círculo EXTERIOR (Medio)
  circleOuter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5, 
    borderColor: 'rgb(34, 139, 34)', // Verde
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  // 3. Círculo INTERIOR
  circleInner: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5, 
    borderColor: 'rgb(11, 11, 11)', // Negro
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  // Contenedor del botón central interactivo
  centerTouchable: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 20, // Asegura que reciba los clics
  },
  // Sub-opciones del menú (Círculos negros simples)
  secondaryMenuNode: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgb(11, 11, 11)', // Negro simple
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    zIndex: 5, // Por debajo del botón central
  }
});