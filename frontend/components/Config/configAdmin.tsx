import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { FondoManager } from '../../ui/Fondo'; // 🌟 Importamos FondoManager
import { useAuthStore } from '../../store/useAuthStore';
import { ButtonNeo } from '../../ui/Button';
import { IconPower } from '../../ui/Icons';

export default function ConfigAdmin() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const titleColor = '#f8fafc';
  const subtitleColor = '#94a3b8';

  return (
    <FondoManager tipoFondo="pattern-dark">
      <View style={styles.container}>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: titleColor }]}>Sistema Central</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>Opciones de infraestructura, bases de datos y super-usuarios.</Text>
        </View>

        <View style={styles.logoutContainer}>
          <ButtonNeo 
            title="CERRAR SESIÓN" 
            icon={<IconPower size={28} color="#ff003c" />} 
            glowColor="#ff003c" 
            isRectangular={true} 
            onPress={handleLogout}
          />
        </View>

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  content: { alignItems: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  logoutContainer: { width: '100%', alignItems: 'center', marginBottom: 20 }
});