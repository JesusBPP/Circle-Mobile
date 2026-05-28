import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DropdownButton } from '../../ui/DropdownButton';
import SelectorSucursales, { SucursalData } from './SelectorSucursales';

// 🌟 INTEGRACIÓN CON EL BACKEND
import { useAuthStore } from '../../store/useAuthStore';
import lealtadService from '../../features/lealtad/lealtadService';

interface WorkspaceCalificacionProps {
  onNavegarAWorkspace: (tipo: 'workspaceOferta' | 'workspacePublicacion', idReferencia: string) => void;
}

export default function WorkspaceCalificacion({ onNavegarAWorkspace }: WorkspaceCalificacionProps) {
  const { negocioId } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [metricasNegocio, setMetricasNegocio] = useState({ calificacion_global: 0, total_resenas_globales: 0 });
  const [sucursales, setSucursales] = useState<SucursalData[]>([]);
  const [sucursalActiva, setSucursalActiva] = useState<SucursalData | null>(null);
  const [filtroComentarios, setFiltroComentarios] = useState('Todos');

  // 🌟 MOCK ARQUITECTÓNICO: Pendiente de crear endpoint GET /comentarios en FastAPI
  const feedbackMock = [
    { id: 1, tipo: 'resena', nombre: 'Juan Consumidor', fecha: 'Hoy', puntuacion: 5, texto: '¡El mejor café de la ciudad!', origen: 'Reseña de Sucursal', ref_id: null },
    { id: 2, tipo: 'oferta', nombre: 'Ana García', fecha: 'Ayer', puntuacion: null, texto: '¿Aplica en fin de semana?', origen: 'Oferta: 2x1 en Corte', ref_id: 'o-2' },
    { id: 3, tipo: 'publicacion', nombre: 'Luis Martínez', fecha: 'Hace 3 días', puntuacion: null, texto: '¡Descansen!', origen: 'Publicación: Cerramos el 25', ref_id: 'p-1' }
  ];

  const origenesUnicos = ['Todos', ...Array.from(new Set(feedbackMock.map(f => f.origen)))];
  const comentariosFiltrados = filtroComentarios === 'Todos' ? feedbackMock : feedbackMock.filter(f => f.origen === filtroComentarios);

  useEffect(() => {
    const cargarMetricasReales = async () => {
      if (!negocioId) return;
      try {
        setIsLoading(true);
        const data = await lealtadService.obtenerDashboard(negocioId);
        setMetricasNegocio({
          calificacion_global: data.calificacion_global,
          total_resenas_globales: data.total_resenas_globales
        });
        setSucursales(data.sucursales);
        if (data.sucursales.length > 0) {
          setSucursalActiva(data.sucursales[0]);
        }
      } catch (error) {
        console.error("Error al cargar calificaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarMetricasReales();
  }, [negocioId]);

  const renderEstrellas = (calificacion: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons key={star} name={star <= Math.round(calificacion) ? "star" : "star-outline"} size={16} color="#f59e0b" />
      ))}
    </View>
  );

  if (isLoading || !sucursalActiva) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: '#64748b' }}>Calculando promedios...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsContainer}>
        <View style={[styles.card, styles.halfCard, { backgroundColor: '#1e293b' }]}>
          <Text style={[styles.sectionSubtitle, { color: '#94a3b8' }]}>Global Negocio</Text>
          <Text style={[styles.bigScore, { color: '#ffffff' }]}>{metricasNegocio.calificacion_global.toFixed(1)}</Text>
          {renderEstrellas(metricasNegocio.calificacion_global)}
          <Text style={[styles.totalReviews, { color: '#64748b', marginTop: 5 }]}>{metricasNegocio.total_resenas_globales} reseñas</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.sectionSubtitle}>Esta Sucursal</Text>
          <Text style={styles.bigScore}>{sucursalActiva.calificacion.toFixed(1)}</Text>
          {renderEstrellas(sucursalActiva.calificacion)}
          <Text style={[styles.totalReviews, { marginTop: 5 }]}>{sucursalActiva.total_resenas} reseñas</Text>
        </View>
      </View>

      <SelectorSucursales sucursales={sucursales} sucursalActiva={sucursalActiva} onSelect={setSucursalActiva} />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="chatbubbles" size={20} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Bandeja de Comentarios</Text>
          </View>
        </View>

        <View style={{ marginBottom: 15 }}>
          <DropdownButton title={`Filtro: ${filtroComentarios}`} variant="minimal" icon={<Ionicons name="filter" size={16} color="#64748b"/>}>
            {origenesUnicos.map((origen) => (
              <TouchableOpacity key={origen} style={styles.filterOption} onPress={() => setFiltroComentarios(origen)}>
                <Text style={[styles.filterOptionText, filtroComentarios === origen && styles.filterOptionTextActive]}>{origen}</Text>
                {filtroComentarios === origen && <Ionicons name="checkmark" size={16} color="#3b82f6" />}
              </TouchableOpacity>
            ))}
          </DropdownButton>
        </View>

        {comentariosFiltrados.length > 0 ? (
          comentariosFiltrados.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.commentBox, item.ref_id && styles.commentBoxClickable]}
              activeOpacity={item.ref_id ? 0.7 : 1}
              onPress={() => item.ref_id && onNavegarAWorkspace(item.tipo === 'oferta' ? 'workspaceOferta' : 'workspacePublicacion', item.ref_id)}
            >
              <View style={styles.commentHeader}>
                <View>
                  <Text style={styles.commentName}>{item.nombre}</Text>
                  <View style={styles.badgeOrigen}>
                    <Ionicons name={item.tipo === 'resena' ? "star" : (item.tipo === 'oferta' ? "gift" : "megaphone")} size={10} color="#64748b" />
                    <Text style={styles.badgeOrigenText}>{item.origen}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.commentDate}>{item.fecha}</Text>
                  {item.ref_id && <Ionicons name="open-outline" size={14} color="#3b82f6" style={{ marginTop: 5 }} />}
                </View>
              </View>
              {item.puntuacion && <View style={{ marginBottom: 6 }}>{renderEstrellas(item.puntuacion)}</View>}
              <Text style={styles.commentText}>{item.texto}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay comentarios para este filtro.</Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  metricsContainer: { flexDirection: 'row', gap: 15, marginBottom: 5 },
  halfCard: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  sectionSubtitle: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 },
  bigScore: { fontSize: 36, fontWeight: '900', color: '#1e293b' },
  totalReviews: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterOptionText: { fontSize: 13, color: '#475569' },
  filterOptionTextActive: { fontWeight: 'bold', color: '#3b82f6' },
  commentBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  commentBoxClickable: { borderColor: '#bfdbfe', backgroundColor: '#ffffff' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  commentName: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 },
  commentDate: { fontSize: 11, color: '#94a3b8' },
  badgeOrigen: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4, alignSelf: 'flex-start' },
  badgeOrigenText: { fontSize: 9, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  commentText: { fontSize: 13, color: '#334155', lineHeight: 18 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginVertical: 20 }
});