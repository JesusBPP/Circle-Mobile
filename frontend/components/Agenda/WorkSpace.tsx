import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WorkSpaceProps {
  citaMock: any; 
  onGuardarEdicion?: (nuevosDatos: any) => void;
}

export const WorkSpace = ({ citaMock, onGuardarEdicion }: WorkSpaceProps) => {
  const esCita = citaMock.tipo === 'cita';
  const esCancelada = citaMock.estado === 'Cancelada';
  const esFinalizada = citaMock.estado === 'Finalizada';

  let colorPrincipal = esCita ? 'rgb(15, 82, 186)' : 'rgb(34, 139, 34)';
  if (esFinalizada) colorPrincipal = 'rgb(212, 175, 55)';
  if (esCancelada) colorPrincipal = 'rgb(200, 70, 70)';

  const [descripcion, setDescripcion] = useState(citaMock.descripcion || '');
  const [notasInternas, setNotasInternas] = useState(citaMock.notas_internas || '');

  const [isReprogramming, setIsReprogramming] = useState(false);
  
  const fechaOriginal = new Date(citaMock.fecha_hora_inicio_raw || new Date());
  const finOriginal = citaMock.fecha_hora_fin_raw ? new Date(citaMock.fecha_hora_fin_raw) : new Date(fechaOriginal.getTime() + 60*60*1000);

  const [editFecha, setEditFecha] = useState(fechaOriginal);
  const [editHoraInicio, setEditHoraInicio] = useState(fechaOriginal);
  const [editHoraFin, setEditHoraFin] = useState(finOriginal);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);

  const haCambiado = descripcion !== (citaMock.descripcion || '') || notasInternas !== (citaMock.notas_internas || '');

  const handleGuardarTextos = () => {
    if (onGuardarEdicion) {
      onGuardarEdicion({ descripcion, notas_internas: notasInternas });
    }
  };

  const transicionesValidas: Record<string, string[]> = {
    'Programada': ['Reprogramada', 'Finalizada', 'Cancelada'],
    'Reprogramada': ['Reprogramada', 'Finalizada', 'Cancelada'],
    'Pendiente': ['Programada', 'Finalizada', 'Cancelada'],
    'Finalizada': [], 
    'Cancelada': []   
  };

  const estadosPermitidos = transicionesValidas[citaMock.estado] || [];

  const handleCambioEstado = (nuevoEstado: string) => {
    if (nuevoEstado === 'Reprogramada') {
      setIsReprogramming(true);
    } else {
      if (onGuardarEdicion) onGuardarEdicion({ estado: nuevoEstado });
    }
  };

  // 🌟 EL TRUCO MAESTRO: Extraer los números locales directamente
  const getLocalISOString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const confirmarReprogramacion = () => {
    const fechaHoraInicio = new Date(editFecha);
    fechaHoraInicio.setHours(editHoraInicio.getHours(), editHoraInicio.getMinutes(), 0);

    const fechaHoraFin = new Date(editFecha);
    fechaHoraFin.setHours(editHoraFin.getHours(), editHoraFin.getMinutes(), 0);

    if (onGuardarEdicion) {
      onGuardarEdicion({
        estado: 'Reprogramada',
        fecha_hora_inicio: getLocalISOString(fechaHoraInicio),
        fecha_hora_fin: getLocalISOString(fechaHoraFin)
      });
    }
    setIsReprogramming(false);
  };

  const formatDateStr = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTimeStr = (date: Date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={20} color={colorPrincipal} />
          <Text style={styles.cardTitle}>Detalles de Actividad</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Título:</Text>
          <Text style={styles.infoValue}>{citaMock.titulo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Horario:</Text>
          <Text style={styles.infoValue}>{citaMock.horaInicio} - {citaMock.horaFin}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado Actual:</Text>
          <Text style={[styles.infoValue, { fontWeight: 'bold', color: colorPrincipal }]}>{citaMock.estado}</Text>
        </View>

        {!isReprogramming && estadosPermitidos.length > 0 && (
          <View style={styles.transitionsContainer}>
            <Text style={styles.sectionSubtitle}>Cambiar Estado a:</Text>
            <View style={styles.buttonsRow}>
              {estadosPermitidos.includes('Reprogramada') && (
                <TouchableOpacity style={[styles.stateBtn, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]} onPress={() => handleCambioEstado('Reprogramada')}>
                  <Ionicons name="calendar-outline" size={14} color="#3b82f6" />
                  <Text style={[styles.stateBtnText, { color: '#3b82f6' }]}>Reprogramar</Text>
                </TouchableOpacity>
              )}
              {estadosPermitidos.includes('Finalizada') && (
                <TouchableOpacity style={[styles.stateBtn, { backgroundColor: '#fefce8', borderColor: '#eab308' }]} onPress={() => handleCambioEstado('Finalizada')}>
                  <Ionicons name="checkmark-done" size={14} color="#eab308" />
                  <Text style={[styles.stateBtnText, { color: '#eab308' }]}>Finalizar</Text>
                </TouchableOpacity>
              )}
              {estadosPermitidos.includes('Cancelada') && (
                <TouchableOpacity style={[styles.stateBtn, { backgroundColor: '#fef2f2', borderColor: '#ef4444' }]} onPress={() => handleCambioEstado('Cancelada')}>
                  <Ionicons name="close-circle" size={14} color="#ef4444" />
                  <Text style={[styles.stateBtnText, { color: '#ef4444' }]}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {isReprogramming && (
          <View style={styles.reprogramContainer}>
            <Text style={[styles.sectionSubtitle, { color: '#3b82f6' }]}>Selecciona el Nuevo Horario:</Text>
            
            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.label}>Fecha</Text>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={16} color="#475569" />
                  <Text style={styles.dateSelectorText}>{formatDateStr(editFecha)}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.5, paddingRight: 5 }}>
                <Text style={styles.label}>Inicio</Text>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowInicioPicker(true)}>
                  <Text style={styles.dateSelectorText}>{formatTimeStr(editHoraInicio)}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.5, paddingLeft: 5 }}>
                <Text style={styles.label}>Fin</Text>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowFinPicker(true)}>
                  <Text style={styles.dateSelectorText}>{formatTimeStr(editHoraFin)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reprogramActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsReprogramming(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmarReprogramacion}>
                <Text style={styles.confirmBtnText}>Confirmar Horario</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {showDatePicker && (<DateTimePicker value={editFecha} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setEditFecha(d); }}/>)}
      {showInicioPicker && (<DateTimePicker value={editHoraInicio} mode="time" display="default" onChange={(e, t) => { setShowInicioPicker(Platform.OS === 'ios'); if (t) setEditHoraInicio(t); }}/>)}
      {showFinPicker && (<DateTimePicker value={editHoraFin} mode="time" display="default" onChange={(e, t) => { setShowFinPicker(Platform.OS === 'ios'); if (t) setEditHoraFin(t); }}/>)}

      <View style={styles.card}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="document-text" size={20} color="#475569" />
            <Text style={styles.cardTitle}>Descripción y Notas</Text>
          </View>
          
          {haCambiado && (
            <TouchableOpacity style={styles.saveBadge} onPress={handleGuardarTextos}>
              <Ionicons name="save-outline" size={14} color="#fff" />
              <Text style={styles.saveBadgeText}>Guardar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionSubtitle}>Descripción (Visible para el cliente)</Text>
        <TextInput 
          style={styles.textInput}
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Añade una descripción..."
          placeholderTextColor="#94a3b8"
        />

        <Text style={[styles.sectionSubtitle, { marginTop: 15 }]}>Notas Internas (Privado)</Text>
        <TextInput 
          style={[styles.textInput, styles.internalInput]}
          multiline
          value={notasInternas}
          onChangeText={setNotasInternas}
          placeholder="Escribe notas privadas aquí..."
          placeholderTextColor="#b45309"
        />
      </View>

    </ScrollView>
  );
};

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
  reprogramContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  label: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' },
  dateSelectorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 10, gap: 5 },
  dateSelectorText: { fontSize: 12, color: '#1e293b', fontWeight: '500' },
  reprogramActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#f1f5f9' },
  cancelBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  confirmBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#3b82f6' },
  confirmBtnText: { fontSize: 13, fontWeight: 'bold', color: '#ffffff' },
  textInput: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#334155', minHeight: 80, textAlignVertical: 'top' },
  internalInput: { backgroundColor: '#fffbeb', borderColor: '#fef08a', color: '#92400e' }
});