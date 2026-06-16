import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductoCatalogo } from './BuscadorCatalogo';

interface CardProductoEstrellaProps {
  producto: ProductoCatalogo;
  multiplicador: number;
  onMultiplicadorChange: (valor: number) => void;
  onEliminar: () => void;
}

export default function CardProductoEstrella({
  producto,
  multiplicador,
  onMultiplicadorChange,
  onEliminar,
}: CardProductoEstrellaProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={producto.tipo_producto === 'servicio' ? 'construct-outline' : 'cube-outline'}
            size={18}
            color="#6b21a8"
          />
          <Text style={styles.nombre} numberOfLines={1}>{producto.nombre}</Text>
        </View>
        <TouchableOpacity onPress={onEliminar} style={styles.deleteBtn}>
          <Ionicons name="close-circle" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Multiplicador:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={multiplicador.toString()}
            onChangeText={(t) => {
              const val = parseFloat(t);
              if (!isNaN(val) && val >= 1.0) onMultiplicadorChange(val);
              else if (t === '') onMultiplicadorChange(1.0);
            }}
            keyboardType="decimal-pad"
            placeholder="1.0"
            placeholderTextColor="#cbd5e1"
          />
          <Text style={styles.unit}>x</Text>
        </View>
      </View>
      <Text style={styles.costo}>Costo base: ${producto.costo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e9d5ff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  nombre: { fontSize: 14, fontWeight: '700', color: '#1e293b', flex: 1 },
  deleteBtn: { padding: 4 },
  body: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b21a8' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: '#334155', width: 70, textAlign: 'center' },
  unit: { fontSize: 14, fontWeight: '700', color: '#6b21a8' },
  costo: { fontSize: 11, color: '#94a3b8' },
});
