import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router'; 

import { FondoManager } from '../../ui/Fondo';
import { RadialMenuHome } from '../../ui/RadialMenu';
import { useAuthStore } from '../../store/useAuthStore';
import { homeService } from '../../features/home/homeService';

export default function HomeNegocio() {
  const { userName, negocioName, sucursalName, setDashboardData } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await homeService.getDashboardInfo();
        setDashboardData(data.nombre_usuario, data.nombre_negocio, data.nombre_sucursal);
      } catch (error) {
        console.log("Error al cargar los datos del dashboard:", error);
      }
    };
    fetchDashboardData();
  }, []); 

  const titleColor = '#1e293b';
  const subtitleColor = '#64748b';
  const headerGlassColor = 'rgba(255, 255, 255, 0.7)';

  const menuItems = [
    { 
      icon: 'add-outline', 
      onPress: () => router.push('/menuSoluciones') 
    },
    { 
      icon: 'settings-outline', 
      // 🌟 CAMBIO: Navegamos a la pestaña general de Configuración
      onPress: () => router.push('/config') 
    }
  ];

  return (
    <FondoManager tipoFondo="pattern-light">
      <View style={styles.container}>
        
        <View style={[styles.header, { backgroundColor: headerGlassColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>
            Bienvenido {userName}
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Administración de {negocioName} en {sucursalName}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.menuBackgroundCircle} />
          <RadialMenuHome items={menuItems} />
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
  menuBackgroundCircle: { position: 'absolute', backgroundColor: '#FFFFFF', width: 130, height: 130, borderRadius: 65, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }
});