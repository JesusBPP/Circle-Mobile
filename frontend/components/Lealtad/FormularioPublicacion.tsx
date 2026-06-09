import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import lealtadService from '../../features/lealtad/lealtadService';
import { useAuthStore } from '../../store/useAuthStore';

interface OfertaDisponible {
  id: number;
  id_real: number;
  titulo: string;
  estado: string;
}

interface FormularioPublicacionProps {
  idNegocio: number;
  onSuccess: () => void;
}

export default function FormularioPublicacion({ idNegocio, onSuccess }: FormularioPublicacionProps) {
  const { negocioId } = useAuthStore();
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [ofertasDisponibles, setOfertasDisponibles] = useState<OfertaDisponible[]>([]);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<OfertaDisponible | null>(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [cargandoOfertas, setCargandoOfertas] = useState(false);
  const [habilitarComentarios, setHabilitarComentarios] = useState(true);

  useEffect(() => {
    const cargarOfertas = async () => {
      try {
        setCargandoOfertas(true);
        const data = await lealtadService.obtenerDashboard(idNegocio);
        const ofertas = (data.feed_items || [])
          .filter((item: any) => item.type === 'oferta')
          .map((item: any) => ({
            id: item.id,
            id_real: item.id_real,
            titulo: item.titulo,
            estado: item.estado,
          }));
        setOfertasDisponibles(ofertas);
      } catch (error) {
        console.error('Error al cargar ofertas:', error);
      } finally {
        setCargandoOfertas(false);
      }
    };
    cargarOfertas();
  }, [idNegocio]);

  const handlePublicar = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Campos Requeridos', 'El título y la descripción del post son mandatorios.');
      return;
    }

    try {
      const payload = {
        titulo,
        descripcion,
        url_imagen: urlImagen.trim() || null,
        id_oferta: ofertaSeleccionada ? ofertaSeleccionada.id_real : null,
        habilitar_comentarios: habilitarComentarios
      };

      await lealtadService.crearPublicacion(idNegocio, payload);
      
      Alert.alert('Post Publicado', 'Aviso lanzado al feed.');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error al publicar el aviso.');
    }
  };

  return (
    <View style={styles.form}>
      
      <Text style={styles.label}>Título del Post / Banner *</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ej: ¡Llegó la navidad!" placeholderTextColor="#94a3b8" />

      <Text style={styles.label}>Cuerpo del Mensaje *</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} placeholder="Escribe el mensaje completo..." placeholderTextColor="#94a3b8" />

      <Text style={styles.label}>URL del Flyer / Imagen</Text>
      <TextInput style={styles.input} value={urlImagen} onChangeText={setUrlImagen} autoCapitalize="none" keyboardType="url" placeholder="https://... (Opcional)" placeholderTextColor="#94a3b8" />

      <Text style={styles.label}>Vincular a Oferta (Opcional)</Text>
      <TouchableOpacity 
        style={styles.selectorBtn} 
        activeOpacity={0.7} 
        onPress={() => setMostrarSelector(!mostrarSelector)}
      >
        <Ionicons name="gift-outline" size={16} color="#475569" />
        <Text style={styles.selectorText}>
          {ofertaSeleccionada ? ofertaSeleccionada.titulo : 'Sin vincular'}
        </Text>
        <Ionicons name={mostrarSelector ? "chevron-up" : "chevron-down"} size={16} color="#94a3b8" />
      </TouchableOpacity>

      {mostrarSelector && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdownOption} 
            onPress={() => { setOfertaSeleccionada(null); setMostrarSelector(false); }}
          >
            <Ionicons name="remove-circle-outline" size={16} color="#94a3b8" />
            <Text style={styles.dropdownOptionText}>Sin vincular</Text>
          </TouchableOpacity>
          
          {cargandoOfertas ? (
            <Text style={[styles.dropdownOptionText, { color: '#94a3b8', textAlign: 'center', paddingVertical: 10 }]}>
              Cargando ofertas...
            </Text>
          ) : ofertasDisponibles.length === 0 ? (
            <Text style={[styles.dropdownOptionText, { color: '#94a3b8', textAlign: 'center', paddingVertical: 10 }]}>
              No hay ofertas disponibles
            </Text>
          ) : (
            ofertasDisponibles.map((oferta) => (
              <TouchableOpacity 
                key={oferta.id_real} 
                style={[
                  styles.dropdownOption,
                  ofertaSeleccionada?.id_real === oferta.id_real && styles.dropdownOptionSelected
                ]} 
                onPress={() => { setOfertaSeleccionada(oferta); setMostrarSelector(false); }}
              >
                <Ionicons name="gift" size={16} color={oferta.estado?.toLowerCase() === 'activa' ? '#10b981' : '#94a3b8'} />
                <Text style={[styles.dropdownOptionText, ofertaSeleccionada?.id_real === oferta.id_real && styles.dropdownOptionTextSelected]}>
                  {oferta.titulo}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

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
  selectorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8, gap: 8 },
  selectorText: { flex: 1, fontSize: 14, color: '#334155' },
  dropdownContainer: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 18, maxHeight: 200, overflow: 'hidden' },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownOptionSelected: { backgroundColor: '#eff6ff' },
  dropdownOptionText: { fontSize: 14, color: '#334155', flex: 1 },
  dropdownOptionTextSelected: { fontWeight: '600', color: '#2563eb' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24, marginTop: 5 },
  switchTextWrapper: { flex: 0.85 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  switchSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 14, marginTop: 10, elevation: 2, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});
