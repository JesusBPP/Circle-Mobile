import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lealtadService from '../../features/lealtad/lealtadService';

// 🌟 Tipado estricto alineado con el payload del Backend (Feed Items)
export interface OfertaFeedItem {
  id: string;
  id_real: number;
  type: string;
  id_sucursales: number;
  nombre_sucursal: string;
  titulo: string;
  descripcion: string;
  estado: string;
  es_publica: boolean;
  costo_en_puntos: number | null;
  limite_existencias: number | null;
  limite_por_usuario: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  fecha: string;
  total_canjes: number;
  stock_restante: number | null;
  reglas?: Array<{
    id: number;
    tipo_regla: string;
    id_servicio_disponible: number | null;
    nombre_servicio_disponible: string | null;
    tipo_servicio_disponible: string | null;
    cantidad: number | null;
    porcentaje_descuento: number | null;
    monto_descuento: number | null;
    monto_minimo: number | null;
  }>;
}

interface OfertaCardProps {
  data: OfertaFeedItem; 
  onPress: () => void;
  onEliminar?: () => void;
}

export default function OfertaCard({ data, onPress, onEliminar }: OfertaCardProps) {
  // Manejamos el estado en minúsculas por si la BD cambia de convención
  const isActiva = data.estado?.toLowerCase() === 'activa';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.badgeWrapper, isActiva ? styles.badgeActive : styles.badgeInactive]}>
          <Ionicons name={isActiva ? "star" : "star-outline"} size={14} color={isActiva ? "#f59e0b" : "#94a3b8"} />
          <Text style={[styles.badgeText, isActiva ? styles.textActive : styles.textInactive]}>
            {isActiva ? 'OFERTA ACTIVA' : 'INACTIVA'}
          </Text>
        </View>
        <Text style={styles.typeText}>{data.es_publica ? 'Pública' : 'VIP (Whitelist)'}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>{data.titulo}</Text>
      <Text style={styles.cardSubtitle}>📍 {data.nombre_sucursal}</Text>
      <Text style={styles.description} numberOfLines={2}>{data.descripcion}</Text>

      <View style={styles.footer}>
        <View style={styles.statBox}>
          <Ionicons name="gift-outline" size={16} color="#64748b" />
          <Text style={styles.statText}>
            {data.costo_en_puntos !== null ? `${data.costo_en_puntos} Pts` : 'Gratis'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="cube-outline" size={16} color="#64748b" />
          <Text style={styles.statText}>
            {data.limite_existencias !== null ? `${data.limite_existencias} disp.` : 'Ilimitado'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert(
              'Eliminar Oferta',
              '¿Estás seguro? Esta acción no se puede deshacer.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await lealtadService.eliminarOferta(data.id_real);
                      Alert.alert('Éxito', 'Oferta eliminada correctamente.');
                      if (onEliminar) onEliminar();
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'No se pudo eliminar la oferta.');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeActive: { backgroundColor: '#fef3c7' },
  badgeInactive: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  textActive: { color: '#d97706' },
  textInactive: { color: '#64748b' },
  typeText: { fontSize: 12, fontWeight: '600', color: '#0ea5e9' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  cardSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  description: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 15 },
  footer: { flexDirection: 'row', gap: 15 },
  statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  statText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  deleteButton: { marginLeft: 'auto', padding: 8 }
});