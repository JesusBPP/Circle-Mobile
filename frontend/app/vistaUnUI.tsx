import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// 🌟 Importamos nuestro componente final
import { RadialMenuHome } from '../ui/RadialMenu';

export default function VistaUnUI() {
  
  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const handleGoToSandbox = () => {
    // Usamos push para apilar la pantalla y poder volver fácilmente
    router.push('/sandbox');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Menú Principal</Text>
        <Text style={styles.subtitle}>Variante: RadialMenuHome Dinámico</Text>
      </View>

      <View style={styles.componentShowcase}>
        {/* Renderizamos el menú interactivo */}
        <RadialMenuHome />
      </View>

      {/* Contenedor inferior para agrupar los botones */}
      <View style={styles.buttonsContainer}>
        {/* NUEVO BOTÓN: Navega al Sandbox */}
        <TouchableOpacity 
          style={styles.sandboxButton} 
          onPress={handleGoToSandbox}
          activeOpacity={0.8}
        >
          <Text style={styles.sandboxButtonText}>Ir a Sandbox</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(250, 250, 250)', // Tu fondo configurado
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingVertical: 50,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b', // Color oscuro para fondo claro
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', 
    marginTop: 8,
  },
  componentShowcase: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
  },
  sandboxButton: {
    backgroundColor: 'rgb(15, 82, 186)', // Usamos el Azul Sapphire de tu paleta
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, 
    marginBottom: 15,
    width: '70%', // Ancho uniforme para que se vea ordenado
    alignItems: 'center',
    elevation: 3, // Ligera sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sandboxButtonText: {
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#94a3b8', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, 
    marginBottom: 10,
    width: '70%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  }
});