import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%', 
    marginBottom: 15,
  },
  headerBase: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b', 
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // 🌟 CORRECCIÓN: Fondo blanco sólido en lugar de transparente
  headerOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
  },
  // 🌟 CORRECCIÓN: Fondo blanco sólido en lugar de transparente
  headerMinimal: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 10, // Un poco de padding para que el texto no toque el borde del fondo blanco
  },
  contentArea: {
    overflow: 'hidden',
    backgroundColor: '#f8fafc', 
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderTopWidth: 0, 
  }
});