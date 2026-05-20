import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface FiltrosLealtadProps {
  filtroActivo: string;
  setFiltroActivo: (filtro: string) => void;
}

export default function FiltrosLealtad({ filtroActivo, setFiltroActivo }: FiltrosLealtadProps) {
  // 🌟 NUEVO ORDEN Y NUEVO BOTÓN AÑADIDO
  const filtros = ['Ofertas Activas', 'Ofertas', 'Publicaciones', 'Todas', 'Calificación'];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filtros.map((filtro) => {
          const isActive = filtroActivo === filtro;
          return (
            <TouchableOpacity
              key={filtro}
              style={[styles.pill, isActive && styles.pillActive]}
              activeOpacity={0.7}
              onPress={() => setFiltroActivo(filtro)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filtro}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: '#3b82f6', 
    borderColor: '#2563eb',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
  }
});