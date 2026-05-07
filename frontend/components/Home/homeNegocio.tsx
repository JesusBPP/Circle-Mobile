import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router'; 

import { FondoManager } from '../../ui/Fondo';
import { RadialMenuHome } from '../../ui/RadialMenu';
import { useAuthStore } from '../../store/useAuthStore';
import { homeService } from '../../features/home/homeService';
// 🌟 Importamos el servicio
import { solucionesService } from '../../features/soluciones/solucionesService';

export default function HomeNegocio() {
  const { userName, negocioName, sucursalName, setDashboardData, herramientasActivas, setHerramientas } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await homeService.getDashboardInfo();
        
        setDashboardData(
          data.nombre_usuario, 
          data.nombre_negocio, 
          data.nombre_sucursal,
          data.id_negocio 
        );
        
        if (data.id_negocio) {
          const solucionesDb = await solucionesService.obtenerSoluciones(data.id_negocio);
          
          const herramientasFormateadas = solucionesDb.map((item: any) => {
            let iconoAsignado = 'apps-outline';
            if (item.solucion.nombre.toLowerCase() === 'agenda') iconoAsignado = 'calendar';
            if (item.solucion.nombre.toLowerCase() === 'lealtad') iconoAsignado = 'star';

            return {
              id: item.solucion.id, // 🌟 CORRECCIÓN CRUCIAL: Rescatamos el ID de la base de datos
              nombre: item.solucion.nombre,
              ruta: item.solucion.ruta_frontend || `/(screens)/${item.solucion.nombre.toLowerCase()}`,
              icono: iconoAsignado
            };
          });

          // Guardamos las herramientas con ID incluido en el estado global
          setHerramientas(herramientasFormateadas);
        }

      } catch (error) {
        console.log("Error al cargar los datos del dashboard:", error);
      }
    };
    fetchDashboardData();
  }, []); 

  const titleColor = '#1e293b';
  const subtitleColor = '#64748b';
  const headerGlassColor = 'rgba(255, 255, 255, 0.7)';

  const dynamicItems = herramientasActivas.map((herramienta) => ({
    icon: herramienta.icono,
    onPress: () => router.push(herramienta.ruta as any)
  }));

  const menuItems = [
    ...dynamicItems, 
    { 
      icon: 'add-outline', 
      onPress: () => router.push('/(screens)/menuSoluciones') 
    },
    { 
      icon: 'settings-outline', 
      onPress: () => router.push('/(tabs)/config') 
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