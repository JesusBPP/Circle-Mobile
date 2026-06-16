import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import lealtadService from '../../features/lealtad/lealtadService';

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  costo: number;
  tipo_producto: string;
  url_imagen?: string;
}

interface BuscadorCatalogoProps {
  idNegocio: number;
  seleccionados: ProductoCatalogo[];
  onSeleccionChange: (productos: ProductoCatalogo[]) => void;
  maxVisible?: number;
  placeholder?: string;
}

export default function BuscadorCatalogo({
  idNegocio,
  seleccionados,
  onSeleccionChange,
  maxVisible = 4,
  placeholder = 'Buscar producto o servicio...',
}: BuscadorCatalogoProps) {
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const datos = await lealtadService.obtenerServiciosDisponibles(idNegocio);
      setCatalogo(datos);
    };
    cargar();
  }, [idNegocio]);

  const filtrados = catalogo.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    !seleccionados.find(s => s.id === p.id)
  );

  const toggleSeleccion = (producto: ProductoCatalogo) => {
    const existe = seleccionados.find(s => s.id === producto.id);
    if (existe) {
      onSeleccionChange(seleccionados.filter(s => s.id !== producto.id));
    } else {
      onSeleccionChange([...seleccionados, producto]);
    }
  };

  const isSelected = (id: number) => seleccionados.some(s => s.id === id);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.input}
          value={busqueda}
          onChangeText={(t) => { setBusqueda(t); setMostrarLista(true); }}
          onFocus={() => setMostrarLista(true)}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => { setBusqueda(''); setMostrarLista(false); }}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {mostrarLista && filtrados.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={filtrados.slice(0, maxVisible * 3)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, isSelected(item.id) && styles.itemSelected]}
                onPress={() => {
                  toggleSeleccion(item);
                  setMostrarLista(false);
                }}
              >
                <Ionicons
                  name={item.tipo_producto === 'servicio' ? 'construct-outline' : 'cube-outline'}
                  size={16}
                  color={isSelected(item.id) ? '#2563eb' : '#64748b'}
                />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemNombre, isSelected(item.id) && styles.itemNombreSelected]} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <Text style={styles.itemTipo}>{item.tipo_producto === 'servicio' ? 'Servicio' : 'Producto'} — ${item.costo}</Text>
                </View>
                {isSelected(item.id) && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {mostrarLista && filtrados.length === 0 && busqueda.length > 0 && (
        <View style={styles.dropdown}>
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={20} color="#cbd5e1" />
            <Text style={styles.noResultsText}>Sin resultados para "{busqueda}"</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, fontSize: 14, color: '#334155', paddingVertical: 10 },
  dropdown: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginTop: 4, maxHeight: 200, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 },
  itemSelected: { backgroundColor: '#eff6ff' },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  itemNombreSelected: { color: '#2563eb' },
  itemTipo: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  noResults: { alignItems: 'center', padding: 20, gap: 6 },
  noResultsText: { fontSize: 13, color: '#94a3b8' },
});
