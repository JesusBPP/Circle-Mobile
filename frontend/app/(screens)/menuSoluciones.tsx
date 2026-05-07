import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router'; 

import { FondoManager } from '../../ui/Fondo';
import { ButtonCardSolucion } from '../../ui/Button'; 
import { BannerTemp } from '../../components/Catalogo/BannerTemp';
import { useAuthStore } from '../../store/useAuthStore';

// Importamos el servicio
import { solucionesService } from '../../features/soluciones/solucionesService';

export default function MenuSoluciones() {
  const { addHerramienta, negocioId } = useAuthStore();

  const [solucionEnProceso, setSolucionEnProceso] = useState<{id: number, nombre: string, ruta: string, icono: string} | null>(null);

  const handleStartInstall = (id: number, nombre: string, ruta: string, icono: string) => {
    setSolucionEnProceso({ id, nombre, ruta, icono });
  };

  const handleCancelInstall = () => {
    setSolucionEnProceso(null);
  };

  const handleCompleteInstall = async () => {
    if (solucionEnProceso) {
      try {
        if (!negocioId) {
          Alert.alert("Error", "No se encontró tu ID de negocio. Inicia sesión nuevamente.");
          setSolucionEnProceso(null);
          return;
        }

        // 1. Llamada REAL al Backend
        await solucionesService.instalarSolucion(negocioId, solucionEnProceso.id);

        // 2. 🌟 CORRECCIÓN: Ahora le pasamos el ID a Zustand
        addHerramienta({
          id: solucionEnProceso.id, 
          nombre: solucionEnProceso.nombre,
          ruta: solucionEnProceso.ruta,
          icono: solucionEnProceso.icono
        });

        const rutaDestino = solucionEnProceso.ruta;
        
        // 3. Cerramos y navegamos a la pantalla instalada
        setSolucionEnProceso(null);
        router.push(rutaDestino as any);

      } catch (error: any) {
        Alert.alert("No se pudo instalar", error.message);
        setSolucionEnProceso(null);
      }
    }
  };

  return (
    <FondoManager tipoFondo="pattern-light">
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Catálogo de Soluciones</Text>
          <Text style={styles.subtitle}>Potencia tu negocio con nuevas herramientas digitales de alto nivel.</Text>
        </View>

        <ScrollView style={styles.catalogContainer} showsVerticalScrollIndicator={false}>
          
          <ButtonCardSolucion 
            title="Agenda"
            description="Gestión inteligente de citas y reservas en tiempo real."
            iconName="calendar"
            watermarkIconName="calendar-outline"
            gradientColors={['#1e3a8a', '#3b82f6', '#00d4ff']} 
            shadowColor="#3b82f6"
            onPress={() => handleStartInstall(1, 'Agenda', '/(screens)/agenda', 'calendar')}
          />

          <ButtonCardSolucion 
            title="Lealtad"
            description="Fideliza a tus clientes con puntos, sellos y ofertas dinámicas."
            iconName="star"
            watermarkIconName="star-outline"
            gradientColors={['#4c1d95', '#8b5cf6', '#d946ef']} 
            shadowColor="#8b5cf6"
            // 🌟 Al finalizar la instalación, esto ruteará a /(screens)/lealtad automáticamente
            onPress={() => handleStartInstall(2, 'Lealtad', '/(screens)/lealtad', 'star')}
          />

        </ScrollView>

        <BannerTemp 
          isVisible={solucionEnProceso !== null}
          solucionNombre={solucionEnProceso?.nombre || ''}
          onCancel={handleCancelInstall}
          onComplete={handleCompleteInstall}
        />

      </View>
    </FondoManager>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 40, marginTop: 10 },
  title: { fontSize: 34, fontWeight: '800', color: '#0f172a', letterSpacing: 0.5, textShadowColor: 'rgba(0, 0, 0, 0.05)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: 16, color: '#475569', marginTop: 10, lineHeight: 24, fontWeight: '400', letterSpacing: 0.3 },
  catalogContainer: { flex: 1, width: '100%' }
});