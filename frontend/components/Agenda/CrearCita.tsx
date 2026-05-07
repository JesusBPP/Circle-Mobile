import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { agendaService } from '../../features/agenda/agendaService';

interface CrearCitaProps {
  visible: boolean;
  negocioId: number | null; // 🌟 Necesario para buscar los servicios
  onClose: () => void;
  onSave: (datos: any) => void;
}

export const CrearCita = ({ visible, negocioId, onClose, onSave }: CrearCitaProps) => {
  const [tipo, setTipo] = useState<'cita' | 'evento'>('cita');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [notasInternas, setNotasInternas] = useState('');

  // Estados de Fechas
  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFin, setHoraFin] = useState(new Date(new Date().setHours(new Date().getHours() + 1))); 
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);

  // 🌟 ESTADOS PARA EL CATÁLOGO DE SERVICIOS
  const [servicios, setServicios] = useState<any[]>([]);
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    if (visible && negocioId) {
      agendaService.obtenerServiciosNegocio(negocioId).then(data => {
        setServicios(data);
        if (data.length > 0) setIdServicioSeleccionado(data[0].id); // Autoseleccionamos el primero
      });
    }
  }, [visible, negocioId]);

  const colorActivo = tipo === 'cita' ? 'rgb(15, 82, 186)' : 'rgb(34, 139, 34)'; 

  const handleGuardar = () => {
    const fechaHoraInicio = new Date(fecha);
    fechaHoraInicio.setHours(horaInicio.getHours(), horaInicio.getMinutes(), 0);

    const fechaHoraFin = new Date(fecha);
    fechaHoraFin.setHours(horaFin.getHours(), horaFin.getMinutes(), 0);

    const nuevaCita = {
      titulo,
      descripcion,
      fecha_hora_inicio: fechaHoraInicio.toISOString(),
      fecha_hora_fin: fechaHoraFin.toISOString(),
      numero_bloques: 2, 
      notas_internas: notasInternas,
      estado: 'Programada',
      // 🌟 Si es Cita, enviamos el ID del servicio. Si es Evento interno, enviamos null.
      id_servicio_producto: tipo === 'cita' ? idServicioSeleccionado : null
    };
    onSave(nuevaCita);
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setNotasInternas('');
    setFecha(new Date());
    setHoraInicio(new Date());
    setHoraFin(new Date(new Date().setHours(new Date().getHours() + 1)));
  };

  const formatDateStr = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTimeStr = (date: Date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
        <View style={styles.formContainer}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nueva Actividad</Text>
            <TouchableOpacity onPress={() => { limpiarFormulario(); onClose(); }} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.typeSelector}>
              <TouchableOpacity style={[styles.typeBtn, tipo === 'cita' && { backgroundColor: 'rgb(15, 82, 186)', borderColor: 'rgb(15, 82, 186)' }]} onPress={() => setTipo('cita')}>
                <Ionicons name="person" size={16} color={tipo === 'cita' ? '#fff' : '#64748b'} />
                <Text style={[styles.typeText, tipo === 'cita' && { color: '#fff' }]}>Cita Cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, tipo === 'evento' && { backgroundColor: 'rgb(34, 139, 34)', borderColor: 'rgb(34, 139, 34)' }]} onPress={() => setTipo('evento')}>
                <Ionicons name="calendar" size={16} color={tipo === 'evento' ? '#fff' : '#64748b'} />
                <Text style={[styles.typeText, tipo === 'evento' && { color: '#fff' }]}>Evento Interno</Text>
              </TouchableOpacity>
            </View>

            {/* 🌟 SELECTOR DE SERVICIOS (Solo si es cita) */}
            {tipo === 'cita' && servicios.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>Servicio Solicitado</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {servicios.map((s) => (
                    <TouchableOpacity 
                      key={s.id} 
                      style={[styles.serviceChip, idServicioSeleccionado === s.id && styles.serviceChipActive]}
                      onPress={() => setIdServicioSeleccionado(s.id)}
                    >
                      <Text style={[styles.serviceChipText, idServicioSeleccionado === s.id && styles.serviceChipTextActive]}>
                        {s.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.label}>Título {tipo==='cita' && '(Opcional)'}</Text>
            <TextInput style={styles.input} placeholder={tipo==='cita' ? "Ej: Cliente Nuevo" : "Ej: Auditoría"} placeholderTextColor="#94a3b8" value={titulo} onChangeText={setTitulo} />

            <Text style={styles.label}>Descripción</Text>
            <TextInput style={styles.input} placeholder="Detalles breves" placeholderTextColor="#94a3b8" value={descripcion} onChangeText={setDescripcion} />

            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.label}>Fecha</Text>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={16} color="#475569" />
                  <Text style={styles.dateSelectorText}>{formatDateStr(fecha)}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.5, paddingRight: 5 }}>
                <Text style={styles.label}>Inicio</Text>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowInicioPicker(true)}>
                  <Text style={styles.dateSelectorText}>{formatTimeStr(horaInicio)}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.5, paddingLeft: 5 }}>
                <Text style={styles.label}>Fin</Text>
                <TouchableOpacity style={styles.dateSelectorBtn} onPress={() => setShowFinPicker(true)}>
                  <Text style={styles.dateSelectorText}>{formatTimeStr(horaFin)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (<DateTimePicker value={fecha} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setFecha(d); }}/>)}
            {showInicioPicker && (<DateTimePicker value={horaInicio} mode="time" display="default" onChange={(e, t) => { setShowInicioPicker(Platform.OS === 'ios'); if (t) setHoraInicio(t); }}/>)}
            {showFinPicker && (<DateTimePicker value={horaFin} mode="time" display="default" onChange={(e, t) => { setShowFinPicker(Platform.OS === 'ios'); if (t) setHoraFin(t); }}/>)}

            <Text style={styles.label}>Notas Internas</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Información privada..." placeholderTextColor="#94a3b8" multiline={true} numberOfLines={3} value={notasInternas} onChangeText={setNotasInternas} />

          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colorActivo }]} onPress={handleGuardar}>
              <Text style={styles.saveBtnText}>Crear Actividad</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { width: '100%', maxHeight: '85%', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  closeBtn: { padding: 5, backgroundColor: '#f1f5f9', borderRadius: 12 },
  scrollContent: { padding: 20 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  typeText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 15 },
  
  serviceChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  serviceChipActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  serviceChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  serviceChipTextActive: { color: '#3b82f6' },

  dateSelectorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, marginBottom: 15, gap: 5 },
  dateSelectorText: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#ffffff' },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 15, borderRadius: 14 },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});