import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WorkspacePublicacionProps {
  publicacionMock: any; 
  onGuardarEdicion?: (nuevosDatos: any) => void;
}

export default function WorkspacePublicacion({ publicacionMock, onGuardarEdicion }: WorkspacePublicacionProps) {
  
  const [titulo, setTitulo] = useState(publicacionMock.titulo || '');
  const [descripcion, setDescripcion] = useState(publicacionMock.descripcion || '');
  const [habilitarComentarios, setHabilitarComentarios] = useState(publicacionMock.habilitar_comentarios ?? true);

  // Simulamos comentarios (Mapeo a Comentarios_Publicaciones)
  const [comentarios, setComentarios] = useState(publicacionMock.comentarios || [
    { id: 1, nombre: 'Ana García', texto: '¡Me encanta esta noticia!', fecha: 'Hoy' },
    { id: 2, nombre: 'Luis Martínez', texto: '¿Aplica también en fines de semana?', fecha: 'Ayer' }
  ]);

  const haCambiado = titulo !== (publicacionMock.titulo || '') || 
                     descripcion !== (publicacionMock.descripcion || '') || 
                     habilitarComentarios !== publicacionMock.habilitar_comentarios;

  const handleGuardarTextos = () => {
    if (onGuardarEdicion) {
      onGuardarEdicion({ titulo, descripcion, habilitar_comentarios: habilitarComentarios });
    }
  };

  const handleEliminarComentario = (idComentario: number) => {
    Alert.alert(
      "Eliminar Comentario",
      "¿Estás seguro de que deseas ocultar este comentario del feed público?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            setComentarios(comentarios.filter((c: any) => c.id !== idComentario));
            // Aquí iría el llamado a FastAPI DELETE /api/lealtad/comentarios/{id}
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🌟 1. TARJETA DE EDICIÓN DEL POST */}
      <View style={styles.card}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="megaphone" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>Comunicado del Feed</Text>
          </View>
          {haCambiado && (
            <TouchableOpacity style={styles.saveBadge} onPress={handleGuardarTextos}>
              <Ionicons name="save-outline" size={14} color="#fff" />
              <Text style={styles.saveBadgeText}>Guardar</Text>
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

      {/* 🌟 2. TARJETA DE ENLACE A OFERTA (Si aplica) */}
      {publicacionMock.id_oferta && (
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

      {/* 🌟 3. TARJETA DE CRM SOCIAL (COMENTARIOS) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubbles" size={20} color="#8b5cf6" />
          <Text style={styles.cardTitle}>Feedback de Clientes</Text>
        </View>

        {!habilitarComentarios && comentarios.length === 0 ? (
          <Text style={styles.emptyFilesText}>Los comentarios están desactivados para este post.</Text>
        ) : comentarios.length > 0 ? (
          comentarios.map((com: any) => (
            <View key={com.id} style={styles.commentBox}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentName}>{com.nombre}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.commentDate}>{com.fecha}</Text>
                  <TouchableOpacity onPress={() => handleEliminarComentario(com.id)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.commentText}>{com.texto}</Text>
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