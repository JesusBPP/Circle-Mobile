import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Contenedor principal que agrupa el botón y el contenido oculto
  container: {
    width: '100%', // Ocupa todo el ancho disponible horizontalmente
    marginBottom: 15,
  },
  
  // --- ESTILOS COMPARTIDOS DEL HEADER (BOTÓN) ---
  headerBase: {
    flexDirection: 'row', // Título a la izquierda, ícono a la derecha
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b', // Gris oscuro estándar
  },
  
  // --- VARIANTE 1: CARD (Tarjeta elevada) ---
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // --- VARIANTE 2: OUTLINE (Con borde) ---
  headerOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
  },
  
  // --- VARIANTE 3: MINIMAL (Solo línea abajo) ---
  headerMinimal: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 5, // Menos espacio lateral para un look más limpio
  },

  // --- CONTENEDOR DEL CONTENIDO DESPLEGABLE ---
  contentArea: {
    overflow: 'hidden',
    backgroundColor: '#f8fafc', // Fondo ligeramente diferente para distinguir que es contenido interno
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 15,
    // Pequeño borde para las variantes Card y Outline
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderTopWidth: 0, 
  }
});