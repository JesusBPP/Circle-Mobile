import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { agendaService } from '../features/agenda/agendaService';

interface BuscadorUsuariosProps {
  negocioId: number;
  onSelect: (usuario: any) => void;
  placeholder?: string;
}

export const BuscadorUsuarios = ({ negocioId, onSelect, placeholder = "Buscar por nombre o correo..." }: BuscadorUsuariosProps) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color="#94a3b8" />
        <TextInput 
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleBuscar}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar} disabled={isSearching || query.length < 3}>
          {isSearching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.searchBtnText}>Buscar</Text>}
        </TouchableOpacity>
      </View>

      {/* Resultados Flotantes o Inline */}
      {hasSearched && (
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
  resultsContainer: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginTop: 5, maxHeight: 200 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6' },
  resultName: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
  resultEmail: { fontSize: 11, color: '#64748b' },
  noResults: { padding: 15, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }
});