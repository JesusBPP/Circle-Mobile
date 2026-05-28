import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DropdownButton } from '../../ui/DropdownButton';

// 🌟 Tipado estricto alineado con el schema 'MetricasSucursal' del Backend
export interface SucursalData {
  id: number;
  nombre: string;
  calificacion: number;
  total_resenas: number;
}

interface SelectorSucursalesProps {
  sucursales: SucursalData[];
  sucursalActiva: SucursalData;
  onSelect: (sucursal: SucursalData) => void;
}

export default function SelectorSucursales({ sucursales, sucursalActiva, onSelect }: SelectorSucursalesProps) {
  return (
    <View style={styles.container}>
      <DropdownButton 
        title={`Sucursal: ${sucursalActiva.nombre}`} 
        variant="outline"
        icon={<Ionicons name="storefront-outline" size={18} color="#3b82f6" />}
      >
        {sucursales.map((sucursal) => {
          const isSelected = sucursal.id === sucursalActiva.id;
          return (
            <TouchableOpacity 
              key={sucursal.id} 
              style={[styles.itemCard, isSelected && styles.itemCardSelected]}
              activeOpacity={0.7}
              onPress={() => onSelect(sucursal)}
            >
              <View style={styles.itemInfo}>
                <Text style={[styles.itemNombre, isSelected && styles.itemNombreSelected]}>
                  {sucursal.nombre}
                </Text>
                <Text style={styles.itemResenas}>{sucursal.total_resenas} reseñas</Text>
              </View>
              
              <View style={styles.itemCalificacionBox}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.itemCalificacion}>{sucursal.calificacion.toFixed(1)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </DropdownButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#ffffff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  itemCardSelected: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 2 },
  itemNombreSelected: { color: '#2563eb' },
  itemResenas: { fontSize: 11, color: '#64748b' },
  itemCalificacionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, borderWidth: 1, borderColor: '#fef3c7' },
  itemCalificacion: { fontSize: 13, fontWeight: 'bold', color: '#b45309' }
});