import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PublicacionFeedItem } from './PublicacionCard';
import lealtadService from '../../features/lealtad/lealtadService';

interface ComentarioItem {
  id: number;
  texto_comentario: string;
  fecha_comentario: string;
  id_usuario_consumidor: number;
}

interface WorkspacePublicacionProps {
  publicacionData: PublicacionFeedItem; 
  onGuardarEdicion?: (nuevosDatos: any) => void;
}

export default function WorkspacePublicacion({ publicacionData, onGuardarEdicion }: WorkspacePublicacionProps) {
  
  const [titulo, setTitulo] = useState(publicacionData.titulo || '');
  const [descripcion, setDescripcion] = useState(publicacionData.descripcion || '');
  const [habilitarComentarios, setHabilitarComentarios] = useState(publicacionData.habilitar_comentarios ?? true);
  const [comentarios, setComentarios] = useState<ComentarioItem[]>([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const haCambiado = titulo !== publicacionData.titulo || 
                     descripcion !== publicacionData.descripcion || 
                     habilitarComentarios !== publicacionData.habilitar_comentarios;

  useEffect(() => {
    const cargarComentarios = async () => {
      try {
        setCargandoComentarios(true);
        const data = await lealtadService.obtenerComentariosPublicacion(publicacionData.id_real);
        setComentarios(data);
      } catch (error) {
        console.error('Error al cargar comentarios:', error);
        setComentarios([]);
      } finally {
        setCargandoComentarios(false);
      }
    };
    cargarComentarios();
  }, [publicacionData.id_real]);

  const handleGuardarTextos = async () => {
    try {
      setGuardando(true);
      await lealtadService.actualizarPublicacion(publicacionData.id_real, { 
        titulo, 
        descripcion, 
        habilitar_comentarios: habilitarComentarios 
      });
      Alert.alert('Éxito', 'Publicación actualizada correctamente.');
      if (onGuardarEdicion) {
        onGuardarEdicion({ titulo, descripcion, habilitar_comentarios: habilitarComentarios });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la publicación.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarComentario = (idComentario: number) => {
    Alert.alert(
      'Eliminar Comentario',
      '¿Estás seguro de que deseas ocultar este comentario del feed público?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await lealtadService.ocultarComentario(idComentario);
              setComentarios(comentarios.filter((c) => c.id !== idComentario));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo ocultar el comentario.');
            }
          }
        }
      ]
    );
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.card}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="megaphone" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>Comunicado del Feed</Text>
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

        <Text style={styles.sectionSubtitle}>Título del Aviso</Text>
        <TextInput style={styles.textInput} value={titulo} onChangeText={setTitulo} placeholder="Título del post..." placeholderTextColor="#94a3b8" />
        
        <Text style={[styles.sectionSubtitle, { marginTop: 15 }]}>Cuerpo del Mensaje</Text>
        <TextInput style={[styles.textInput, styles.textArea]} multiline value={descripcion} onChangeText={setDescripcion} placeholder="Contenido de tu aviso..." placeholderTextColor="#94a3b8" />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Habilitar Comentarios</Text>
            <Text style={styles.switchSubtitle}>Permite a los clientes responder a este post</Text>
          </View>
          <Switch 
            value={habilitarComentarios} 
            onValueChange={setHabilitarComentarios}
            trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
            thumbColor={habilitarComentarios ? '#16a34a' : '#64748b'}
          />
        </View>
      </View>

      {publicacionData.id_oferta !== null && (
        <View style={[styles.card, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1 }]}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.linkIconBox}>
                <Ionicons name="link" size={20} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkTitle}>Vinculado a Oferta Comercial</Text>
                <Text style={styles.linkSubtitle}>Este post dirige a los clientes a canjear una oferta específica de tu catálogo.</Text>
              </View>
           </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubbles" size={20} color="#8b5cf6" />
          <Text style={styles.cardTitle}>Feedback de Clientes</Text>
        </View>

        {cargandoComentarios ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={[styles.emptyFilesText, { marginTop: 10 }]}>Cargando comentarios...</Text>
          </View>
        ) : !habilitarComentarios && comentarios.length === 0 ? (
          <Text style={styles.emptyFilesText}>Los comentarios están desactivados para este post.</Text>
        ) : comentarios.length > 0 ? (
          comentarios.map((com) => (
            <View key={com.id} style={styles.commentBox}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentName}>Consumidor #{com.id_usuario_consumidor}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.commentDate}>{formatearFecha(com.fecha_comentario)}</Text>
                  <TouchableOpacity onPress={() => handleEliminarComentario(com.id)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.commentText}>{com.texto_comentario}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyFilesText}>Aún no hay comentarios en esta publicación.</Text>
        )}
      </View>

      <View style={{ height: 40 }} />
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
  sectionSubtitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 },
  textInput: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#334155' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  switchSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  linkIconBox: { backgroundColor: '#eff6ff', padding: 10, borderRadius: 12 },
  linkTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  linkSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  commentBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  commentName: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6' },
  commentDate: { fontSize: 11, color: '#94a3b8' },
  commentText: { fontSize: 13, color: '#334155', lineHeight: 18 },
  emptyFilesText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginVertical: 15 },
});
