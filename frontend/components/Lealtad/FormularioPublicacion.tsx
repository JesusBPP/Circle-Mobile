import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormularioPublicacionProps {
  idNegocio: number;
  onSuccess: () => void;
}

export default function FormularioPublicacion({ idNegocio, onSuccess }: FormularioPublicacionProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [idOferta, setIdOferta] = useState(''); // 🌟 NUEVO: Enlace a Oferta
  const [habilitarComentarios, setHabilitarComentarios] = useState(true);

  const handlePublicar = () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Campos Requeridos', 'El título y la descripción del post son mandatorios.');
      return;
    }

    const payload = {
      id_negocio: idNegocio,
      titulo,
      descripcion,
      url_imagen: urlImagen.trim() || null,
      id_oferta: idOferta.trim() ? parseInt(idOferta) : null, // Mapeo a BD
      habilitar_comentarios: habilitarComentarios
    };

    console.log('Publicando en muro comercial via FastAPI:', payload);
    Alert.alert('Post Publicado', 'Aviso lanzado al feed.');
    onSuccess();
  };

  return (
    <View style={styles.form}>
      
      <Text style={styles.label}>Título del Post / Banner *</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ej: ¡Llegó la navidad! 🎄" placeholderTextColor="#94a3b8" />

      <Text style={styles.label}>Cuerpo del Mensaje *</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} placeholder="Escribe el mensaje completo..." placeholderTextColor="#94a3b8" />

      <Text style={styles.label}>URL del Flyer / Imagen</Text>
      <TextInput style={styles.input} value={urlImagen} onChangeText={setUrlImagen} autoCapitalize="none" keyboardType="url" placeholder="https://... (Opcional)" placeholderTextColor="#94a3b8" />

      {/* 🌟 NUEVO: ENLACE A OFERTA */}
      <Text style={styles.label}>Vincular a Oferta (ID Opcional)</Text>
      <TextInput style={styles.input} value={idOferta} onChangeText={setIdOferta} keyboardType="numeric" placeholder="Si es una promo, escribe el ID aquí..." placeholderTextColor="#94a3b8" />

      <View style={styles.switchRow}>
        <View style={styles.switchTextWrapper}>
          <Text style={styles.switchLabel}>Habilitar Comentarios</Text>
          <Text style={styles.switchSubtitle}>{habilitarComentarios ? 'Los consumidores pueden opinar' : 'Cerrar comentarios para este post'}</Text>
        </View>
        <Switch value={habilitarComentarios} onValueChange={setHabilitarComentarios} trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }} thumbColor={habilitarComentarios ? '#16a34a' : '#64748b'} />
      </View>

      <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handlePublicar}>
        <Ionicons name="paper-plane" size={18} color="#ffffff" />
        <Text style={styles.submitButtonText}>Lanzar al Feed de Clientes</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#334155', marginBottom: 18 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24, marginTop: 5 },
  switchTextWrapper: { flex: 0.85 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  switchSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 14, marginTop: 10, elevation: 2, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});