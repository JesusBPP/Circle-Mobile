import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ==========================================
  // ESTILO 1: NEOMORPHIC (Oscuro con brillo neón)
  // ==========================================
  neoContainer: {
    backgroundColor: '#222428', 
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.4,
    shadowRadius: 5, 
    marginVertical: 5, 
  },
  neoText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  neoIconOnly: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 25, 
  },
  neoRectangular: {
    flexDirection: 'row', 
    width: '80%', 
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12, 
  },

  // ==========================================
  // ESTILO 2: FLAT WITH ACCENT COLOR BLOCKS
  // ==========================================
  flatBlockWrapper: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden', 
    marginVertical: 8,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  flatTextBlock: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  flatText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  flatIconBlock: {
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==========================================
  // ESTILO 3: GRADIENT WITH ARROW POINTS
  // ==========================================
  gradWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 10,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 2,
  },
  gradText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 15,
    marginRight: 20,
    zIndex: 1,
  },

  // ==========================================
  // ESTILO 4: CLEAN PURPLE UI ELEMENTS
  // ==========================================
  cleanWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    width: '100%',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  cleanLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 10,
  },
  cleanStatusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginRight: 5,
  },

  // ==========================================
  // 🌟 ESTILO 5: CARD SOLUCIÓN (Glassmorphism + Gradiente)
  // ==========================================
  cardSolWrapper: {
    width: '100%',
    height: 160, 
    borderRadius: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    overflow: 'hidden', 
    marginBottom: 20,
  },
  cardSolGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cardSolWatermark: {
    position: 'absolute',
    right: -25,
    bottom: -30,
    transform: [{ rotate: '-15deg' }], 
  },
  cardSolContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2, 
  },
  cardSolIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardSolTextContainer: {
    flex: 1,
  },
  cardSolTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardSolDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  
  // 🌟 NUEVO: VARIANTES COMPACTAS PARA EL DROPDOWN
  cardSolWrapperCompact: {
    height: 100, // Menos altura para no saturar el Dropdown
    marginBottom: 12,
    borderRadius: 18,
  },
  cardSolIconContainerCompact: {
    width: 45,
    height: 45,
    borderRadius: 12,
    marginRight: 15,
  },
  cardSolTitleCompact: {
    fontSize: 20,
    marginBottom: 2,
  },
  cardSolDescriptionCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardSolWatermarkCompact: {
    position: 'absolute',
    right: -15,
    bottom: -40,
    transform: [{ scale: 0.7 }, { rotate: '-15deg' }], 
  }
});

