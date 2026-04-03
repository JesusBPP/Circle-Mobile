import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Contenedor principal: Mantiene unido al botón principal y sus opciones
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,  // Reduje un poco el tamaño para que quepan varios en la pantalla
    height: 160, 
    marginVertical: 10,
  },
  // Nombre de la variante (Para visualizarlo en el Sandbox)
  variantTitle: {
    position: 'absolute',
    top: -20,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    zIndex: 20,
  },
  // Estilos del botón principal (sin color de fondo)
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10, // Sombra en Android
    shadowColor: '#000', // Sombras en iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10, 
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Estilos de los botones secundarios (sin color de fondo)
  secondaryButton: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // ====================================================================
  // 💎 NUEVOS ESTILOS: GLOSSY PINK (Copiado tal cual de la imagen) 💎
  // Usamos capas concéntricas para simular el volumen y la luz.
  // ====================================================================

  containerGlossy: {
    width: 250, 
    height: 250, 
  },
  // Capa 1 (Externa): El brillo exterior (Outer Glow)
  mainButtonGlossy_Outer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 0, 255, 0.15)', // Fuchsia muy suave
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20, 
    shadowColor: 'rgb(255, 0, 255)', // Fuchsia puro
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // Capa 2 (Anillo): El borde fuchsia brillante
  mainButtonGlossy_Ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgb(11, 11, 11)', // Obsidian (Negro profundo)
    borderWidth: 2.5,
    borderColor: 'rgb(255, 0, 255)', // Fuchsia puro
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Capa 3 (Interna - Brillo): Simula el reflejo de la luz (Glare)
  mainButtonGlossy_Glare: {
    position: 'absolute',
    top: 5,
    left: 10,
    width: 35,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Blanco semi-transparente
    borderRadius: 15,
    transform: [{ rotate: '-15deg' }], // Girado como en la imagen
  },
  mainButtonTextGlossy: {
    color: 'rgb(255, 105, 180)', // Bubblegum
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 2, 
  },
  // --- BOTONES SECUNDARIOS GLOSSY (Los 5 en arco) ---
  secondaryButtonGlossy_Outer: {
    backgroundColor: 'rgb(255, 0, 255)', // Fuchsia de fondo
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Borde sutil blanco
    elevation: 10,
    shadowColor: 'rgb(255, 105, 180)', // Bubblegum shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  secondaryButtonGlossy_DarkRing: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(11, 11, 11, 0.8)', // Obsidian semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonGlossy_Glare: {
    position: 'absolute',
    top: 4,
    left: 7,
    width: 20,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
    transform: [{ rotate: '-10deg' }],
  }
});