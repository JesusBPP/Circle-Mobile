import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🌟 Tipado estricto alineado con el payload del Backend (Feed Items)
export interface PublicacionFeedItem {
  id: string;
  id_real: number;
  type: string;
  titulo: string;
  descripcion: string;
  habilitar_comentarios: boolean;
  id_oferta: number | null;
  fecha: string;
}

interface PublicacionCardProps {
  data: PublicacionFeedItem;
  onPress: () => void;
}

export default function PublicacionCard({ data, onPress }: PublicacionCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.badgeWrapper}>
          <Ionicons name="megaphone" size={14} color="#8b5cf6" />
          <Text style={styles.badgeText}>PUBLICACIÓN</Text>
        </View>
        <Text style={styles.dateText}>{data.fecha}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>{data.titulo}</Text>
      <Text style={styles.description} numberOfLines={2}>{data.descripcion}</Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name={data.habilitar_comentarios ? "chatbubble-outline" : "chatbubble-ellipses-outline"} size={16} color="#94a3b8" />
          <Text style={styles.footerText}>
            {data.habilitar_comentarios ? 'Comentarios act.' : 'Comentarios desact.'}
          </Text>
        </View>
        {data.id_oferta !== null && (
          <View style={styles.footerBadge}>
            <Ionicons name="link" size={12} color="#10b981" />
            <Text style={styles.footerBadgeText}>Oferta Vinculada</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 0.5 },
  dateText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  description: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#94a3b8' },
  footerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  footerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#10b981' }
});