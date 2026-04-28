import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MenuSoluciones() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogo de Soluciones</Text>
      <Text style={styles.subtitle}>Próximamente aquí estarán las soluciones...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 10 }
});