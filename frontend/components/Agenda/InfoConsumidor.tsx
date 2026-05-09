import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 🌟 IMPORTAMOS EL ROUTER PARA LA NAVEGACIÓN
import { router } from 'expo-router';

interface InfoConsumidorProps {
  visible: boolean;
  consumidor: any;
  onClose: () => void;
}

export const InfoConsumidor = ({ visible, consumidor, onClose }: InfoConsumidorProps) => {
  if (!consumidor) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          
          {/* HEADER DEL PERFIL */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{consumidor.nombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.name}>{consumidor.nombre}</Text>
                <Text style={styles.email}>{consumidor.correo || 'Sin correo registrado'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* CUERPO: HISTORIAL DE NOTAS */}
          <View style={styles.body}>
            <Text style={styles.sectionTitle}>Historial de Notas en el Negocio</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {consumidor.historial_notas && consumidor.historial_notas.length > 0 ? (
                consumidor.historial_notas.map((nota: any, index: number) => (
                  // 🌟 AHORA ES UN BOTÓN QUE NOS LLEVA AL WORKSPACE DE ESA CITA
                  <TouchableOpacity 
                    key={index} 
                    style={styles.noteCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose(); // Cerramos este modal primero
                      // Navegamos al EspacioAgenda pasando el ID de la cita histórica
                      router.push(`/(screens)/agenda/EspacioAgenda?id_cita=${nota.id_cita}` as any);
                    }}
                  >
                    <View style={styles.noteHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="calendar" size={14} color="#3b82f6" />
                        <Text style={styles.noteDate}>{nota.fecha}</Text>
                      </View>
                      <Text style={styles.noteService}>{nota.servicio}</Text>
                    </View>
                    <Text style={styles.noteText}>{nota.texto}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyStateText}>Este cliente no tiene notas previas registradas.</Text>
                </View>
              )}
            </ScrollView>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  email: { fontSize: 13, color: '#64748b', marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  body: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: 15 },
  scrollContent: { paddingBottom: 20 },
  noteCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  noteDate: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  noteService: { fontSize: 11, fontWeight: '700', color: '#8b5cf6', backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  noteText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyStateText: { marginTop: 10, fontSize: 14, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }
});