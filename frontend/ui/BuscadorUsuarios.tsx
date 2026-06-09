import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { agendaService } from '../features/agenda/agendaService';
import lealtadService from '../features/lealtad/lealtadService';

interface BuscadorUsuariosProps {
  negocioId: number;
  onSelect: (usuario: any) => void;
  placeholder?: string;
  cargarAfiliadosPorDefecto?: boolean;
  idsExcluidos?: number[];
}

export const BuscadorUsuarios = ({ negocioId, onSelect, placeholder = "Buscar por nombre o correo...", cargarAfiliadosPorDefecto = false, idsExcluidos = [] }: BuscadorUsuariosProps) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [afiliados, setAfiliados] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cargandoAfiliados, setCargandoAfiliados] = useState(false);

  useEffect(() => {
    if (cargarAfiliadosPorDefecto) {
      cargarAfiliados();
    }
  }, [negocioId, cargarAfiliadosPorDefecto]);

  const cargarAfiliados = async () => {
    setCargandoAfiliados(true);
    const data = await lealtadService.obtenerConsumidoresAfiliados(negocioId);
    setAfiliados(data);
    setCargandoAfiliados(false);
  };

  const handleBuscar = async () => {
    if (query.length < 3) return;
    setIsSearching(true);
    setHasSearched(true);
    const data = await agendaService.buscarConsumidores(negocioId, query);
    setResultados(data);
    setIsSearching(false);
  };

  const handleSeleccionar = (usr: any) => {
    onSelect(usr);
    setQuery('');
    setResultados([]);
    setHasSearched(false);
  };

  const afiliadosFiltrados = afiliados.filter(a => {
    if (idsExcluidos.includes(a.id)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return a.nombre.toLowerCase().includes(q) || a.correo.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color="#94a3b8" />
        <TextInput 
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (cargarAfiliadosPorDefecto && text.length < 3) {
              setHasSearched(false);
            }
          }}
          onSubmitEditing={cargarAfiliadosPorDefecto ? undefined : handleBuscar}
        />
        {!cargarAfiliadosPorDefecto && (
          <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar} disabled={isSearching || query.length < 3}>
            {isSearching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.searchBtnText}>Buscar</Text>}
          </TouchableOpacity>
        )}
      </View>

      {cargarAfiliadosPorDefecto && cargandoAfiliados && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0ea5e9" />
          <Text style={styles.loadingText}>Cargando clientes afiliados...</Text>
        </View>
      )}

      {cargarAfiliadosPorDefecto && !cargandoAfiliados && afiliadosFiltrados.length > 0 && (
        <ScrollView style={styles.resultsContainer} nestedScrollEnabled={true}>
          {afiliadosFiltrados.map(usr => (
            <TouchableOpacity key={usr.id} style={styles.resultItem} onPress={() => handleSeleccionar(usr)}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{usr.nombre.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{usr.nombre}</Text>
                <Text style={styles.resultEmail}>{usr.correo}</Text>
              </View>
              <Ionicons name="add-circle" size={20} color="#3b82f6" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {cargarAfiliadosPorDefecto && !cargandoAfiliados && afiliadosFiltrados.length === 0 && query.trim().length > 0 && (
        <Text style={styles.noResults}>No se encontraron clientes afiliados.</Text>
      )}

      {!cargarAfiliadosPorDefecto && hasSearched && (
        <View style={styles.resultsContainer}>
          {resultados.length > 0 ? (
            resultados.map(usr => (
              <TouchableOpacity key={usr.id} style={styles.resultItem} onPress={() => handleSeleccionar(usr)}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{usr.nombre.charAt(0)}</Text></View>
                <View>
                  <Text style={styles.resultName}>{usr.nombre}</Text>
                  <Text style={styles.resultEmail}>{usr.correo}</Text>
                </View>
                <Ionicons name="add-circle" size={20} color="#3b82f6" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>No se encontraron clientes.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingLeft: 12, paddingRight: 5, paddingVertical: 5 },
  input: { flex: 1, fontSize: 13, color: '#1e293b', marginLeft: 8 },
  searchBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  searchBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  resultsContainer: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginTop: 5, maxHeight: 250 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6' },
  resultName: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
  resultEmail: { fontSize: 11, color: '#64748b' },
  noResults: { padding: 15, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
  loadingText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' }
});