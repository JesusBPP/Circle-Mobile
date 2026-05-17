import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ButtonNeo } from '../../ui/Button'; // Tu componente Neomórfico
import MostrarQR from './MostrarQR'; // Nuestro generador de tokens JWT

interface WorkspaceOfertaProps {
  ofertaMock: any; 
  onGuardarEdicion?: (nuevosDatos: any) => void;
}

export default function WorkspaceOferta({ ofertaMock, onGuardarEdicion }: WorkspaceOfertaProps) {
  // Normalización de estado a prueba de fallos
  const estadoRaw = ofertaMock.estado || 'Inactiva';
  const estadoNormalizado = estadoRaw.charAt(0).toUpperCase() + estadoRaw.slice(1).toLowerCase();
  const isActiva = estadoNormalizado === 'Activa';

  const colorPrincipal = isActiva ? '#f59e0b' : '#64748b';

  const [titulo, setTitulo] = useState(ofertaMock.titulo || '');
  const [descripcion, setDescripcion] = useState(ofertaMock.descripcion || '');
  const [modalQRVisible, setModalQRVisible] = useState(false);

  const haCambiado = titulo !== (ofertaMock.titulo || '') || descripcion !== (ofertaMock.descripcion || '');

  const handleGuardarTextos = () => {
    if (onGuardarEdicion) {
      onGuardarEdicion({ titulo, descripcion });
    }
  };

  const toggleEstado = () => {
    const nuevoEstado = isActiva ? 'Inactiva' : 'Activa';
    if (onGuardarEdicion) onGuardarEdicion({ estado: nuevoEstado });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🌟 1. TARJETA DE DETALLES PRINCIPALES */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="gift" size={20} color={colorPrincipal} />
          <Text style={styles.cardTitle}>Detalles de la Oferta</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visibilidad:</Text>
          <Text style={styles.infoValue}>{ofertaMock.es_publica ? 'Pública (Todos)' : 'Privada (Whitelist)'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Costo en Puntos:</Text>
          <Text style={styles.infoValue}>{ofertaMock.costo_en_puntos ? `${ofertaMock.costo_en_puntos} Pts` : 'Gratis'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado Actual:</Text>
          <Text style={[styles.infoValue, { fontWeight: 'bold', color: colorPrincipal }]}>{estadoNormalizado}</Text>
        </View>

        {/* CONTROLES DE ESTADO */}
        <View style={styles.transitionsContainer}>
          <Text style={styles.sectionSubtitle}>Acciones de Operación:</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.stateBtn, { backgroundColor: isActiva ? '#fef2f2' : '#ecfdf5', borderColor: isActiva ? '#ef4444' : '#10b981' }]} 
              onPress={toggleEstado}
            >
              <Ionicons name={isActiva ? "power" : "play"} size={14} color={isActiva ? "#ef4444" : "#10b981"} />
              <Text style={[styles.stateBtnText, { color: isActiva ? '#ef4444' : '#10b981' }]}>
                {isActiva ? 'Pausar Oferta' : 'Activar Oferta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 🌟 2. TARJETA DE EDICIÓN DE TEXTOS */}
      <View style={styles.card}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="document-text" size={20} color="#475569" />
            <Text style={styles.cardTitle}>Textos Promocionales</Text>
          </View>
          {haCambiado && (
            <TouchableOpacity style={styles.saveBadge} onPress={handleGuardarTextos}>
              <Ionicons name="save-outline" size={14} color="#fff" />
              <Text style={styles.saveBadgeText}>Guardar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionSubtitle}>Título (Visible para el cliente)</Text>
        <TextInput style={styles.textInput} value={titulo} onChangeText={setTitulo} placeholder="Ej: 50% Off en Capuchino" placeholderTextColor="#94a3b8" />
        
        <Text style={[styles.sectionSubtitle, { marginTop: 15 }]}>Descripción de las reglas</Text>
        <TextInput style={[styles.textInput, styles.textArea]} multiline value={descripcion} onChangeText={setDescripcion} placeholder="Explica cómo aplica el descuento..." placeholderTextColor="#94a3b8" />
      </View>

      {/* 🌟 3. TARJETA DE ANALÍTICA LOCAL Y QR */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="analytics" size={20} color="#0ea5e9" />
          <Text style={styles.cardTitle}>Métricas y Canje</Text>
        </View>

        <View style={styles.analyticsRow}>
          <View style={styles.analyticsBox}>
            <Text style={styles.analyticsNumber}>{ofertaMock.usos_registrados || 0}</Text>
            <Text style={styles.analyticsLabel}>Canjes Exitosos</Text>
          </View>
          <View style={styles.analyticsBox}>
            <Text style={styles.analyticsNumber}>{ofertaMock.limite_existencias || '∞'}</Text>
            <Text style={styles.analyticsLabel}>Stock Restante</Text>
          </View>
        </View>

        {isActiva ? (
          <View style={{ marginTop: 20 }}>
            <ButtonNeo 
              title="MOSTRAR CÓDIGO QR"
              icon={<Ionicons name="qr-code-outline" size={22} color="#ffffff" />}
              glowColor="#3b82f6"
              backgroundColor="#1e293b"
              isRectangular={true}
              underGlow={true}
              onPress={() => setModalQRVisible(true)}
            />
          </View>
        ) : (
          <Text style={styles.emptyFilesText}>La oferta debe estar activa para generar códigos QR.</Text>
        )}
      </View>

      <View style={{ height: 40 }} />

      {/* 🌟 MODAL DE SEGURIDAD PARA EL QR */}
      <Modal visible={modalQRVisible} animationType="slide" transparent={true} onRequestClose={() => setModalQRVisible(false)}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalQRVisible(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            
            {/* INYECTAMOS EL COMPONENTE INTELIGENTE DE TOKENS JWT */}
            <MostrarQR idOferta={ofertaMock.id} onClose={() => setModalQRVisible(false)} />
            
          </SafeAreaView>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  saveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  saveBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '600', maxWidth: '70%', textAlign: 'right' },
  sectionSubtitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 },
  transitionsContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  buttonsRow: { flexDirection: 'row', gap: 10, marginTop: 5, flexWrap: 'wrap' },
  stateBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  stateBtnText: { fontSize: 12, fontWeight: 'bold' },
  textInput: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#334155' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  analyticsRow: { flexDirection: 'row', gap: 15, marginTop: 5 },
  analyticsBox: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  analyticsNumber: { fontSize: 24, fontWeight: '800', color: '#0ea5e9' },
  analyticsLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginTop: 4, fontWeight: '600' },
  emptyFilesText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginVertical: 15 },
  
  // Estilos del Modal QR
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, alignItems: 'center', position: 'relative' },
  closeModalBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10, padding: 5, backgroundColor: '#f1f5f9', borderRadius: 20 }
});