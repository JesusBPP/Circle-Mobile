import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FormularioOfertaProps {
  idNegocio: number;
  onSuccess: () => void;
}

export default function FormularioOferta({ idNegocio, onSuccess }: FormularioOfertaProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costoEnPuntos, setCostoEnPuntos] = useState('');
  const [limiteStock, setLimiteStock] = useState('');
  const [limitePorUsuario, setLimitePorUsuario] = useState('');
  const [esPublica, setEsPublica] = useState(true);

  // 🌟 NUEVOS CAMPOS: Fechas de Vigencia (Basado en DBML)
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)); // +7 días por defecto
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  const formatDateStr = (date: Date) => date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Falta Información', 'El título de la oferta es estrictamente mandatorio.');
      return;
    }
    if (fechaFin < fechaInicio) {
      Alert.alert('Error de Fechas', 'La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    try {
      const payload = {
        titulo,
        descripcion,
        es_publica: esPublica,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        costo_en_puntos: costoEnPuntos ? parseFloat(costoEnPuntos) : null,
        limite_existencias: limiteStock ? parseInt(limiteStock) : null,
        limite_por_usuario: limitePorUsuario ? parseInt(limitePorUsuario) : null,
      };
      
      console.log('Enviando Oferta a FastAPI:', payload);
      Alert.alert('Éxito', 'Oferta promocional guardada correctamente.');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error en el servidor contable.');
    }
  };

  return (
    <View style={styles.form}>
      
      <Text style={styles.label}>Título de la Oferta *</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ej: 2x1 en Bebidas" placeholderTextColor="#94a3b8" />

      <Text style={styles.label}>Descripción / Términos</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} placeholder="Explica las reglas..." placeholderTextColor="#94a3b8" />

      {/* 🌟 NUEVO: CONTROLES DE VIGENCIA */}
      <View style={styles.row}>
        <View style={styles.flexItem}>
          <Text style={styles.label}>Válida Desde</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerInicio(true)}>
            <Ionicons name="calendar-outline" size={16} color="#475569" />
            <Text style={styles.dateText}>{formatDateStr(fechaInicio)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flexItem}>
          <Text style={styles.label}>Válida Hasta</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerFin(true)}>
            <Ionicons name="calendar-outline" size={16} color="#475569" />
            <Text style={styles.dateText}>{formatDateStr(fechaFin)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPickerInicio && (<DateTimePicker value={fechaInicio} mode="date" display="default" onChange={(e, d) => { setShowPickerInicio(Platform.OS === 'ios'); if (d) setFechaInicio(d); }}/>)}
      {showPickerFin && (<DateTimePicker value={fechaFin} mode="date" display="default" onChange={(e, d) => { setShowPickerFin(Platform.OS === 'ios'); if (d) setFechaFin(d); }}/>)}

      <View style={styles.row}>
        <View style={styles.flexItem}>
          <Text style={styles.label}>Costo (Puntos)</Text>
          <TextInput style={styles.input} value={costoEnPuntos} onChangeText={setCostoEnPuntos} keyboardType="numeric" placeholder="Null = Gratis" placeholderTextColor="#cbd5e1" />
        </View>
        <View style={styles.flexItem}>
          <Text style={styles.label}>Existencias Máx.</Text>
          <TextInput style={styles.input} value={limiteStock} onChangeText={setLimiteStock} keyboardType="numeric" placeholder="Ilimitadas" placeholderTextColor="#cbd5e1" />
        </View>
      </View>

      <Text style={styles.label}>Límite de Canjes por Usuario</Text>
      <TextInput style={styles.input} value={limitePorUsuario} onChangeText={setLimitePorUsuario} keyboardType="numeric" placeholder="Ej: 1 (Para uso único)" placeholderTextColor="#94a3b8" />

      <View style={styles.switchRow}>
        <View style={styles.switchTextWrapper}>
          <Text style={styles.switchLabel}>Promoción Pública</Text>
          <Text style={styles.switchSubtitle}>{esPublica ? 'Visible para todos' : 'Exclusiva VIP (Whitelist)'}</Text>
        </View>
        <Switch value={esPublica} onValueChange={setEsPublica} trackColor={{ false: '#cbd5e1', true: '#93c5fd' }} thumbColor={esPublica ? '#2563eb' : '#64748b'} />
      </View>

      <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handleGuardar}>
        <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
        <Text style={styles.submitButtonText}>Crear Oferta</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#334155', marginBottom: 18 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  flexItem: { flex: 1 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dateText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24, marginTop: 5 },
  switchTextWrapper: { flex: 0.85 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  switchSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 14, marginTop: 10, elevation: 2, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});