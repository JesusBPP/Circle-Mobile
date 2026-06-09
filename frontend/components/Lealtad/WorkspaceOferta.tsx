import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ButtonNeo } from '../../ui/Button'; 
import MostrarQR from './MostrarQR'; 
import { OfertaFeedItem } from './OfertaCard';
import lealtadService from '../../features/lealtad/lealtadService';

interface WorkspaceOfertaProps {
  ofertaData: OfertaFeedItem; 
  onGuardarEdicion?: (nuevosDatos: any) => void;
}

export default function WorkspaceOferta({ ofertaData, onGuardarEdicion }: WorkspaceOfertaProps) {
  const [titulo, setTitulo] = useState(ofertaData.titulo || '');
  const [descripcion, setDescripcion] = useState(ofertaData.descripcion || '');
  const [estadoLocal, setEstadoLocal] = useState(ofertaData.estado || 'activa');
  const [modalQRVisible, setModalQRVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const isActiva = estadoLocal?.toLowerCase() === 'activa';
  const estadoNormalizado = estadoLocal === 'activa' ? 'Activa' : estadoLocal === 'pausada' ? 'Pausada' : 'Inactiva';
  const colorPrincipal = isActiva ? '#f59e0b' : '#64748b';

  // NUEVO: Calcular estado de agotamiento y expiración
  const hoy = new Date();
  const fechaFin = ofertaData.fecha_fin ? new Date(ofertaData.fecha_fin) : null;
  const estaExpirada = fechaFin ? fechaFin < hoy : false;
  const estaAgotada = ofertaData.stock_restante !== null && ofertaData.stock_restante !== undefined && ofertaData.stock_restante === 0;

  // NUEVO: Validar al cargar si la oferta está agotada
  useEffect(() => {
    if (ofertaData.limite_existencias !== null && ofertaData.stock_restante === 0) {
      Alert.alert(
        'Oferta Agotada',
        'Esta oferta ha alcanzado su límite de canjes y se ha pausado automáticamente.',
        [{ text: 'Entendido' }]
      );
      setEstadoLocal('pausada');
    }
  }, [ofertaData.id]);

  const haCambiado = titulo !== ofertaData.titulo || descripcion !== ofertaData.descripcion || estadoLocal !== ofertaData.estado;

  const handleGuardarTextos = async () => {
    try {
      setGuardando(true);
      await lealtadService.actualizarOferta(ofertaData.id_real, { titulo, descripcion });
      Alert.alert('Éxito', 'Textos de la oferta actualizados correctamente.');
      if (onGuardarEdicion) onGuardarEdicion({ titulo, descripcion });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la oferta.');
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async () => {
    const nuevoEstado = isActiva ? 'pausada' : 'activa';
    const accion = isActiva ? 'pausar' : 'activar';
    
    try {
      setGuardando(true);
      await lealtadService.actualizarOferta(ofertaData.id_real, { estado: nuevoEstado });
      setEstadoLocal(nuevoEstado);
      Alert.alert('Éxito', `Oferta ${accion}da correctamente.`);
    } catch (error: any) {
      Alert.alert('Error', error.message || `No se pudo ${accion} la oferta.`);
    } finally {
      setGuardando(false);
    }
  };

  const reglas = ofertaData.reglas as any[] | undefined;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="gift" size={20} color={colorPrincipal} />
          <Text style={styles.cardTitle}>Detalles de la Oferta</Text>
        </View>

        {/* NUEVO: Badges de estado */}
        {estaAgotada && (
          <View style={[styles.statusBadge, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.statusBadgeText}>AGOTADA</Text>
          </View>
        )}
        {estaExpirada && !estaAgotada && (
          <View style={[styles.statusBadge, { backgroundColor: '#64748b' }]}>
            <Text style={styles.statusBadgeText}>EXPIRADA</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sucursal:</Text>
          <Text style={styles.infoValue}>📍 {ofertaData.nombre_sucursal}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visibilidad:</Text>
          <Text style={styles.infoValue}>{ofertaData.es_publica ? 'Pública (Todos)' : 'Privada (Whitelist)'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Costo en Puntos:</Text>
          <Text style={styles.infoValue}>{ofertaData.costo_en_puntos !== null ? `${ofertaData.costo_en_puntos} Pts` : 'Gratis'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vigencia:</Text>
          <Text style={styles.infoValue}>
            {ofertaData.fecha_inicio ? new Date(ofertaData.fecha_inicio).toLocaleDateString('es-ES') : 'Sin fecha'} → {ofertaData.fecha_fin ? new Date(ofertaData.fecha_fin).toLocaleDateString('es-ES') : 'Sin fecha'}
          </Text>
        </View>
        {ofertaData.limite_existencias !== null && ofertaData.limite_existencias !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock Restante:</Text>
            <Text style={[
              styles.infoValue,
              ofertaData.stock_restante === 0 && { color: '#ef4444', fontWeight: 'bold' }
            ]}>
              {ofertaData.stock_restante} / {ofertaData.limite_existencias}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado Actual:</Text>
          <Text style={[styles.infoValue, { fontWeight: 'bold', color: colorPrincipal }]}>{estadoNormalizado}</Text>
        </View>

        <View style={styles.transitionsContainer}>
          <Text style={styles.sectionSubtitle}>Acciones de Operación:</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.stateBtn, { backgroundColor: isActiva ? '#fef2f2' : '#ecfdf5', borderColor: isActiva ? '#ef4444' : '#10b981' }, guardando && { opacity: 0.5 }]} 
              onPress={toggleEstado}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={isActiva ? '#ef4444' : '#10b981'} />
              ) : (
                <>
                  <Ionicons name={isActiva ? "power" : "play"} size={14} color={isActiva ? "#ef4444" : "#10b981"} />
                  <Text style={[styles.stateBtnText, { color: isActiva ? '#ef4444' : '#10b981' }]}>
                    {isActiva ? 'Pausar Oferta' : 'Activar Oferta'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="document-text" size={20} color="#475569" />
            <Text style={styles.cardTitle}>Textos Promocionales</Text>
          </View>
          {haCambiado && (
            <TouchableOpacity style={[styles.saveBadge, guardando && { opacity: 0.5 }]} onPress={handleGuardarTextos} disabled={guardando}>
              {guardando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={14} color="#fff" />
                  <Text style={styles.saveBadgeText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionSubtitle}>Título (Visible para el cliente)</Text>
        <TextInput style={styles.textInput} value={titulo} onChangeText={setTitulo} placeholder="Ej: 50% Off en Capuchino" placeholderTextColor="#94a3b8" />
        
        <Text style={[styles.sectionSubtitle, { marginTop: 15 }]}>Descripción de las reglas</Text>
        <TextInput style={[styles.textInput, styles.textArea]} multiline value={descripcion} onChangeText={setDescripcion} placeholder="Explica cómo aplica el descuento..." placeholderTextColor="#94a3b8" />
      </View>

      {reglas && reglas.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="layers" size={20} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Reglas de la Oferta (Motor NxN)</Text>
          </View>

          {reglas.map((regla, index) => (
            <View key={regla.id || index} style={styles.reglaItem}>
              <View style={styles.reglaHeader}>
                <Ionicons 
                  name={regla.tipo_regla === 'requisito' ? 'checkmark-circle' : 'gift'} 
                  size={16} 
                  color={regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981'} 
                />
                <Text style={[styles.reglaTipo, { color: regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981' }]}>
                  {regla.tipo_regla.toUpperCase()}
                </Text>
              </View>
              
              {regla.nombre_servicio_disponible && (
                <Text style={styles.reglaDetalle}>
                  {regla.tipo_servicio_disponible === 'servicio' ? '🔧' : '📦'} {regla.nombre_servicio_disponible}
                </Text>
              )}
              {regla.cantidad && (
                <Text style={styles.reglaDetalle}>Cantidad: {regla.cantidad}</Text>
              )}
              {regla.porcentaje_descuento && (
                <Text style={styles.reglaDetalle}>Descuento: {regla.porcentaje_descuento}%</Text>
              )}
              {regla.monto_descuento && (
                <Text style={styles.reglaDetalle}>Monto descuento: ${regla.monto_descuento}</Text>
              )}
              {regla.monto_minimo && (
                <Text style={styles.reglaDetalle}>Monto mínimo: ${regla.monto_minimo}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="analytics" size={20} color="#0ea5e9" />
          <Text style={styles.cardTitle}>Métricas y Canje</Text>
        </View>

        <View style={styles.analyticsRow}>
          <View style={styles.analyticsBox}>
            <Text style={styles.analyticsNumber}>{ofertaData.total_canjes || 0}</Text>
            <Text style={styles.analyticsLabel}>Canjes Realizados</Text>
          </View>
          <View style={styles.analyticsBox}>
            <Text style={styles.analyticsNumber}>{ofertaData.limite_existencias !== null ? ofertaData.limite_existencias : '∞'}</Text>
            <Text style={styles.analyticsLabel}>Stock Total</Text>
          </View>
        </View>

        {/* NUEVO: Alerta visual cuando stock está agotado */}
        {ofertaData.stock_restante === 0 && (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.alertText}>
              Esta oferta ha agotado su stock y se ha pausado automáticamente.
            </Text>
          </View>
        )}

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

      <Modal visible={modalQRVisible} animationType="slide" transparent={true} onRequestClose={() => setModalQRVisible(false)}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalQRVisible(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            <MostrarQR idOferta={ofertaData.id_real} onClose={() => setModalQRVisible(false)} />
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
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  statusBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
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
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, padding: 12, marginTop: 12, gap: 8 },
  alertText: { flex: 1, fontSize: 13, color: '#991b1b', fontWeight: '500' },
  emptyFilesText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginVertical: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, alignItems: 'center', position: 'relative' },
  closeModalBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10, padding: 5, backgroundColor: '#f1f5f9', borderRadius: 20 },
  reglaItem: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  reglaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reglaTipo: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  reglaDetalle: { fontSize: 13, color: '#475569', marginLeft: 24, marginTop: 2 },
});
