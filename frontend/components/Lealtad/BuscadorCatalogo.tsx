import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, Dimensions } from 'react-native';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_DROPDOWN_HEIGHT = 280;

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
  const [posInput, setPosInput] = useState({ y: 0, h: 0, x: 0, w: 0 });
  const inputWrapperRef = useRef<View>(null);

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

  const medirInput = () => {
    inputWrapperRef.current?.measureInWindow((x, y, width, height) => {
      setPosInput({ y, h: height, x, w: width });
    });
  };

  const cerrar = () => {
    setMostrarLista(false);
    setBusqueda('');
  };

  const dropdownHeight = Math.min(MAX_DROPDOWN_HEIGHT, filtrados.length * 56 + 16);
  const espacioAbajo = SCREEN_HEIGHT - (posInput.y + posInput.h);
  const espacioArriba = posInput.y;
  const mostrarAbajo = espacioAbajo >= dropdownHeight + 8 || espacioAbajo >= espacioArriba;
  const topDropdown = mostrarAbajo
    ? posInput.y + posInput.h + 4
    : Math.max(20, posInput.y - dropdownHeight - 4);

  return (
    <View style={styles.container}>
      <View
        style={styles.inputWrapper}
        ref={inputWrapperRef}
        onLayout={medirInput}
      >
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.input}
          value={busqueda}
          onChangeText={(t) => { setBusqueda(t); if (!mostrarLista) setMostrarLista(true); }}
          onFocus={() => { medirInput(); setMostrarLista(true); }}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={mostrarLista}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrar}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={cerrar}
        >
          <View
            style={[
              styles.dropdownContainer,
              {
                top: topDropdown,
                left: posInput.x,
                width: posInput.w || 300,
                maxHeight: dropdownHeight,
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              style={styles.dropdownScroll}
              contentContainerStyle={styles.dropdownContent}
              showsVerticalScrollIndicator={filtrados.length > 4}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              nestedScrollEnabled
            >
              {filtrados.length > 0 ? (
                filtrados.map((item) => (
                  <Pressable
                    key={item.id.toString()}
                    style={({ pressed }) => [
                      styles.item,
                      isSelected(item.id) && styles.itemSelected,
                      pressed && styles.itemPressed,
                    ]}
                    onPress={() => {
                      toggleSeleccion(item);
                      cerrar();
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
                  </Pressable>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={20} color="#cbd5e1" />
                  <Text style={styles.noResultsText}>
                    {busqueda.length > 0 ? `Sin resultados para "${busqueda}"` : 'Todos los items ya seleccionados'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, zIndex: 1000 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, fontSize: 14, color: '#334155', paddingVertical: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownScroll: { borderRadius: 12 },
  dropdownContent: { paddingVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 },
  itemSelected: { backgroundColor: '#eff6ff' },
  itemPressed: { backgroundColor: '#f1f5f9' },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  itemNombreSelected: { color: '#2563eb' },
  itemTipo: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  noResults: { alignItems: 'center', padding: 20, gap: 6 },
  noResultsText: { fontSize: 13, color: '#94a3b8' },
});
