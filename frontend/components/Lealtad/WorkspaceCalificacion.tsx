import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WorkspaceCalificacion() {
  // 🌟 MOCK DATA (Mapeo a Resenas_Sucursales y Comentarios)
  const metricasGlobales = {
    calificacion_promedio: 4.8,
    total_resenas: 125,
  };

  const feedbackMock = [
    {
      id: 1,
      tipo: 'resena',
      nombre: 'Juan Consumidor',
      fecha: 'Hoy',
      puntuacion: 5,
      texto: '¡El mejor café de la ciudad, el lugar está impecable!',
      origen: 'Reseña de Sucursal'
    },
    {
      id: 2,
      tipo: 'comentario_oferta',
      nombre: 'Ana García',
      fecha: 'Ayer',
      puntuacion: null,
      texto: '¿La promo de 2x1 aplica también en fin de semana?',
      origen: 'Oferta: 2x1 en Corte'
    },
    {
      id: 3,
      tipo: 'comentario_post',
      nombre: 'Luis Martínez',
      fecha: 'Hace 3 días',
      puntuacion: null,
      texto: '¡Felices fiestas, descansen!',
      origen: 'Publicación: Cerramos el 25'
    }
  ];

  const renderEstrellas = (calificacion: number) => {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons 
            key={star} 
            name={star <= calificacion ? "star" : "star-outline"} 
            size={16} 
            color="#f59e0b" 
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🌟 1. TARJETA DE MÉTRICAS GLOBALES */}
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 30 }]}>
        <Text style={styles.sectionSubtitle}>Calificación Promedio de Sucursal</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.bigScore}>{metricasGlobales.calificacion_promedio}</Text>
          <Text style={styles.maxScore}>/ 5.0</Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          {renderEstrellas(Math.round(metricasGlobales.calificacion_promedio))}
        </View>
        <Text style={styles.totalReviews}>Basado en {metricasGlobales.total_resenas} clientes (CRM)</Text>
      </View>

      {/* 🌟 2. BANDEJA DE ENTRADA (FEEDBACK GLOBAL) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubbles" size={20} color="#8b5cf6" />
          <Text style={styles.cardTitle}>Bandeja de Comentarios</Text>
        </View>

        {feedbackMock.map((item) => (
          <View key={item.id} style={styles.commentBox}>
            <View style={styles.commentHeader}>
              <View>
                <Text style={styles.commentName}>{item.nombre}</Text>
                <View style={styles.badgeOrigen}>
                  <Ionicons 
                    name={item.tipo === 'resena' ? "star" : (item.tipo === 'comentario_oferta' ? "gift" : "megaphone")} 
                    size={10} 
                    color="#64748b" 
                  />
                  <Text style={styles.badgeOrigenText}>{item.origen}</Text>
                </View>
              </View>
              <Text style={styles.commentDate}>{item.fecha}</Text>
            </View>
            
            {item.puntuacion && (
              <View style={{ marginBottom: 6 }}>
                {renderEstrellas(item.puntuacion)}
              </View>
            )}
            
            <Text style={styles.commentText}>{item.texto}</Text>
          </View>
        ))}
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
  sectionSubtitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 },
  
  // Estilos de Calificación
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 5 },
  bigScore: { fontSize: 48, fontWeight: '900', color: '#1e293b' },
  maxScore: { fontSize: 20, fontWeight: '700', color: '#94a3b8' },
  totalReviews: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  // Estilos de Comentarios
  commentBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  commentName: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 },
  commentDate: { fontSize: 11, color: '#94a3b8' },
  badgeOrigen: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  badgeOrigenText: { fontSize: 9, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  commentText: { fontSize: 13, color: '#334155', lineHeight: 18 },
});