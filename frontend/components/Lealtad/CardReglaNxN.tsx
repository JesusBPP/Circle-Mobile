import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductoCatalogo } from './BuscadorCatalogo';

interface CardReglaNxNProps {
  producto: ProductoCatalogo;
  cantidad: number;
  porcentajeDescuento: number | null;
  montoDescuento: number | null;
  montoMinimo: number | null;
  esRequisito: boolean;
  onCantidadChange: (valor: number) => void;
  onPorcentajeChange: (valor: number | null) => void;
  onMontoDescuentoChange: (valor: number | null) => void;
  onMontoMinimoChange: (valor: number | null) => void;
  onEliminar: () => void;
}

export default function CardReglaNxN({
  producto,
  cantidad,
  porcentajeDescuento,
  montoDescuento,
  montoMinimo,
  esRequisito,
  onCantidadChange,
  onPorcentajeChange,
  onMontoDescuentoChange,
  onMontoMinimoChange,
  onEliminar,
}: CardReglaNxNProps) {
  const colorAccent = esRequisito ? '#f59e0b' : '#10b981';
  const bgAccent = esRequisito ? '#fffbeb' : '#ecfdf5';

  return (
    <View style={[styles.card, { borderLeftColor: colorAccent }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: bgAccent }]}>
            <Ionicons
              name={esRequisito ? 'checkmark-circle' : 'gift'}
              size={14}
              color={colorAccent}
            />
            <Text style={[styles.badgeText, { color: colorAccent }]}>
              {esRequisito ? 'REQ' : 'REC'}
            </Text>
          </View>
          <Ionicons
            name={producto.tipo_producto === 'servicio' ? 'construct-outline' : 'cube-outline'}
            size={16}
            color="#475569"
          />
          <Text style={styles.nombre} numberOfLines={1}>{producto.nombre}</Text>
        </View>
        <TouchableOpacity onPress={onEliminar} style={styles.deleteBtn}>
          <Ionicons name="close-circle" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldsRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Cantidad</Text>
          <TextInput
            style={styles.input}
            value={cantidad.toString()}
            onChangeText={(t) => {
              const val = parseInt(t);
              onCantidadChange(isNaN(val) || val < 1 ? 1 : val);
            }}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#cbd5e1"
          />
        </View>

        {!esRequisito && (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>% Desc.</Text>
              <TextInput
                style={styles.input}
                value={porcentajeDescuento !== null ? porcentajeDescuento.toString() : ''}
                onChangeText={(t) => {
                  if (t === '') { onPorcentajeChange(null); return; }
                  const val = parseFloat(t);
                  if (!isNaN(val)) {
                    const clamped = Math.min(100, Math.max(1, val));
                    onPorcentajeChange(clamped);
                    onMontoDescuentoChange(null);
                  }
                }}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor="#cbd5e1"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>$ Desc.</Text>
              <TextInput
                style={styles.input}
                value={montoDescuento !== null ? montoDescuento.toString() : ''}
                onChangeText={(t) => {
                  if (t === '') { onMontoDescuentoChange(null); return; }
                  const val = parseFloat(t);
                  if (!isNaN(val) && val >= 0) {
                    onMontoDescuentoChange(val);
                    onPorcentajeChange(null);
                  }
                }}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor="#cbd5e1"
              />
            </View>
          </>
        )}

        {esRequisito && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>$ Mín.</Text>
            <TextInput
              style={styles.input}
              value={montoMinimo !== null ? montoMinimo.toString() : ''}
              onChangeText={(t) => {
                if (t === '') { onMontoMinimoChange(null); return; }
                const val = parseFloat(t);
                if (!isNaN(val) && val >= 0) onMontoMinimoChange(val);
              }}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  nombre: { fontSize: 13, fontWeight: '700', color: '#1e293b', flex: 1 },
  deleteBtn: { padding: 4 },
  fieldsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  field: { flex: 1, minWidth: 70 },
  fieldLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, color: '#334155', textAlign: 'center' },
});
