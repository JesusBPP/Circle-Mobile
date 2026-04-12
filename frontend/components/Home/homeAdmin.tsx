import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router'; 

import { FondoManager } from '../../ui/Fondo';
import { RadialMenuHome } from '../../ui/RadialMenu';
import { useAuthStore } from '../../store/useAuthStore';

export default function HomeAdmin() {
  const { userName } = useAuthStore();

  const titleColor = '#f8fafc';
  const subtitleColor = '#94a3b8';
  const headerGlassColor = 'rgba(255, 255, 255, 0.05)';

  const adminMenuItems = [
    { 
      icon: 'construct-outline', 
      onPress: () => router.push('/sandbox') 
    },
    { 
      icon: 'eye-outline', 
      onPress: () => router.push('/vistaUnUI') 
    },
    { 
      icon: 'settings-outline', 
      // 🌟 CAMBIO: Navegamos a la pestaña general de Configuración
      onPress: () => router.push('/config') 
    }
  ];

  return (
    <FondoManager tipoFondo="pattern-dark">
      <View style={styles.container}>
        
        <View style={[styles.header, { backgroundColor: headerGlassColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>
            Bienvenido {userName}
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Panel de Administración Global
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.menuBackgroundCircle} />
          <RadialMenuHome items={adminMenuItems} />
        </View>

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 140 },
  header: { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { fontSize: 14, marginTop: 5, textAlign: 'center' },
  menuContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' },
  menuBackgroundCircle: { position: 'absolute', backgroundColor: '#e6e6e6', width: 130, height: 130, borderRadius: 65, shadowColor: '#00e5ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 2 }
});