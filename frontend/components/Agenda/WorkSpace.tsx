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

  // 🌟 ESTADOS PARA REPROGRAMACIÓN (Máquina de Estados)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempFechaReprogramada, setTempFechaReprogramada] = useState(new Date(citaMock.fecha_hora_inicio_raw));

  const haCambiado = descripcion !== (citaMock.descripcion || '') || notasInternas !== (citaMock.notas_internas || '');

  const handleGuardarTextos = () => {
    if (onGuardarEdicion) {
      onGuardarEdicion({ descripcion, notas_internas: notasInternas });
    }
  };

  // 🌟 PATRÓN DE ESTADO: MÁQUINA DE TRANSICIONES
  // Definimos qué botones mostrar dependiendo del estado actual
  const transicionesValidas: Record<string, string[]> = {
    'Programada': ['Reprogramada', 'Finalizada', 'Cancelada'],
    'Reprogramada': ['Reprogramada', 'Finalizada', 'Cancelada'],
    'Pendiente': ['Programada', 'Finalizada', 'Cancelada'],
    'Finalizada': [], // Estado Terminal
    'Cancelada': []   // Estado Terminal
  };

  const estadosPermitidos = transicionesValidas[citaMock.estado] || [];

  const handleCambioEstado = (nuevoEstado: string) => {
    if (nuevoEstado === 'Reprogramada') {
      // Si quiere reprogramar, lanzamos los calendarios
      setShowDatePicker(true);
    } else {
      // Si cancela o finaliza, guardamos directamente
      if (onGuardarEdicion) onGuardarEdicion({ estado: nuevoEstado });
    }
  };

  const confirmarReprogramacion = (fechaFinal: Date) => {
    // Calculamos una hora extra como fin por defecto (luego mejoraremos esto)
    const fechaFin = new Date(fechaFinal);
    fechaFin.setHours(fechaFin.getHours() + 1);

    if (onGuardarEdicion) {
      onGuardarEdicion({
        estado: 'Reprogramada',
        fecha_hora_inicio: fechaFinal.toISOString(),
        fecha_hora_fin: fechaFin.toISOString()
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* TARJETA 1: INFORMACIÓN Y MÁQUINA DE ESTADOS */}
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

        {/* 🌟 MÁQUINA DE ESTADOS: BOTONES DE TRANSICIÓN */}
        {estadosPermitidos.length > 0 && (
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
      </View>

      {/* SELECTORES NATIVOS PARA REPROGRAMAR */}
      {showDatePicker && (
        <DateTimePicker
          value={tempFechaReprogramada}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) {
              setTempFechaReprogramada(date);
              setShowTimePicker(true); // Al elegir fecha, abrimos la hora
            }
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={tempFechaReprogramada}
          mode="time"
          display="default"
          onChange={(event, time) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (time) {
              const nueva = new Date(tempFechaReprogramada);
              nueva.setHours(time.getHours(), time.getMinutes(), 0);
              setTempFechaReprogramada(nueva);
              confirmarReprogramacion(nueva); // Enviamos al Backend
            }
          }}
        />
      )}

      {/* TARJETA 2: DESCRIPCIÓN Y NOTAS */}
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
  
  // 🌟 ESTILOS MÁQUINA DE ESTADO
  transitionsContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  buttonsRow: { flexDirection: 'row', gap: 10, marginTop: 5, flexWrap: 'wrap' },
  stateBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  stateBtnText: { fontSize: 12, fontWeight: 'bold' },

  textInput: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#334155', minHeight: 80, textAlignVertical: 'top' },
  internalInput: { backgroundColor: '#fffbeb', borderColor: '#fef08a', color: '#92400e' }
});