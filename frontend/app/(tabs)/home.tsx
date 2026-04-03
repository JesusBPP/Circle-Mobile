import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  
  const handleLogout = () => {
    // Aquí en el futuro borraremos el token de seguridad del teléfono
    // Por ahora, solo lo regresamos a la pantalla de login
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a Circle!</Text>
      <Text style={styles.subtitle}>Tu dashboard principal cargará aquí pronto.</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#ef4444', // Rojo para la acción de salir
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});